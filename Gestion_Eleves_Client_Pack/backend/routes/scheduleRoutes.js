import express from 'express';
import Schedule from '../models/Schedule.js';

const router = express.Router();

const defaultDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const defaultHours = [
  { debut: '08h00', fin: '09h00' },
  { debut: '09h00', fin: '10h00' },
  { debut: '10h15', fin: '11h15' },
  { debut: '11h15', fin: '12h15' },
  { debut: '14h30', fin: '15h30' },
  { debut: '15h30', fin: '16h30' }
];

// Helper pour générer un emploi du temps par défaut
const generateDefaultCreneaux = (classe) => {
  const creneaux = [];

  const matieresByClass = {
    '3ème': ['Mathématiques', 'Français', 'Histoire-Géo', 'SVT', 'Physique-Chimie', 'Anglais', 'EPS'],
    'Terminale S': ['Mathématiques', 'Physique-Chimie', 'SVT', 'Philosophie', 'Anglais', 'Informatique', 'EPS'],
    'Terminale L': ['Philosophie', 'Français', 'Histoire-Géo', 'Anglais', 'Espagnol', 'Littérature', 'Maths'],
    'Terminale OSE': ['Économie', 'Comptabilité', 'Maths Appliquées', 'Droit', 'Anglais Comm', 'Management', 'EPS']
  };

  const matList = matieresByClass[classe] || ['Mathématiques', 'Français', 'Histoire-Géo', 'Anglais'];
  let mIndex = 0;

  defaultDays.forEach((jour) => {
    defaultHours.forEach((h) => {
      // Mercredi et Samedi après-midi sont généralement libres
      const isAfternoonHalfDay = (jour === 'Mercredi' || jour === 'Samedi') && (h.debut === '14h30' || h.debut === '15h30');
      
      const mat = isAfternoonHalfDay ? 'Libre / Activités' : matList[mIndex % matList.length];
      const prof = isAfternoonHalfDay ? '' : `Prof. ${mat.slice(0, 4)}.`;
      const salle = isAfternoonHalfDay ? '' : `Salle ${101 + (mIndex % 5)}`;

      creneaux.push({
        jour,
        heureDebut: h.debut,
        heureFin: h.fin,
        matiere: mat,
        professeur: prof,
        salle
      });

      if (!isAfternoonHalfDay) mIndex++;
    });
  });

  return creneaux;
};

// GET emploi du temps par classe
router.get('/', async (req, res) => {
  try {
    const { classe } = req.query;
    if (!classe) {
      return res.status(400).json({ message: 'Veuillez préciser la classe.' });
    }

    let schedule = await Schedule.findOne({ classe });
    if (!schedule) {
      // Création automatique de l'emploi du temps par défaut (Lundi à Samedi)
      const defaultCreneaux = generateDefaultCreneaux(classe);
      schedule = await Schedule.create({
        classe,
        creneaux: defaultCreneaux
      });
    }

    res.json(schedule);
  } catch (error) {
    console.error('Erreur chargement emploi du temps:', error);
    res.status(500).json({ message: 'Erreur chargement emploi du temps.' });
  }
});

// PUT mise à jour de l'emploi du temps d'une classe
router.put('/:classe', async (req, res) => {
  try {
    const { creneaux } = req.body;
    const classeParam = req.params.classe;

    let schedule = await Schedule.findOne({ classe: classeParam });
    if (!schedule) {
      schedule = new Schedule({ classe: classeParam, creneaux: [] });
    }

    if (Array.isArray(creneaux)) {
      schedule.creneaux = creneaux;
    }

    await schedule.save();
    res.json(schedule);
  } catch (error) {
    console.error('Erreur mise à jour emploi du temps:', error);
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement de l\'emploi du temps.' });
  }
});

export default router;
