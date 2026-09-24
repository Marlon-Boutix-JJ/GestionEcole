import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Secret Master Key used ONLY to sign and verify HWID activation keys
const MASTER_SECRET_KEY = "AGY_SECURE_MASTER_KEY_GESTION_ELEVES_PRO_2026";

// File path for storing local activation license
const LICENSE_FILE_PATH = path.join(__dirname, '../license.json');

/**
 * Generates a unique, stable Machine Hardware ID (HWID) based on OS & CPU characteristics
 */
export function getMachineId() {
  try {
    const hostname = os.hostname();
    const platform = os.platform();
    const arch = os.arch();
    const cpus = os.cpus().map(c => c.model).join(',');
    const userInfo = os.userInfo().username;
    
    // Combine hardware characteristics
    const rawHardwareString = `${hostname}-${platform}-${arch}-${cpus}-${userInfo}`;
    
    // Hash to SHA256 and truncate into a clean key format: HWID-XXXX-XXXX-XXXX
    const hash = crypto.createHash('sha256').update(rawHardwareString).digest('hex').toUpperCase();
    
    const part1 = hash.substring(0, 4);
    const part2 = hash.substring(4, 8);
    const part3 = hash.substring(8, 12);
    const part4 = hash.substring(12, 16);

    return `HWID-${part1}-${part2}-${part3}-${part4}`;
  } catch (error) {
    return 'HWID-GENERIC-OFFLINE-MACHINE-0001';
  }
}

/**
 * Computes the valid Activation Key for a given Machine ID using HMAC-SHA256
 */
export function generateKeyForMachine(machineId) {
  const cleanHWID = machineId.trim().toUpperCase();
  const hmac = crypto.createHmac('sha256', MASTER_SECRET_KEY);
  hmac.update(cleanHWID);
  const hash = hmac.digest('hex').toUpperCase();

  const part1 = hash.substring(0, 4);
  const part2 = hash.substring(4, 8);
  const part3 = hash.substring(8, 12);
  const part4 = hash.substring(12, 16);

  return `LIC-${part1}-${part2}-${part3}-${part4}`;
}

/**
 * Checks if the application is licensed and activated on the current machine
 */
export function checkLicenseStatus() {
  const currentHWID = getMachineId();

  if (!fs.existsSync(LICENSE_FILE_PATH)) {
    return { isActivated: false, machineId: currentHWID };
  }

  try {
    const data = JSON.parse(fs.readFileSync(LICENSE_FILE_PATH, 'utf8'));
    
    // Check if the saved license matches THIS machine's HWID
    if (data.machineId !== currentHWID) {
      return { isActivated: false, machineId: currentHWID, reason: 'HWID_MISMATCH' };
    }

    // Verify key signature validity
    const expectedKey = generateKeyForMachine(currentHWID);
    if (data.key !== expectedKey) {
      return { isActivated: false, machineId: currentHWID, reason: 'KEY_INVALID' };
    }

    return { isActivated: true, machineId: currentHWID, activatedAt: data.activatedAt };
  } catch (err) {
    return { isActivated: false, machineId: currentHWID, reason: 'FILE_CORRUPTED' };
  }
}

/**
 * Validates user key and saves activation license file locally
 */
export function activateLicense(providedKey) {
  const currentHWID = getMachineId();
  const formattedProvidedKey = providedKey ? providedKey.trim().toUpperCase() : '';
  const expectedKey = generateKeyForMachine(currentHWID);

  if (formattedProvidedKey !== expectedKey) {
    return { success: false, message: "La clé d'activation saisie est invalide pour cet ordinateur." };
  }

  const licenseData = {
    machineId: currentHWID,
    key: formattedProvidedKey,
    activatedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(LICENSE_FILE_PATH, JSON.stringify(licenseData, null, 2), 'utf8');
    return { success: true, message: "Licence activée avec succès pour cet ordinateur !" };
  } catch (err) {
    return { success: false, message: "Erreur lors de l'enregistrement de la licence." };
  }
}
