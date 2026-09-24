import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    matricule: { type: String, required: true },
    studentName: { type: String, required: true },
    classe: { type: String, required: true },
    tarifMensuel: { type: Number, required: true, default: 150000 },
    moisPayes: { type: [String], default: [] },
    montantTotal: { type: Number, required: true, default: 150000 },
    montantPaye: { type: Number, required: true, default: 0 },
    statut: {
      type: String,
      enum: ['Payé', 'Non payé', 'En retard', 'Partiel', 'À jour'],
      default: 'Non payé',
    },
    historique: [
      {
        date: { type: Date, default: Date.now },
        montant: { type: Number, required: true },
        recuNo: { type: String, required: true },
        methode: { type: String, default: 'Espèces' },
        note: { type: String, default: 'Paiement mensuel' }
      }
    ]
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
