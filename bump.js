const fs = require('fs');
try {
  const file = 'sw.js';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    const newVer = `al-fatiha-v${Date.now()}`;
    content = content.replace(/const CACHE_VERSION = "[^"]*"/, `const CACHE_VERSION = "${newVer}"`);
    fs.writeFileSync(file, content, 'utf8');
  }
} catch (e) {
  // Silent fallback
}
