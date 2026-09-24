import express from 'express';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

const router = express.Router();

// GET /api/attendance?classe=3ème&type=Absence&studentId=xxx
router.get('/', async (req, res) => {
  try {
    const { classe, type, studentId } = req.query;
    let query = {};
    if (classe) query.classe = classe;
    if (type) query.type = type;
    if (studentId) query.student = studentId;

    const records = await Attendance.find(query).sort({ dateEvent: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du chargement des présences/absences/retards', error: err.message });
  }
});

// POST /api/attendance
router.post('/', async (req, res) => {
  try {
    const { studentId, type, dateEvent, duree, matiere, justifie, motif } = req.body;

    if (!studentId || !type) {
      return res.status(400).json({ message: "L'élève et le type (Absence ou Retard) sont obligatoires." });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé.' });
    }

    const record = new Attendance({
      student: student._id,
      matricule: student.matricule,
      studentName: `${student.nom} ${student.prenom}`,
      classe: student.classe,
      type,
      dateEvent: dateEvent ? new Date(dateEvent) : new Date(),
      duree: duree || (type === 'Absence' ? '1 heure' : '15 min'),
      matiere: matiere || 'Général',
      justifie: Boolean(justifie),
      motif: motif || 'Non spécifié'
    });

    await record.save();
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'absence/retard', error: err.message });
  }
});

// PUT /api/attendance/:id (Toggle justifié ou modifier motif)
router.put('/:id', async (req, res) => {
  try {
    const { justifie, motif, duree, matiere } = req.body;
    const record = await Attendance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Enregistrement non trouvé.' });
    }

    if (justifie !== undefined) record.justifie = Boolean(justifie);
    if (motif !== undefined) record.motif = motif;
    if (duree !== undefined) record.duree = duree;
    if (matiere !== undefined) record.matiere = matiere;

    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour.', error: err.message });
  }
});

// DELETE /api/attendance/:id
router.delete('/:id', async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Enregistrement supprimé avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur suppression.', error: err.message });
  }
});

export default router;
