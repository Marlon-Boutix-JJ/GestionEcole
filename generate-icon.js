import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard 32x32 ICO header and BMP header buffer
function createIcoBuffer() {
  const icoHeader = Buffer.from([
    0, 0,             // Reserved
    1, 0,             // Type 1 (ICO)
    1, 0,             // 1 image
    // Image entry
    32,               // Width 32
    32,               // Height 32
    0,                // Palette
    0,                // Reserved
    1, 0,             // Color planes
    32, 0,            // Bits per pixel (32)
    0, 4, 0, 0,       // Size of image data (1024 + 40)
    22, 0, 0, 0       // Offset of image data
  ]);

  const bmpHeader = Buffer.alloc(40);
  bmpHeader.writeUInt32LE(40, 0);       // Header size
  bmpHeader.writeInt32LE(32, 4);        // Width
  bmpHeader.writeInt32LE(64, 8);        // Height (double for XOR+AND mask)
  bmpHeader.writeUInt16LE(1, 12);       // Planes
  bmpHeader.writeUInt16LE(32, 14);      // Bits per pixel
  bmpHeader.writeUInt32LE(0, 16);       // Compression (BI_RGB)
  bmpHeader.writeUInt32LE(32 * 32 * 4, 20); // Image size

  const pixelData = Buffer.alloc(32 * 32 * 4);
  // Fill with Emerald Color (#059669 -> BGRA: 0x69, 0x96, 0x05, 0xFF)
  for (let i = 0; i < 32 * 32; i++) {
    pixelData[i * 4 + 0] = 0x69; // Blue
    pixelData[i * 4 + 1] = 0x96; // Green
    pixelData[i * 4 + 2] = 0x05; // Red
    pixelData[i * 4 + 3] = 0xFF; // Alpha
  }

  const andMask = Buffer.alloc(32 * 4, 0);

  return Buffer.concat([icoHeader, bmpHeader, pixelData, andMask]);
}

const icoBuf = createIcoBuffer();
fs.writeFileSync(path.join(__dirname, 'app-icon.ico'), icoBuf);
console.log('Icon app-icon.ico generated successfully!');
