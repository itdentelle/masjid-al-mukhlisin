const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const artifactDir = 'C:/Users/itden/.gemini/antigravity-ide/brain/1be90297-19b6-4cbe-ad51-db55e88feb08';
const emblemImg = path.join(artifactDir, 'app_icon_emblem_1793175657146.jpg');

async function createPreviews() {
  const size = 512;
  const circleSvg = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/></svg>`);

  await sharp(emblemImg)
    .resize(size, size)
    .composite([{ input: circleSvg, blend: 'dest-in' }])
    .png()
    .toFile(path.join(artifactDir, 'icon_preview_round.png'));

  const radius = Math.round(size * 0.22);
  const squircleSvg = Buffer.from(`<svg width="${size}" height="${size}"><rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/></svg>`);

  await sharp(emblemImg)
    .resize(size, size)
    .composite([{ input: squircleSvg, blend: 'dest-in' }])
    .png()
    .toFile(path.join(artifactDir, 'icon_preview_squircle.png'));

  console.log('Round and squircle previews created successfully!');
}

createPreviews().catch(console.error);
