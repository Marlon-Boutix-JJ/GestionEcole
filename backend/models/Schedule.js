import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  jour: { type: String, required: true }, // 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  heureDebut: { type: String, required: true },
  heureFin: { type: String, required: true },
  matiere: { type: String, default: '' },
  professeur: { type: String, default: '' },
  salle: { type: String, default: '' }
});

const scheduleSchema = new mongoose.Schema(
  {
    classe: { type: String, required: true, unique: true },
    creneaux: [slotSchema]
  },
  { timestamps: true }
);

const Schedule = mongoose.model('Schedule', scheduleSchema);
export default Schedule;
