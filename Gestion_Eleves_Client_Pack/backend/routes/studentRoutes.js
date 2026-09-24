import express from 'express';
import Student from '../models/Student.js';
import Payment from '../models/Payment.js';
import ReportCard from '../models/ReportCard.js';

const router = express.Router();

// Generate unique matricule e.g. ELE-2026-042
const generateMatricule = async () => {
  const count = await Student.countDocuments();
  const num = (count + 1).toString().padStart(3, '0');
  return `ELE-2026-${num}`;
};

// @route GET /api/students
// @desc Get students (optionally filtered by classe)
router.get('/', async (req, res) => {
  try {
    const { classe } = req.query;
    const filter = classe ? { classe } : {};
    const students = await Student.find(filter).sort({ nom: 1, prenom: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération des élèves.' });
  }
});

// @route GET /api/students/search
// @desc Search students by Nom or Matricule
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json([]);
    }
    const regex = new RegExp(q.trim(), 'i');
    const students = await Student.find({
      $or: [
        { nom: regex },
        { prenom: regex },
        { matricule: regex }
      ]
    }).limit(20);

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la recherche.' });
  }
});

// @route POST /api/students
// @desc Create new student (manual matricule)
router.post('/', async (req, res) => {
  try {
    const { 
      nom, prenom, matricule, classe, dateNaissance, genre, 
      nomPere, telPere, professionPere,
      nomMere, telMere, professionMere,
      nomTuteur, telTuteur,
      contactParent, adresse 
    } = req.body;

    if (!nom || !prenom || !classe) {
      return res.status(400).json({ message: 'Nom, Prénom et Classe sont requis.' });
    }

    let finalMatricule = matricule ? matricule.trim() : await generateMatricule();

    // Check if matricule exists
    const existing = await Student.findOne({ matricule: finalMatricule });
    if (existing) {
      return res.status(400).json({ message: `Le matricule ${finalMatricule} existe déjà dans la base.` });
    }

    const student = await Student.create({
      nom: nom.trim(),
      prenom: prenom.trim(),
      matricule: finalMatricule,
      classe,
      dateNaissance: dateNaissance || '2008-05-15',
      genre: genre || 'M',
      nomPere: nomPere || '',
      telPere: telPere || '',
      professionPere: professionPere || '',
      nomMere: nomMere || '',
      telMere: telMere || '',
      professionMere: professionMere || '',
      nomTuteur: nomTuteur || '',
      telTuteur: telTuteur || '',
      contactParent: telPere || telMere || telTuteur || contactParent || '+221 77 000 00 00',
      adresse: adresse || 'Dakar'
    });

    // Create default Payment entry
    await Payment.create({
      student: student._id,
      matricule: student.matricule,
      studentName: `${student.nom} ${student.prenom}`,
      classe: student.classe,
      tarifMensuel: 150000,
      montantTotal: 1500000,
      montantPaye: 0,
      moisPayes: [],
      statut: 'Non payé',
      historique: []
    });

    // Create default ReportCard entry
    await ReportCard.create({
      student: student._id,
      matricule: student.matricule,
      studentName: `${student.nom} ${student.prenom}`,
      classe: student.classe,
      trimestre: '1er Trimestre',
      matieres: [
        { nom: 'Mathématiques', note: 14, coef: 3, appreciation: 'Bon niveau' },
        { nom: 'Français / Littérature', note: 15, coef: 3, appreciation: 'Très expressif' },
        { nom: 'Histoire-Géo', note: 13.5, coef: 2, appreciation: 'Satisfaisant' },
        { nom: 'Physique-Chimie / SVT', note: 16, coef: 3, appreciation: 'Excellent travail' },
        { nom: 'Anglais', note: 14.5, coef: 2, appreciation: 'Bien' }
      ],
      moyenneGenerale: 14.6,
      rang: '3ème/30',
      appreciationGenerale: 'Bilan très positif. Poursuivez vos efforts.'
    });

    res.status(201).json(student);
  } catch (error) {
    console.error('Erreur création élève:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'élève.' });
  }
});

// @route POST /api/students/import
// @desc Import multiple students from Excel file array
router.post('/import', async (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'Aucun élève fourni pour l\'importation.' });
    }

    let importedCount = 0;
    let errors = [];

    for (let st of students) {
      if (!st.nom || !st.prenom || !st.classe) continue;

      let mat = st.matricule ? st.matricule.toString().trim() : await generateMatricule();
      const existing = await Student.findOne({ matricule: mat });
      if (existing) {
        errors.push(`Matricule ${mat} pour ${st.nom} ${st.prenom} existe déjà.`);
        continue;
      }

      const created = await Student.create({
        nom: st.nom.toString().trim(),
        prenom: st.prenom.toString().trim(),
        matricule: mat,
        classe: st.classe.toString().trim(),
        dateNaissance: st.dateNaissance || '2008-05-15',
        genre: st.genre || 'M',
        contactParent: st.contactParent || '+221 77 000 00 00',
        adresse: st.adresse || 'Dakar'
      });

      await Payment.create({
        student: created._id,
        matricule: created.matricule,
        studentName: `${created.nom} ${created.prenom}`,
        classe: created.classe,
        tarifMensuel: 150000,
        montantTotal: 1500000,
        montantPaye: 0,
        moisPayes: [],
        statut: 'Non payé',
        historique: []
      });

      await ReportCard.create({
        student: created._id,
        matricule: created.matricule,
        studentName: `${created.nom} ${created.prenom}`,
        classe: created.classe,
        trimestre: '1er Trimestre',
        matieres: [
          { nom: 'Mathématiques', note: 14, coef: 3, appreciation: 'Bon niveau' },
          { nom: 'Français', note: 14, coef: 3, appreciation: 'Bon élève' }
        ],
        moyenneGenerale: 14,
        rang: '1er/30',
        appreciationGenerale: 'Élève régulier.'
      });

      importedCount++;
    }

    res.json({ message: `${importedCount} élève(s) importé(s) avec succès.`, errors });
  } catch (error) {
    console.error('Erreur importation Excel:', error);
    res.status(500).json({ message: 'Erreur lors de l\'importation des élèves.' });
  }
});

// @route DELETE /api/students/:id
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Élève non trouvé' });
    await Payment.deleteMany({ student: req.params.id });
    await ReportCard.deleteMany({ student: req.params.id });
    res.json({ message: 'Élève supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression' });
  }
});

export default router;
