import mongoose from 'mongoose';

const warningSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    matricule: { type: String, required: true },
    studentName: { type: String, required: true },
    classe: { type: String, required: true },
    niveau: { type: Number, default: 1, min: 1, max: 3 },
    type: {
      type: String,
      default: 'AV Niveau 1'
    },
    motif: { type: String, required: true },
    dateSanction: { type: Date, default: Date.now },
    gravite: { type: String, enum: ['Faible', 'Moyenne', 'Élevée'], default: 'Faible' },
    statut: { type: String, enum: ['Actif', 'Résolu'], default: 'Actif' }
  },
  { timestamps: true }
);

const Warning = mongoose.model('Warning', warningSchema);
export default Warning;
