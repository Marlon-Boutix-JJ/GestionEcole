import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_gestion_eleves_2026';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    Register new Admin account
router.post('/register', authLimiter, async (req, res) => {
  try {
    let { nom, prenom, pseudo, password, confirmPassword } = req.body;

    // Type checking to prevent Object injection vulnerabilities
    if (
      typeof nom !== 'string' ||
      typeof prenom !== 'string' ||
      typeof password !== 'string' ||
      typeof confirmPassword !== 'string'
    ) {
      return res.status(400).json({ message: 'Les types des champs doivent être des chaînes de caractères.' });
    }

    nom = nom.trim();
    prenom = prenom.trim();
    pseudo = typeof pseudo === 'string' ? pseudo.trim() : '';

    // Validations
    if (!nom || !prenom || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires (Nom, Prénom, Mot de passe).' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    // Check if admin already exists with same nom + prenom or pseudo
    const existingAdmin = await Admin.findOne({
      $or: [
        { nom, prenom },
        ...(pseudo ? [{ pseudo }] : [])
      ]
    });

    if (existingAdmin) {
      return res.status(400).json({ message: 'Un compte avec ce nom/prénom ou ce pseudo existe déjà.' });
    }

    const admin = await Admin.create({
      nom,
      prenom,
      pseudo,
      password
    });

    const token = generateToken(admin._id);

    return res.status(201).json({
      _id: admin._id,
      nom: admin.nom,
      prenom: admin.prenom,
      pseudo: admin.pseudo,
      token
    });
  } catch (error) {
    console.error('Erreur Inscription Admin:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la création du compte.' });
  }
});

// @route   POST /api/auth/login
// @desc    Login Admin
router.post('/login', authLimiter, async (req, res) => {
  try {
    let { identifier, password } = req.body;

    if (typeof identifier !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'L\'identifiant et le mot de passe doivent être des chaînes de caractères.' });
    }

    identifier = identifier.trim();

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Veuillez fournir un identifiant et un mot de passe.' });
    }

    const admin = await Admin.findOne({
      $or: [
        { pseudo: identifier },
        { nom: identifier }
      ]
    });

    if (admin && (await admin.matchPassword(password))) {
      const token = generateToken(admin._id);
      return res.json({
        _id: admin._id,
        nom: admin.nom,
        prenom: admin.prenom,
        pseudo: admin.pseudo,
        token
      });
    } else {
      return res.status(401).json({ message: 'Identifiant ou mot de passe incorrect.' });
    }
  } catch (error) {
    console.error('Erreur Connexion Admin:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
  }
});

export default router;
