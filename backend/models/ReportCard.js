import mongoose from 'mongoose';

const reportCardSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    matricule: { type: String, required: true },
    studentName: { type: String, required: true },
    classe: { type: String, required: true },
    trimestre: { type: String, default: '1er Trimestre' },
    matieres: [
      {
        nom: { type: String, required: true },
        note: { type: Number, required: true },
        coef: { type: Number, default: 2 },
        appreciation: { type: String, default: 'Très bon travail' }
      }
    ],
    moyenneGenerale: { type: Number, default: 0 },
    rang: { type: String, default: '1er/30' },
    appreciationGenerale: { type: String, default: 'Élève très sérieux et appliqué. Poursuivez ainsi.' }
  },
  { timestamps: true }
);

const ReportCard = mongoose.model('ReportCard', reportCardSchema);
export default ReportCard;
