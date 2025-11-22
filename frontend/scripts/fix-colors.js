const fs = require('fs');
const path = require('path');

const directories = ['app', 'components'];

function fixColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Supprimer toutes les classes dark:
  const beforeDark = content;
  content = content.replace(/\s+dark:[a-zA-Z0-9\-_:\/\[\]]+/g, '');
  if (content !== beforeDark) {
    modified = true;
    console.log(`  Supprimé dark: classes`);
  }

  // Remplacer text-white par text-gray-900 (sauf si dans un bg sombre)
  const textWhiteRegex = /className="([^"]*?)text-white([^"]*)"/g;
  const matches = [...content.matchAll(textWhiteRegex)];

  matches.forEach(match => {
    const fullClass = match[1] + 'text-white' + match[2];
    // Si la classe contient bg-blue, bg-purple, bg-gradient, etc. on garde text-white
    if (!/bg-(blue|purple|indigo|green|red|gradient)/.test(fullClass)) {
      const newClass = fullClass.replace('text-white', 'text-gray-900');
      content = content.replace(match[0], `className="${newClass}"`);
      modified = true;
      console.log(`  Remplacé text-white par text-gray-900`);
    }
  });

  // Remplacer bg-gray-900 par bg-white (pour les backgrounds principaux)
  if (content.includes('bg-gray-900') && !content.includes('footer')) {
    content = content.replace(/bg-gray-900/g, 'bg-white');
    modified = true;
    console.log(`  Remplacé bg-gray-900 par bg-white`);
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Corrigé: ${filePath}\n`);
    return true;
  }
  return false;
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.match(/\.(tsx|jsx|ts|js)$/)) {
      console.log(`Analyse: ${filePath}`);
      fixColors(filePath);
    }
  });
}

console.log('🎨 Correction des couleurs...\n');
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    scanDirectory(dir);
  }
});
console.log('\n✅ Terminé !');