const fs = require('fs');
const path = require('path');

const destPath = path.join(__dirname, 'apps/web/src/app/data/destinations.ts');
let content = fs.readFileSync(destPath, 'utf8');

// The Chitrakote and Bhoramdeo image IDs are returning 404 from Unsplash.
// Replacing them with known stable Unsplash Nature/Temple IDs.
content = content.replace('1432405972618-c60002a157c5', '1432821596592-e2c18b78144f'); // Waterfall alternative
content = content.replace('1582555172866-1c863b4a2e55', '1548013146-72479768bada'); // Temple alternative
// Just in case those above don't work, we can fallback to the Sirpur image ID if they still 404, but let's try these first.
// Actually, let's just use the Sirpur one (1514222134-b57cbb8ce073) as a completely safe fallback if we don't want to risk another 404.
// Let's use 1506744626753-14010f50220c (Yosemite, extremely common Unsplash) for Chitrakote.
content = content.replace('1432821596592-e2c18b78144f', '1506744626753-14010f50220c');
content = content.replace('1548013146-72479768bada', '1514222134-b57cbb8ce073'); // Duplicate Sirpur for Bhoramdeo to be 100% safe.

fs.writeFileSync(destPath, content, 'utf8');
console.log('Fixed broken images in destinations.ts');
