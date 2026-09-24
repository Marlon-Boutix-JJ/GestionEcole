import express from 'express';
import Warning from '../models/Warning.js';
import Student from '../models/Student.js';

const router = express.Router();

// GET all warnings
router.get('/', async (req, res) => {
  try {
    const { classe, type, studentId, matricule } = req.query;
    let filter = {};
    if (classe) filter.classe = classe;
    if (type) filter.type = type;
    if (studentId) filter.student = studentId;
    if (matricule) filter.matricule = matricule;

    const warnings = await Warning.find(filter).sort({ createdAt: -1 });
    res.json(warnings);
  } catch (error) {
    res.status(500).json({ message: 'Erreur chargement des avertissements.' });
  }
});

// POST add warning (defaults to AV Niveau 1)
router.post('/', async (req, res) => {
  try {
    const { studentId, motif } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    const warning = await Warning.create({
      student: student._id,
      matricule: student.matricule,
      studentName: `${student.nom} ${student.prenom}`,
      classe: student.classe,
      niveau: 1,
      type: 'AV Niveau 1',
      motif: motif || 'Avertissement disciplinaire initial',
      gravite: 'Faible',
      dateSanction: new Date()
    });

    res.status(201).json(warning);
  } catch (error) {
    res.status(500).json({ message: 'Erreur enregistrement sanction.' });
  }
});

// PUT increment warning level (+ button)
router.put('/:id/increment', async (req, res) => {
  try {
    const warning = await Warning.findById(req.params.id);
    if (!warning) {
      return res.status(404).json({ message: 'Avertissement introuvable.' });
    }

    if (warning.niveau < 3) {
      warning.niveau += 1;
      if (warning.niveau === 2) {
        warning.type = 'AV Niveau 2';
        warning.gravite = 'Moyenne';
      } else if (warning.niveau === 3) {
        warning.type = 'AV Niveau 3 (Conseil de classe & Appel Parents)';
        warning.gravite = 'Élevée';
      }
      await warning.save();
    }

    res.json(warning);
  } catch (error) {
    res.status(500).json({ message: 'Erreur augmentation du niveau d\'avertissement.' });
  }
});

// DELETE warning
router.delete('/:id', async (req, res) => {
  try {
    await Warning.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sanction retirée avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression sanction.' });
  }
});

export default router;
