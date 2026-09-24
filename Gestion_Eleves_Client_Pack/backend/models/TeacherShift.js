import mongoose from 'mongoose';

const teacherShiftSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: false },
    teacherName: { type: String, required: true },
    classe: { 
      type: String, 
      required: true,
      enum: ['3ème', 'Terminale S', 'Terminale L', 'Terminale OSE']
    },
    matiere: { type: String, required: true },
    dateShift: { type: Date, default: Date.now },
    heureDebut: { type: String, required: true }, // ex: "08:00"
    heureFin: { type: String, required: true },   // ex: "10:00"
    heuresEffectuees: { type: Number, required: true }, // ex: 2.0 heures
    tarifHoraireApplique: { type: Number, required: true }, // Tarif en Ariary / h pour la classe sélectionnée
    salaireTotal: { type: Number, required: true }, // heuresEffectuees * tarifHoraireApplique
    statutPaiement: { type: String, enum: ['En attente', 'Payé'], default: 'En attente' },
    remarque: { type: String, default: '' }
  },
  { timestamps: true }
);

const TeacherShift = mongoose.model('TeacherShift', teacherShiftSchema);
export default TeacherShift;
