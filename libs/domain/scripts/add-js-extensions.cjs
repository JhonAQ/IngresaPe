const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, callback);
    } else if (stat.isFile() && fullPath.endsWith('.js')) {
      callback(fullPath);
    }
  }
}

function addJsExtensions(filePath) {
  const original = fs.readFileSync(filePath, 'utf-8');
  // Añade .js a imports/exports relativos que no tengan extensión
  const updated = original.replace(
    /(from\s+['"])(\.\/[^'"]+?|\.\.\/[^'"]+?)(['"])/g,
    (match, prefix, importPath, suffix) => {
      if (importPath.endsWith('.js') || importPath.endsWith('.json')) {
        return match;
      }
      return `${prefix}${importPath}.js${suffix}`;
    }
  );

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf-8');
  }
}

walk(distDir, addJsExtensions);
console.log('✅ JS extensions added to dist imports');
