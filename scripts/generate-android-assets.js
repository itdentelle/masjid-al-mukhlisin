const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const resDir = path.join(__dirname, '../android/app/src/main/res');
const iconSrcPath = path.join(__dirname, '../public/images/app-icon.png');

if (!fs.existsSync(iconSrcPath)) {
  console.error('Source icon not found:', iconSrcPath);
  process.exit(1);
}

const iconDensities = [
  { dir: 'mipmap-mdpi', size: 48, fgSize: 108 },
  { dir: 'mipmap-hdpi', size: 72, fgSize: 162 },
  { dir: 'mipmap-xhdpi', size: 96, fgSize: 216 },
  { dir: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
  { dir: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
];

const splashScreens = [
  { dir: 'drawable', w: 480, h: 320 },
  { dir: 'drawable-port-mdpi', w: 320, h: 480 },
  { dir: 'drawable-port-hdpi', w: 480, h: 800 },
  { dir: 'drawable-port-xhdpi', w: 720, h: 1280 },
  { dir: 'drawable-port-xxhdpi', w: 960, h: 1600 },
  { dir: 'drawable-port-xxxhdpi', w: 1280, h: 1920 },
  { dir: 'drawable-land-mdpi', w: 480, h: 320 },
  { dir: 'drawable-land-hdpi', w: 800, h: 480 },
  { dir: 'drawable-land-xhdpi', w: 1280, h: 720 },
  { dir: 'drawable-land-xxhdpi', w: 1600, h: 960 },
  { dir: 'drawable-land-xxxhdpi', w: 1920, h: 1280 },
];

async function generateAssets() {
  console.log('--- Generating Android Luxury 3D Gold App Icons ---');

  for (const item of iconDensities) {
    const targetDir = path.join(resDir, item.dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // 1. Square / Squircle Legacy Launcher Icon (ic_launcher.png)
    const squircleRadius = Math.round(item.size * 0.22);
    const squircleSvg = Buffer.from(
      `<svg width="${item.size}" height="${item.size}"><rect x="0" y="0" width="${item.size}" height="${item.size}" rx="${squircleRadius}" ry="${squircleRadius}" fill="white"/></svg>`
    );
    await sharp(iconSrcPath)
      .resize(item.size, item.size)
      .composite([{ input: squircleSvg, blend: 'dest-in' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // 2. Round Launcher Icon (ic_launcher_round.png)
    const circleSvg = Buffer.from(
      `<svg width="${item.size}" height="${item.size}"><circle cx="${item.size/2}" cy="${item.size/2}" r="${item.size/2}" fill="white"/></svg>`
    );
    await sharp(iconSrcPath)
      .resize(item.size, item.size)
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // 3. Foreground Adaptive Icon (ic_launcher_foreground.png)
    // Sized to fit safely within the 72dp viewport inside 108dp canvas (approx 74%)
    const fgEmblemSize = Math.round(item.fgSize * 0.74);
    const fgCircleSvg = Buffer.from(
      `<svg width="${fgEmblemSize}" height="${fgEmblemSize}"><circle cx="${fgEmblemSize/2}" cy="${fgEmblemSize/2}" r="${fgEmblemSize/2}" fill="white"/></svg>`
    );

    const emblemBuffer = await sharp(iconSrcPath)
      .resize(fgEmblemSize, fgEmblemSize)
      .composite([{ input: fgCircleSvg, blend: 'dest-in' }])
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: item.fgSize,
        height: item.fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: emblemBuffer, gravity: 'center' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`Generated icons for ${item.dir}`);
  }

  // Update background color in values/ic_launcher_background.xml
  const bgColorXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#064b36</color>
</resources>
`;
  fs.writeFileSync(path.join(resDir, 'values/ic_launcher_background.xml'), bgColorXml);

  console.log('--- Generating Splash Screens ---');

  for (const splash of splashScreens) {
    const targetDir = path.join(resDir, splash.dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // Logo size proportional to min dimension (38%)
    const minDim = Math.min(splash.w, splash.h);
    const logoSize = Math.round(minDim * 0.38);

    const circleSvg = Buffer.from(
      `<svg width="${logoSize}" height="${logoSize}"><circle cx="${logoSize/2}" cy="${logoSize/2}" r="${logoSize/2}" fill="white"/></svg>`
    );

    const logoBuffer = await sharp(iconSrcPath)
      .resize(logoSize, logoSize)
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: splash.w,
        height: splash.h,
        channels: 4,
        background: { r: 6, g: 75, b: 54, alpha: 1 } // #064b36
      }
    })
      .composite([{ input: logoBuffer, gravity: 'center' }])
      .png()
      .toFile(path.join(targetDir, 'splash.png'));

    console.log(`Generated splash for ${splash.dir} (${splash.w}x${splash.h})`);
  }

  console.log('--- Updating Web Icon / Favicon ---');
  // Also create a 192x192 & 512x512 PWA/web icon in public
  await sharp(iconSrcPath)
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, '../public/icon-192.png'));

  await sharp(iconSrcPath)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '../public/icon-512.png'));

  console.log('All Android and web assets generated successfully!');
}

generateAssets().catch(console.error);
