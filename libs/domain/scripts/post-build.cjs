const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

function addJsExtensions(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      addJsExtensions(fullPath);
    } else if (entry.name.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf-8');

      // Añadir .js a imports relativos que no tengan extensión
      content = content.replace(
        /from\s+['"](\.\/[^'"]+?)['"]/g,
        (match, importPath) => {
          // Si ya tiene extensión, no modificar
          if (importPath.endsWith('.js') || importPath.endsWith('.json')) {
            return match;
          }
          return `from '${importPath}.js'`;
        }
      );

      fs.writeFileSync(fullPath, content);
      console.log(`✓ Fixed imports in ${path.relative(distDir, fullPath)}`);
    }
  }
}

if (fs.existsSync(distDir)) {
  addJsExtensions(distDir);
  console.log('✅ Post-build: Added .js extensions to ESM imports');
} else {
  console.error('❌ dist directory not found');
  process.exit(1);
}
