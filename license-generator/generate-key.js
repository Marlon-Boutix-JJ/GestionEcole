import crypto from 'crypto';

const MASTER_SECRET_KEY = "AGY_SECURE_MASTER_KEY_GESTION_ELEVES_PRO_2026";

const hwidArg = process.argv[2];

if (!hwidArg) {
  console.log('\n❌ Usage: node generate-key.js <HWID-CODE>');
  console.log('Exemple: node generate-key.js HWID-9F8A-3B2C-1D4E\n');
  process.exit(1);
}

const cleanHWID = hwidArg.trim().toUpperCase();

const hmac = crypto.createHmac('sha256', MASTER_SECRET_KEY);
hmac.update(cleanHWID);
const hash = hmac.digest('hex').toUpperCase();

const part1 = hash.substring(0, 4);
const part2 = hash.substring(4, 8);
const part3 = hash.substring(8, 12);
const part4 = hash.substring(12, 16);

const generatedKey = `LIC-${part1}-${part2}-${part3}-${part4}`;

console.log('\n=================================================');
console.log('🔑 GÉNÉRATEUR DE LICENCE MATÉRIELLE - ADMIN');
console.log('=================================================');
console.log(`CODE HWID CLIENT : ${cleanHWID}`);
console.log(`CLÉ D'ACTIVATION  : ${generatedKey}`);
console.log('=================================================\n');
