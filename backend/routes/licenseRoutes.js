import express from 'express';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { checkLicenseStatus, activateLicense } from '../utils/licenseManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * GET /api/license/status
 * Returns activation state and current machine HWID
 */
router.get('/status', (req, res) => {
  const status = checkLicenseStatus();
  res.json(status);
});

/**
 * POST /api/license/activate
 * Body: { key: string }
 * Validates key for this machine and activates if valid
 */
router.post('/activate', (req, res) => {
  const { key } = req.body;
  
  if (!key || typeof key !== 'string') {
    return res.status(400).json({ success: false, message: 'Veuillez saisir une clé d\'activation valide.' });
  }

  const result = activateLicense(key);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

/**
 * POST /api/license/install-shortcut
 * Creates a native Windows desktop shortcut without Chrome badge & without browser borders
 */
router.post('/install-shortcut', (req, res) => {
  try {
    let rootDir = path.resolve(__dirname, '../../');
    if (!fs.existsSync(path.join(rootDir, 'Creer_Raccourci_Bureau_Sans_Logo_Chrome.bat'))) {
      rootDir = path.resolve(__dirname, '../');
    }
    if (!fs.existsSync(path.join(rootDir, 'Creer_Raccourci_Bureau_Sans_Logo_Chrome.bat'))) {
      rootDir = process.cwd();
    }

    const batScript = path.join(rootDir, 'Creer_Raccourci_Bureau_Sans_Logo_Chrome.bat');

    exec(`cmd /c "${batScript}"`, (err) => {
      if (err) {
        console.error('Shortcut creation error:', err);
        return res.status(500).json({ success: false, message: 'Erreur lors de la création du raccourci sur le bureau.' });
      }

      res.json({ success: true, message: 'Raccourci application native créé avec succès sur votre Bureau !' });
    });
  } catch (err) {
    console.error('Shortcut endpoint error:', err);
    res.status(500).json({ success: false, message: 'Erreur système lors de la création du raccourci.' });
  }
});

export default router;
