import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoSanitize from 'express-mongo-sanitize';
import { connectDB } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { apiLimiter } from './middleware/rateLimiter.js';
import { sanitizeInputs } from './middleware/sanitizer.js';
import { licenseCheck } from './middleware/licenseMiddleware.js';

import licenseRoutes from './routes/licenseRoutes.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import bulletinRoutes from './routes/bulletinRoutes.js';
import warningRoutes from './routes/warningRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';

import Student from './models/Student.js';
import Payment from './models/Payment.js';
import ReportCard from './models/ReportCard.js';
import Warning from './models/Warning.js';
import Admin from './models/Admin.js';
import Schedule from './models/Schedule.js';
import Attendance from './models/Attendance.js';
import Teacher from './models/Teacher.js';
import TeacherShift from './models/TeacherShift.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Security Hardening & Middlewares
app.disable('x-powered-by');

// 1. Helmet HTTP Security Headers (HSTS, X-Frame-Options, X-Content-Type-Options)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// 2. Strict CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5050',
      'http://127.0.0.1:5050',
      'http://localhost:5173'
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback allow for local dev
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// 3. Prevent DoS via JSON Payload Limit (100kb max)
app.use(express.json({ limit: '100kb' }));

// 4. Sanitize data against NoSQL Injection Attacks ($ & .)
app.use(mongoSanitize());

// 5. Sanitize request bodies against Stored XSS Script Injections
app.use(sanitizeInputs);

// 6. Global API Rate Limiter
app.use('/api', apiLimiter);

// License Route (unrestricted)
app.use('/api/license', licenseRoutes);

// Hardware License Enforcer Middleware (locks API if un-activated)
app.use('/api', licenseCheck);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bulletins', bulletinRoutes);
app.use('/api/warnings', warningRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/teachers', teacherRoutes);

// Serve compiled static React frontend assets with path resolution & no-cache headers for index.html
let frontendDistPath = path.join(__dirname, '../frontend/dist');
if (!fs.existsSync(frontendDistPath)) {
  frontendDistPath = path.join(__dirname, './frontend/dist');
}

app.use(express.static(frontendDistPath, {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

app.get('*', (req, res) => {
  // Never return index.html for API, JS, CSS, SVG or assets requests that don't exist
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/assets') ||
    req.path.endsWith('.js') ||
    req.path.endsWith('.css') ||
    req.path.endsWith('.svg') ||
    req.path.endsWith('.json') ||
    req.path.endsWith('.ico')
  ) {
    return res.status(404).send('Ressource non trouvée');
  }

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Seed Initial Demo Data
const seedInitialData = async () => {
  try {
    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      console.log('[Seed Data] Insertion des élèves de démonstration...');
      
      const sampleStudents = [
        { nom: 'Diop', prenom: 'Moussa', matricule: 'ELE-2026-001', classe: '3ème', dateNaissance: '2009-04-12', genre: 'M', contactParent: '+221 77 654 32 10', adresse: 'Sacré-Cœur, Dakar' },
        { nom: 'Ndiaye', prenom: 'Aïssatou', matricule: 'ELE-2026-002', classe: '3ème', dateNaissance: '2009-08-25', genre: 'F', contactParent: '+221 78 123 45 67', adresse: 'Mermoz, Dakar' },
        { nom: 'Sow', prenom: 'Ibrahima', matricule: 'ELE-2026-003', classe: '3ème', dateNaissance: '2009-02-18', genre: 'M', contactParent: '+221 70 987 65 43', adresse: 'Fann, Dakar' },
        { nom: 'Fall', prenom: 'Ousmane', matricule: 'ELE-2026-004', classe: 'Terminale S', dateNaissance: '2006-11-05', genre: 'M', contactParent: '+221 77 444 33 22', adresse: 'Maristes, Dakar' },
        { nom: 'Ba', prenom: 'Fatoumata', matricule: 'ELE-2026-005', classe: 'Terminale S', dateNaissance: '2007-01-30', genre: 'F', contactParent: '+221 76 555 44 11', adresse: 'Almadies, Dakar' },
        { nom: 'Kane', prenom: 'Cheikh', matricule: 'ELE-2026-006', classe: 'Terminale S', dateNaissance: '2006-09-14', genre: 'M', contactParent: '+221 77 111 22 33', adresse: 'Grand Yoff, Dakar' },
        { nom: 'Cissé', prenom: 'Mariama', matricule: 'ELE-2026-007', classe: 'Terminale L', dateNaissance: '2006-07-22', genre: 'F', contactParent: '+221 78 888 99 00', adresse: 'Point E, Dakar' },
        { nom: 'Sarr', prenom: 'Babacar', matricule: 'ELE-2026-008', classe: 'Terminale L', dateNaissance: '2007-03-10', genre: 'M', contactParent: '+221 70 222 33 44', adresse: 'Ouakam, Dakar' },
        { nom: 'Diallo', prenom: 'Khadija', matricule: 'ELE-2026-009', classe: 'Terminale L', dateNaissance: '2006-12-01', genre: 'F', contactParent: '+221 77 333 44 55', adresse: 'Gédiawaye, Dakar' },
        { nom: 'Mbodj', prenom: 'Mamadou', matricule: 'ELE-2026-010', classe: 'Terminale OSE', dateNaissance: '2006-05-18', genre: 'M', contactParent: '+221 77 999 00 11', adresse: 'Ngor, Dakar' },
        { nom: 'Ndao', prenom: 'Aminata', matricule: 'ELE-2026-011', classe: 'Terminale OSE', dateNaissance: '2007-02-11', genre: 'F', contactParent: '+221 78 555 66 77', adresse: 'Yoff, Dakar' }
      ];

      for (let sData of sampleStudents) {
        const student = await Student.create(sData);

        // Payment seed avec moisPayes réels (Octobre à Juillet)
        const isPaid3 = sData.nom === 'Diop' || sData.nom === 'Ba' || sData.nom === 'Cissé' || sData.nom === 'Mbodj';
        const isPaid1 = sData.nom === 'Ndiaye' || sData.nom === 'Fall' || sData.nom === 'Ndao';
        
        const moisPayes = isPaid3 
          ? ['Octobre', 'Novembre', 'Décembre'] 
          : isPaid1 
          ? ['Octobre'] 
          : [];
          
        const paidAmount = moisPayes.length * 150000;
        const status = moisPayes.length > 0 ? 'Payé' : 'Non payé';

        await Payment.create({
          student: student._id,
          matricule: student.matricule,
          studentName: `${student.nom} ${student.prenom}`,
          classe: student.classe,
          tarifMensuel: 150000,
          montantTotal: 1500000,
          montantPaye: paidAmount,
          moisPayes: moisPayes,
          statut: status,
          historique: paidAmount > 0 ? [
            { 
              date: new Date(), 
              montant: paidAmount, 
              recuNo: `REC-${Math.floor(100000 + Math.random() * 900000)}`, 
              methode: 'Espèces', 
              note: `Paiement écolage pour : ${moisPayes.join(', ')}` 
            }
          ] : []
        });

        // Bulletin seed
        const isSci = student.classe === 'Terminale S';
        const isLit = student.classe === 'Terminale L';
        const isOse = student.classe === 'Terminale OSE';

        const matieres = isSci ? [
          { nom: 'Mathématiques', note: 16.5, coef: 5, appreciation: 'Excellent esprit d\'analyse' },
          { nom: 'Physique-Chimie', note: 15, coef: 4, appreciation: 'Très bons résultats' },
          { nom: 'SVT', note: 14.5, coef: 3, appreciation: 'Régulier et attentif' },
          { nom: 'Français', note: 13, coef: 2, appreciation: 'Satisfaisant' },
          { nom: 'Anglais', note: 14, coef: 2, appreciation: 'Bonne participation' }
        ] : isLit ? [
          { nom: 'Français / Philosophie', note: 17, coef: 5, appreciation: 'Réflexion brillante et synthétique' },
          { nom: 'Histoire-Géo', note: 15.5, coef: 4, appreciation: 'Très bonne maîtrise' },
          { nom: 'Anglais', note: 16, coef: 3, appreciation: 'Aisance orale remarquable' },
          { nom: 'Espagnol / Arabe', note: 14, coef: 2, appreciation: 'Bon niveau' },
          { nom: 'Mathématiques', note: 12, coef: 2, appreciation: 'Efforts constatés' }
        ] : isOse ? [
          { nom: 'Économie & Organisation', note: 16, coef: 5, appreciation: 'Excellente vision stratégique' },
          { nom: 'Comptabilité & Gestion', note: 15.5, coef: 4, appreciation: 'Rigueur financière remarquable' },
          { nom: 'Mathématiques Appliquées', note: 14, coef: 3, appreciation: 'Bons résultats' },
          { nom: 'Droit & Législation', note: 15, coef: 3, appreciation: 'Analyse pertinente' },
          { nom: 'Anglais Commercial', note: 14.5, coef: 2, appreciation: 'Très bonne pratique' }
        ] : [
          { nom: 'Mathématiques', note: 14, coef: 3, appreciation: 'Bon élève' },
          { nom: 'Français', note: 15, coef: 3, appreciation: 'Très bien' },
          { nom: 'Histoire-Géo', note: 13.5, coef: 2, appreciation: 'Satisfaisant' },
          { nom: 'Sciences', note: 14, coef: 3, appreciation: 'Bonne compréhension' },
          { nom: 'Anglais', note: 15, coef: 2, appreciation: 'Très bon niveau' }
        ];

        let totP = 0, totC = 0;
        matieres.forEach(m => { totP += m.note * m.coef; totC += m.coef; });
        const avg = parseFloat((totP / totC).toFixed(2));

        await ReportCard.create({
          student: student._id,
          matricule: student.matricule,
          studentName: `${student.nom} ${student.prenom}`,
          classe: student.classe,
          trimestre: '1er Trimestre',
          matieres,
          moyenneGenerale: avg,
          rang: '2ème/30',
          appreciationGenerale: 'Félicitations du conseil de classe pour ces excellents résultats.'
        });
      }

      // Warnings seed
      const moussa = await Student.findOne({ nom: 'Diop' });
      if (moussa) {
        await Warning.create({
          student: moussa._id,
          matricule: moussa.matricule,
          studentName: 'Diop Moussa',
          classe: '3ème',
          type: 'Avertissement',
          motif: 'Bavardages répétés et retards non justifiés en cours de Mathématiques.',
          gravite: 'Faible',
          dateSanction: new Date()
        });
      }

      const ibrahima = await Student.findOne({ nom: 'Sow' });
      if (ibrahima) {
        await Warning.create({
          student: ibrahima._id,
          matricule: ibrahima.matricule,
          studentName: 'Sow Ibrahima',
          classe: '3ème',
          type: 'Blâme',
          motif: 'Insolence envers un professeur lors de la séance d\'Éducation Physique.',
          gravite: 'Moyenne',
          dateSanction: new Date()
        });
      }

      console.log('[Seed Data] Élèves, Écolages, Bulletins et Avertissements créés avec succès !');
    }

    // Attendance (Absences & Retards) Seed
    const attCount = await Attendance.countDocuments();
    if (attCount === 0) {
      console.log('[Seed Data] Insertion d\'absences et retards d\'exemple...');
      const moussa = await Student.findOne({ nom: 'Diop' });
      const fatou = await Student.findOne({ nom: 'Ba' });
      const ousmane = await Student.findOne({ nom: 'Fall' });

      if (moussa) {
        await Attendance.create({
          student: moussa._id,
          matricule: moussa.matricule,
          studentName: 'Diop Moussa',
          classe: '3ème',
          type: 'Retard',
          duree: '15 min',
          matiere: 'Mathématiques',
          justifie: false,
          motif: 'Embouteillages sur la route',
          dateEvent: new Date(Date.now() - 86400000 * 2)
        });

        await Attendance.create({
          student: moussa._id,
          matricule: moussa.matricule,
          studentName: 'Diop Moussa',
          classe: '3ème',
          type: 'Absence',
          duree: 'Demi-journée',
          matiere: 'SVT',
          justifie: true,
          motif: 'Rendez-vous médical avec justificatif',
          dateEvent: new Date(Date.now() - 86400000 * 5)
        });
      }

      if (fatou) {
        await Attendance.create({
          student: fatou._id,
          matricule: fatou.matricule,
          studentName: 'Ba Fatoumata',
          classe: 'Terminale S',
          type: 'Retard',
          duree: '20 min',
          matiere: 'Physique-Chimie',
          justifie: true,
          motif: 'Problème de transport scolaire',
          dateEvent: new Date(Date.now() - 86400000 * 1)
        });
      }

      if (ousmane) {
        await Attendance.create({
          student: ousmane._id,
          matricule: ousmane.matricule,
          studentName: 'Fall Ousmane',
          classe: 'Terminale S',
          type: 'Absence',
          duree: 'Journée complète',
          matiere: 'Toutes les matières',
          justifie: false,
          motif: 'Non motivé / Absence injustifiée',
          dateEvent: new Date(Date.now() - 86400000 * 3)
        });
      }
    }

    // Teacher & TeacherShift Seed
    const teacherCount = await Teacher.countDocuments();
    if (teacherCount === 0) {
      console.log('[Seed Data] Insertion des professeurs et tarifs par classe d\'exemple...');
      
      const profMath = await Teacher.create({
        nom: 'Ndiaye',
        prenom: 'Mamadou',
        telephone: '+221 77 123 45 67',
        email: 'm.ndiaye@edugestion.sn',
        matieres: ['Mathématiques', 'Physique-Chimie'],
        tarifsHoraires: [
          { classe: '3ème', tarifHeure: 12000 },
          { classe: 'Terminale S', tarifHeure: 20000 },
          { classe: 'Terminale L', tarifHeure: 15000 },
          { classe: 'Terminale OSE', tarifHeure: 18000 }
        ]
      });

      const profFr = await Teacher.create({
        nom: 'Sall',
        prenom: 'Aminata',
        telephone: '+221 78 987 65 43',
        email: 'a.sall@edugestion.sn',
        matieres: ['Français', 'Philosophie'],
        tarifsHoraires: [
          { classe: '3ème', tarifHeure: 12000 },
          { classe: 'Terminale S', tarifHeure: 15000 },
          { classe: 'Terminale L', tarifHeure: 22000 },
          { classe: 'Terminale OSE', tarifHeure: 18000 }
        ]
      });

      // Shifts / Pointages d'exemple
      await TeacherShift.create({
        teacher: profMath._id,
        teacherName: `${profMath.nom} ${profMath.prenom}`,
        classe: 'Terminale S',
        matiere: 'Mathématiques',
        dateShift: new Date(Date.now() - 86400000 * 1),
        heureDebut: '08:00',
        heureFin: '10:00',
        heuresEffectuees: 2,
        tarifHoraireApplique: 20000,
        salaireTotal: 40000,
        statutPaiement: 'Payé',
        remarque: 'Cours d\'analyse et géométrie de l\'espace'
      });

      await TeacherShift.create({
        teacher: profMath._id,
        teacherName: `${profMath.nom} ${profMath.prenom}`,
        classe: '3ème',
        matiere: 'Mathématiques',
        dateShift: new Date(Date.now() - 86400000 * 2),
        heureDebut: '10:15',
        heureFin: '12:15',
        heuresEffectuees: 2,
        tarifHoraireApplique: 12000,
        salaireTotal: 24000,
        statutPaiement: 'En attente',
        remarque: 'Équations et inéquations du premier degré'
      });

      await TeacherShift.create({
        teacher: profFr._id,
        teacherName: `${profFr.nom} ${profFr.prenom}`,
        classe: 'Terminale L',
        matiere: 'Philosophie',
        dateShift: new Date(Date.now() - 86400000 * 1),
        heureDebut: '14:30',
        heureFin: '16:30',
        heuresEffectuees: 2,
        tarifHoraireApplique: 22000,
        salaireTotal: 44000,
        statutPaiement: 'En attente',
        remarque: 'Dissertation philosophique : La conscience'
      });
    }

    // Default admin seed
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        nom: 'Diallo',
        prenom: 'Amadou',
        pseudo: 'admin',
        password: 'admin'
      });
      console.log('[Seed Data] Compte Admin par défaut créé: Amadou Diallo (pseudo: admin, mdp: admin)');
    }
  } catch (err) {
    console.error('Erreur Seeding Data:', err);
  }
};

// Start Server
connectDB().then(async () => {
  await seedInitialData();
  app.listen(PORT, () => {
    console.log(`🚀 Serveur Backend actif sur le port ${PORT}`);
  });
});
