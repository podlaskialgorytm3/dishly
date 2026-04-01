// Skrypt do generowania ikon PWA (PNG) dla DISHLY
// Uruchom za pomocą: npx tsx scripts/generate-pwa-icons.ts

import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(process.cwd(), "public", "icons");

// Generuj SVG template do konwersji na PNG
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

// Maskable icon (bez zaokrąglonych rogów, z większym paddingiem)
function generateMaskableSvg(size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF4D4F;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF8C42;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Arial, sans-serif" font-weight="bold" font-size="${size * 0.3}" fill="white">
    D
  </text>
</svg>`;
}

async function generateIcons() {
  console.log("Generating PWA icons...\n");

  // Upewnij się, że katalog istnieje
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Generuj ikony PNG w różnych rozmiarach
  for (const size of sizes) {
    const svgBuffer = Buffer.from(generateSvgIcon(size));
    const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);

    await sharp(svgBuffer).resize(size, size).png().toFile(pngPath);

    console.log(`✓ Generated: icon-${size}x${size}.png`);
  }

  // Generuj apple-touch-icon (180x180 zalecane dla iOS)
  const appleTouchSize = 180;
  const appleSvgBuffer = Buffer.from(generateSvgIcon(appleTouchSize));
  await sharp(appleSvgBuffer)
    .resize(appleTouchSize, appleTouchSize)
    .png()
    .toFile(path.join(iconsDir, "apple-touch-icon.png"));
  console.log("✓ Generated: apple-touch-icon.png");

  // Generuj maskable icon (512x512)
  const maskableSize = 512;
  const maskableSvgBuffer = Buffer.from(generateMaskableSvg(maskableSize));
  await sharp(maskableSvgBuffer)
    .resize(maskableSize, maskableSize)
    .png()
    .toFile(path.join(iconsDir, "maskable-icon-512x512.png"));
  console.log("✓ Generated: maskable-icon-512x512.png");

  // Generuj favicon.ico (32x32)
  const faviconSvgBuffer = Buffer.from(generateSvgIcon(32));
  await sharp(faviconSvgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(iconsDir, "favicon-32x32.png"));
  console.log("✓ Generated: favicon-32x32.png");

  console.log("\n✅ Wszystkie ikony PNG zostały wygenerowane!");
}

generateIcons().catch(console.error);
