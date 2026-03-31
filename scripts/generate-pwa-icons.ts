// Skrypt do generowania ikon PWA dla DISHLY
// Uruchom za pomocą: npx tsx scripts/generate-pwa-icons.ts

import * as fs from "fs";
import * as path from "path";

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(process.cwd(), "public", "icons");

// Generuj proste SVG ikony (później możesz zastąpić właściwymi PNG)
function generateSvgIcon(size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF4D4F;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF8C42;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Arial, sans-serif" font-weight="bold" font-size="${size * 0.35}" fill="white">
    D
  </text>
</svg>`;
}

// Upewnij się, że katalog istnieje
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generuj ikony SVG
for (const size of sizes) {
  const svg = generateSvgIcon(size);
  const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filePath, svg);
  console.log(`Generated: ${filePath}`);
}

console.log("\n✅ Ikony SVG zostały wygenerowane!");
console.log(
  "ℹ️  Zamień je na właściwe PNG używając narzędzia takiego jak ImageMagick lub online converter.",
);
console.log("   Możesz też użyć: https://realfavicongenerator.net/");
