import express from 'express';
import ReportCard from '../models/ReportCard.js';

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

export default router;
