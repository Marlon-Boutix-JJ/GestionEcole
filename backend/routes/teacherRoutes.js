import express from 'express';
import Teacher from '../models/Teacher.js';
import TeacherShift from '../models/TeacherShift.js';

const router = express.Router();

// --- TEACHER MANAGEMENT ROUTES ---

// GET /api/teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ nom: 1, prenom: 1 });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des professeurs.', error: err.message });
  }
});

// POST /api/teachers
router.post('/', async (req, res) => {
  try {
    const { nom, prenom, telephone, email, matieres, tarifsHoraires } = req.body;

    if (!nom || !prenom) {
      return res.status(400).json({ message: 'Le nom et le prénom du professeur sont obligatoires.' });
    }

    // Default rate structure if not provided
    const defaultTarifs = [
      { classe: '3ème', tarifHeure: 15000 },
      { classe: 'Terminale S', tarifHeure: 20000 },
      { classe: 'Terminale L', tarifHeure: 18000 },
      { classe: 'Terminale OSE', tarifHeure: 18000 }
    ];

    const teacher = new Teacher({
      nom: nom.trim(),
      prenom: prenom.trim(),
      telephone: telephone || '+221 77 000 00 00',
      email: email || '',
      matieres: Array.isArray(matieres) ? matieres : ['Général'],
      tarifsHoraires: Array.isArray(tarifsHoraires) && tarifsHoraires.length > 0 ? tarifsHoraires : defaultTarifs
    });

    await teacher.save();
    res.status(201).json(teacher);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création du professeur.', error: err.message });
  }
});

// PUT /api/teachers/:id
router.put('/:id', async (req, res) => {
  try {
    const { nom, prenom, telephone, email, matieres, tarifsHoraires, statut } = req.body;
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ message: 'Professeur non trouvé.' });
    }

    if (nom) teacher.nom = nom.trim();
    if (prenom) teacher.prenom = prenom.trim();
    if (telephone !== undefined) teacher.telephone = telephone;
    if (email !== undefined) teacher.email = email;
    if (matieres !== undefined) teacher.matieres = matieres;
    if (tarifsHoraires !== undefined) teacher.tarifsHoraires = tarifsHoraires;
    if (statut !== undefined) teacher.statut = statut;

    await teacher.save();
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du professeur.', error: err.message });
  }
});

// DELETE /api/teachers/:id
router.delete('/:id', async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    await TeacherShift.deleteMany({ teacher: req.params.id });
    res.json({ message: 'Professeur et son historique de pointage supprimés.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression.', error: err.message });
  }
});


// --- SHIFTS / POINTAGE ROUTES ---

// GET /api/teachers/shifts?teacherId=xxx&classe=3ème
router.get('/shifts', async (req, res) => {
  try {
    const { teacherId, classe, statutPaiement } = req.query;
    let query = {};
    if (teacherId) query.teacher = teacherId;
    if (classe) query.classe = classe;
    if (statutPaiement) query.statutPaiement = statutPaiement;

    const shifts = await TeacherShift.find(query).sort({ dateShift: -1 });
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération du pointage.', error: err.message });
  }
});

// POST /api/teachers/shifts -> Record a new clocking entry
router.post('/shifts', async (req, res) => {
  try {
    const { teacherId, teacherName, classe, matiere, dateShift, heureDebut, heureFin, heuresEffectuees, tarifHoraireApplique, remarque } = req.body;

    if ((!teacherId && !teacherName) || !classe || !heureDebut || !heureFin) {
      return res.status(400).json({ message: 'Le nom du professeur, la classe, et les heures de début/fin sont obligatoires.' });
    }

    let finalTeacherName = teacherName ? teacherName.trim() : '';
    let finalTeacherId = teacherId || null;

    if (teacherId) {
      const teacher = await Teacher.findById(teacherId);
      if (teacher) {
        finalTeacherId = teacher._id;
        if (!finalTeacherName) finalTeacherName = `${teacher.nom} ${teacher.prenom}`;
      }
    }

    if (!finalTeacherName) finalTeacherName = 'Professeur Enseignant';

    // Determine hourly rate
    let rate = Number(tarifHoraireApplique);
    if (isNaN(rate) || rate <= 0) {
      if (finalTeacherId) {
        const teacher = await Teacher.findById(finalTeacherId);
        const classRate = teacher?.tarifsHoraires?.find(t => t.classe === classe);
        rate = classRate ? classRate.tarifHeure : 15000;
      } else {
        rate = 15000;
      }
    }

    // Calculate hours if not provided
    let hours = parseFloat(heuresEffectuees);
    if (isNaN(hours) || hours <= 0) {
      const [h1, m1] = heureDebut.split(':').map(Number);
      const [h2, m2] = heureFin.split(':').map(Number);
      const diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
      hours = parseFloat((diffMinutes / 60).toFixed(2));
      if (hours <= 0) hours = 1;
    }

    const totalSalary = Math.round(hours * rate);

    const shift = new TeacherShift({
      teacher: finalTeacherId,
      teacherName: finalTeacherName,
      classe,
      matiere: matiere || 'Matière Générale',
      dateShift: dateShift ? new Date(dateShift) : new Date(),
      heureDebut,
      heureFin,
      heuresEffectuees: hours,
      tarifHoraireApplique: rate,
      salaireTotal: totalSalary,
      statutPaiement: 'En attente',
      remarque: remarque || ''
    });

    await shift.save();
    res.status(201).json(shift);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement du pointage.', error: err.message });
  }
});

// PUT /api/teachers/shifts/:id/pay -> Toggle shift payment status
router.put('/shifts/:id/pay', async (req, res) => {
  try {
    const shift = await TeacherShift.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ message: 'Pointage non trouvé.' });
    }

    shift.statutPaiement = shift.statutPaiement === 'Payé' ? 'En attente' : 'Payé';
    await shift.save();

    res.json(shift);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut de paiement.', error: err.message });
  }
});

// PUT /api/teachers/shifts/:id -> Update/edit a shift entry
router.put('/shifts/:id', async (req, res) => {
  try {
    const { teacherId, teacherName, classe, matiere, dateShift, heureDebut, heureFin, heuresEffectuees, tarifHoraireApplique, salaireTotal, remarque, statutPaiement } = req.body;
    const shift = await TeacherShift.findById(req.params.id);

    if (!shift) {
      return res.status(404).json({ message: 'Pointage non trouvé.' });
    }

    if (teacherName !== undefined) {
      shift.teacherName = teacherName.trim() || 'Professeur Enseignant';
    }
    if (teacherId !== undefined) {
      shift.teacher = teacherId || null;
    }

    if (classe) shift.classe = classe;
    if (matiere) shift.matiere = matiere;
    if (dateShift) shift.dateShift = new Date(dateShift);
    if (heureDebut) shift.heureDebut = heureDebut;
    if (heureFin) shift.heureFin = heureFin;
    if (remarque !== undefined) shift.remarque = remarque;
    if (statutPaiement) shift.statutPaiement = statutPaiement;

    // Hours
    let hours = parseFloat(heuresEffectuees);
    if (isNaN(hours) || hours <= 0) {
      const [h1, m1] = shift.heureDebut.split(':').map(Number);
      const [h2, m2] = shift.heureFin.split(':').map(Number);
      const diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
      hours = parseFloat((diffMinutes / 60).toFixed(2));
      if (hours <= 0) hours = 1;
    }
    shift.heuresEffectuees = hours;

    // Rate & Salary
    let rate = Number(tarifHoraireApplique);
    if (!isNaN(rate) && rate > 0) {
      shift.tarifHoraireApplique = rate;
    }

    if (salaireTotal !== undefined && Number(salaireTotal) > 0) {
      shift.salaireTotal = Number(salaireTotal);
    } else {
      shift.salaireTotal = Math.round(shift.heuresEffectuees * shift.tarifHoraireApplique);
    }

    await shift.save();
    res.json(shift);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la modification du pointage.', error: err.message });
  }
});

// DELETE /api/teachers/shifts/:id
router.delete('/shifts/:id', async (req, res) => {
  try {
    await TeacherShift.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pointage supprimé avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression.', error: err.message });
  }
});

export default router;
