import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_gestion_eleves_2026';

// Middleware to verify JWT Token on protected endpoints
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header Bearer <token>
      token = req.headers.authorization.split(' ')[1];

      // Verify token signature
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach admin profile (without password hash) to request
      req.admin = await Admin.findById(decoded.id).select('-password');

      if (!req.admin) {
        return res.status(401).json({ message: 'Non autorisé: Utilisateur non trouvé.' });
      }

      return next();
    } catch (error) {
      console.error('Erreur de validation Token JWT:', error.message);
      return res.status(401).json({ message: 'Non autorisé: Token invalide ou expiré.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé: Absence de token d\'authentification.' });
  }
};
