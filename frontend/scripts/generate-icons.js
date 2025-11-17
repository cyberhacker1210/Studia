const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fond dégradé
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#667eea');  // Bleu
  gradient.addColorStop(1, '#764ba2');  // Violet

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Arrondir les coins (optionnel)
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  const radius = size * 0.2; // 20% de rayon
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  ctx.globalCompositeOperation = 'source-over';

  // Lettre "S" stylisée
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', size / 2, size / 2);

  // Sauvegarder
  const buffer = canvas.toBuffer('image/png');
  const filename = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(filename, buffer);
  console.log(`✅ Créé: icon-${size}x${size}.png`);
}

// Générer toutes les tailles
sizes.forEach(size => generateIcon(size));

// Apple Touch Icon (180x180)
generateIcon(180);
fs.renameSync(
  path.join(iconsDir, 'icon-180x180.png'),
  path.join(iconsDir, 'apple-touch-icon.png')
);
console.log('✅ Créé: apple-touch-icon.png');

console.log('\n🎉 Toutes les icônes ont été générées avec succès !');