import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    matricule: { type: String, required: true },
    studentName: { type: String, required: true },
    classe: { type: String, required: true },
    type: {
      type: String,
      enum: ['Absence', 'Retard'],
      required: true
    },
    dateEvent: { type: Date, default: Date.now },
    duree: { type: String, default: '1 heure' }, // ex: "15 min", "30 min", "1 heure", "2 heures", "Demi-journée", "Journée"
    matiere: { type: String, default: 'Toutes les matières' },
    justifie: { type: Boolean, default: false },
    motif: { type: String, default: 'Non spécifié' }
  },
  { timestamps: true }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
