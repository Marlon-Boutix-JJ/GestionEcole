import { checkLicenseStatus, getMachineId } from '../utils/licenseManager.js';

export function licenseCheck(req, res, next) {
  // Allow license endpoints to be called without restriction
  const fullUrl = req.originalUrl || req.url || '';
  const relativePath = req.path || '';

  if (fullUrl.startsWith('/api/license') || relativePath.startsWith('/license')) {
    return next();
  }

  const status = checkLicenseStatus();
  if (!status.isActivated) {
    return res.status(423).json({
      error: 'APPLICATION_LOCKED',
      message: 'Cette application n\'est pas encore activée sur cet ordinateur.',
      machineId: status.machineId || getMachineId()
    });
  }

  next();
}
