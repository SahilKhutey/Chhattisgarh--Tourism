const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'apps/web/src/app/layout.tsx',
  'apps/web/src/app/login/page.tsx',
  'apps/web/src/app/metadata.ts',
  'apps/web/src/components/ChhattisgardhMap.tsx',
  'apps/web/src/store/locale-store.ts'
];

for (const relPath of filesToUpdate) {
  const fullPath = path.join(__dirname, relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/CG Tourism OS/g, 'हमार Chhattisgarh');
    content = content.replace(/CG TOURISM OS/g, 'हमार CHHATTISGARH');
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Updated', relPath);
  } else {
    console.log('Not found', relPath);
  }
}
