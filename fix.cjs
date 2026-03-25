const fs = require('fs');
const path = require('path');

const traverseDir = (dir) => {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let modified = content
        .replace(/\bbg-white\b/g, 'bg-card text-card-foreground')
        .replace(/\bborder-gray-200\b/g, 'border-border')
        .replace(/\bborder-gray-100\b/g, 'border-border/50')
        .replace(/\bborder-gray-300\b/g, 'border-border')
        .replace(/\btext-gray-900\b/g, 'text-foreground')
        .replace(/\btext-gray-800\b/g, 'text-foreground')
        .replace(/\btext-gray-700\b/g, 'text-muted-foreground')
        .replace(/\btext-gray-600\b/g, 'text-muted-foreground')
        .replace(/\btext-gray-500\b/g, 'text-muted-foreground')
        .replace(/\bbg-gray-50\b/g, 'bg-muted')
        .replace(/\bbg-gray-100\b/g, 'bg-muted/50')
        .replace(/\bbg-gray-200\b/g, 'bg-accent')
        .replace(/\bhover:bg-gray-50\b/g, 'hover:bg-muted')
        .replace(/\bhover:bg-gray-100\b/g, 'hover:bg-accent')
        .replace(/\bhover:text-gray-900\b/g, 'hover:text-foreground')
        .replace(/\bhover:text-gray-700\b/g, 'hover:text-foreground');

      if (content !== modified) {
        fs.writeFileSync(fullPath, modified, 'utf8');
        console.log('Fixed', fullPath);
      }
    }
  });
};

traverseDir('src/app');
