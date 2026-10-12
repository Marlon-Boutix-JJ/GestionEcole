import express from 'express';
import ReportCard from '../models/ReportCard.js';
import Student from '../models/Student.js';

const router = express.Router();

// Helper : Recalculer le rang automatique par classe (ordre décroissant de la moyenne générale avec ex-æquo)
export const updateAllRangs = async () => {
  try {
    const classes = await ReportCard.distinct('classe');
    for (const cls of classes) {
      const bulletins = await ReportCard.find({ classe: cls }).sort({ moyenneGenerale: -1, studentName: 1 });
      const total = bulletins.length;

      let currentRank = 1;
      for (let i = 0; i < total; i++) {
        // Détecter les ex-æquo (égalité de moyenne générale avec le précédent ou le suivant)
        const tiedWithPrev = i > 0 && bulletins[i].moyenneGenerale === bulletins[i - 1].moyenneGenerale;
        const tiedWithNext = i < total - 1 && bulletins[i].moyenneGenerale === bulletins[i + 1].moyenneGenerale;
        const isExAequo = tiedWithPrev || tiedWithNext;

        if (!tiedWithPrev) {
          currentRank = i + 1;
        }

        const baseStr = currentRank === 1 ? '1er' : `${currentRank}ème`;
        const exStr = isExAequo ? ' ex-æquo' : '';
        const rankStr = `${baseStr}${exStr}/${total}`;

        if (bulletins[i].rang !== rankStr) {
          bulletins[i].rang = rankStr;
          await bulletins[i].save();
        }
      }
    }
  } catch (err) {
    console.error('Erreur recalcul des rangs:', err);
  }
};

// GET bulletins (ordonnés automatiquement par moyenne générale décroissante)
router.get('/', async (req, res) => {
  try {
    await updateAllRangs();
    const { classe, studentId } = req.query;
    let filter = {};
    if (classe) filter.classe = classe;
    if (studentId) filter.student = studentId;

    const bulletins = await ReportCard.find(filter).sort({ moyenneGenerale: -1 });
    res.json(bulletins);
  } catch (error) {
    res.status(500).json({ message: 'Erreur chargement bulletins.' });
  }
});

// PUT update bulletin grades and subjects
router.put('/:id', async (req, res) => {
  try {
    const { matieres, appreciationGenerale, trimestre } = req.body;
    const bulletin = await ReportCard.findById(req.params.id);

    if (!bulletin) {
      return res.status(404).json({ message: 'Bulletin introuvable' });
    }

    if (matieres && Array.isArray(matieres)) {
      bulletin.matieres = matieres.map(m => ({
        nom: m.nom ? m.nom.trim() : 'Nouvelle matière',
        note: Math.min(20, Math.max(0, Number(m.note) || 0)),
        coef: Math.max(1, Number(m.coef) || 1),
        appreciation: m.appreciation || 'Satisfaisant'
      }));
    }
    if (appreciationGenerale) bulletin.appreciationGenerale = appreciationGenerale;
    if (trimestre) bulletin.trimestre = trimestre;

    // Recalculer la moyenne générale
    if (bulletin.matieres && bulletin.matieres.length > 0) {
      let totalPts = 0;
      let totalCoef = 0;
      bulletin.matieres.forEach((m) => {
        totalPts += (Number(m.note) || 0) * (Number(m.coef) || 1);
        totalCoef += Number(m.coef) || 1;
      });
      bulletin.moyenneGenerale = totalCoef > 0 ? parseFloat((totalPts / totalCoef).toFixed(2)) : 0;
    }

    await bulletin.save();
    
    // Recalculer automatiquement le rang décroissant de toute la classe
    await updateAllRangs();

    const updatedBulletin = await ReportCard.findById(req.params.id);
    res.json(updatedBulletin);
  } catch (error) {
    console.error('Erreur mise à jour bulletin:', error);
    res.status(500).json({ message: 'Erreur mise à jour bulletin.' });
  }
});

// POST ajouter directement une nouvelle matière à un bulletin
router.post('/:id/add-matiere', async (req, res) => {
  try {
    const { nom, note, coef, appreciation } = req.body;
    const bulletin = await ReportCard.findById(req.params.id);

    if (!bulletin) {
      return res.status(404).json({ message: 'Bulletin introuvable' });
    }

    bulletin.matieres.push({
      nom: nom ? nom.trim() : 'Nouvelle Matière',
      note: Math.min(20, Math.max(0, Number(note) || 0)),
      coef: Math.max(1, Number(coef) || 1),
      appreciation: appreciation || 'Bon travail'
    });

    // Recalculer la moyenne générale
    let totalPts = 0;
    let totalCoef = 0;
    bulletin.matieres.forEach((m) => {
      totalPts += m.note * m.coef;
      totalCoef += m.coef;
    });
    bulletin.moyenneGenerale = totalCoef > 0 ? parseFloat((totalPts / totalCoef).toFixed(2)) : 0;

    await bulletin.save();
    await updateAllRangs();

    const updated = await ReportCard.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Erreur ajout matière:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la matière.' });
  }
});

// POST /api/bulletins/import
// Importe ou met à jour les bulletins/notes depuis un fichier Excel
router.post('/import', async (req, res) => {
  try {
    const { bulletins } = req.body;
    if (!Array.isArray(bulletins) || bulletins.length === 0) {
      return res.status(400).json({ message: 'Aucune donnée de bulletin fournie pour l\'importation.' });
    }

    let updatedCount = 0;
    let createdCount = 0;
    const errors = [];

    for (const item of bulletins) {
      const mat = item.matricule ? item.matricule.toString().trim() : '';
      const name = item.studentName ? item.studentName.toString().trim() : '';
      const cls = item.classe ? item.classe.toString().trim() : '';

      if (!mat && !name) {
        errors.push("Ligne ignorée : aucun Matricule ni Nom d'élève spécifié.");
        continue;
      }

      // Chercher le bulletin existant
      let query = {};
      if (mat) {
        query.matricule = mat;
      } else if (name && cls) {
        query.studentName = new RegExp(`^${name}$`, 'i');
        query.classe = cls;
      } else if (name) {
        query.studentName = new RegExp(`^${name}$`, 'i');
      }

      let bulletin = await ReportCard.findOne(query);

      // Si le bulletin n'existe pas, chercher l'élève correspondant pour lier le Student ID
      if (!bulletin) {
        let studentQuery = {};
        if (mat) {
          studentQuery.matricule = mat;
        } else if (name && cls) {
          studentQuery.$or = [
            { nom: new RegExp(name, 'i') },
            { prenom: new RegExp(name, 'i') }
          ];
          studentQuery.classe = cls;
        }

        const student = await Student.findOne(studentQuery);
        if (student) {
          bulletin = new ReportCard({
            student: student._id,
            matricule: student.matricule,
            studentName: `${student.nom} ${student.prenom}`,
            classe: student.classe || cls,
            trimestre: item.trimestre || '1er Trimestre',
            matieres: [],
            moyenneGenerale: 0,
            rang: '1er/1',
            appreciationGenerale: item.appreciationGenerale || 'Travail régulier.'
          });
          createdCount++;
        } else {
          errors.push(`Élève non trouvé pour matricule: "${mat || name}".`);
          continue;
        }
      } else {
        updatedCount++;
      }

      // Mettre à jour les matières
      if (item.matieres && Array.isArray(item.matieres) && item.matieres.length > 0) {
        const existingMatieresMap = new Map();
        (bulletin.matieres || []).forEach(m => {
          existingMatieresMap.set(m.nom.toLowerCase().trim(), m);
        });

        item.matieres.forEach(newM => {
          if (!newM.nom) return;
          const key = newM.nom.toLowerCase().trim();
          const noteVal = Math.min(20, Math.max(0, Number(newM.note) || 0));
          const coefVal = Math.max(1, Number(newM.coef) || 1);
          const apprec = newM.appreciation || (noteVal >= 16 ? 'Excellent travail' : noteVal >= 14 ? 'Très bon travail' : noteVal >= 12 ? 'Bon travail' : noteVal >= 10 ? 'Travail satisfaisant' : 'Doit redoubler d\'efforts');

          if (existingMatieresMap.has(key)) {
            const existingM = existingMatieresMap.get(key);
            existingM.note = noteVal;
            if (newM.coef) existingM.coef = coefVal;
            if (newM.appreciation) existingM.appreciation = apprec;
          } else {
            bulletin.matieres.push({
              nom: newM.nom.trim(),
              note: noteVal,
              coef: coefVal,
              appreciation: apprec
            });
          }
        });
      }

      if (item.trimestre) bulletin.trimestre = item.trimestre;
      if (item.appreciationGenerale) bulletin.appreciationGenerale = item.appreciationGenerale;

      // Recalculer la moyenne générale
      if (bulletin.matieres && bulletin.matieres.length > 0) {
        let totalPts = 0;
        let totalCoef = 0;
        bulletin.matieres.forEach(m => {
          totalPts += (Number(m.note) || 0) * (Number(m.coef) || 1);
          totalCoef += Number(m.coef) || 1;
        });
        bulletin.moyenneGenerale = totalCoef > 0 ? parseFloat((totalPts / totalCoef).toFixed(2)) : 0;
      }

      await bulletin.save();
    }

    // Recalculer tous les rangs
    await updateAllRangs();

    res.json({
      success: true,
      message: `Importation réussie : ${updatedCount + createdCount} bulletin(s) traité(s) (${createdCount} créés, ${updatedCount} mis à jour).`,
      count: updatedCount + createdCount,
      errors
    });
  } catch (error) {
    console.error('Erreur importation bulletins:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'importation des bulletins.' });
  }
});

export default router;
