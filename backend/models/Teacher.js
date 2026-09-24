import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    telephone: { type: String, default: '+221 77 000 00 00' },
    email: { type: String, default: '' },
    matieres: [{ type: String }],
    
    // Tarif horaire individualisé par classe (en Ariary)
    tarifsHoraires: [
      {
        classe: { type: String, required: true }, // '3ème', 'Terminale S', 'Terminale L', 'Terminale OSE'
        tarifHeure: { type: Number, required: true, default: 15000 } // Tarif en Ariary / heure
      }
    ],
    
    statut: { type: String, enum: ['Actif', 'Inactif'], default: 'Actif' }
  },
  { timestamps: true }
);

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;
