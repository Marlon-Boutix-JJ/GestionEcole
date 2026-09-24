import express from 'express';
import { checkLicenseStatus, activateLicense } from '../utils/licenseManager.js';

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

export default router;
