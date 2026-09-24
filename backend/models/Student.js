import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    matricule: { type: String, required: true, unique: true, trim: true },
    classe: {
      type: String,
      required: true,
      enum: ['3ème', 'Terminale S', 'Terminale L', 'Terminale OSE'],
    },
    dateNaissance: { type: String, default: '2008-05-15' },
    genre: { type: String, enum: ['M', 'F'], default: 'M' },
    
    // Informations du Père
    nomPere: { type: String, default: '' },
    telPere: { type: String, default: '' },
    professionPere: { type: String, default: '' },
    
    // Informations de la Mère
    nomMere: { type: String, default: '' },
    telMere: { type: String, default: '' },
    professionMere: { type: String, default: '' },
    
    // Informations du Tuteur
    nomTuteur: { type: String, default: '' },
    telTuteur: { type: String, default: '' },
    
    contactParent: { type: String, default: '+221 77 000 00 00' },
    adresse: { type: String, default: 'Dakar, Sénégal' },
    statut: { type: String, enum: ['Actif', 'Inactif'], default: 'Actif' },
  },
  { timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);
export default Student;
