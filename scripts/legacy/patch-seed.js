const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('apps/backend/prisma/seed.ts', 'utf8');

if (!content.includes('import * as fs')) {
    content = content.replace("import * as bcrypt from 'bcrypt';", "import * as bcrypt from 'bcrypt';\nimport * as fs from 'fs';\nimport * as path from 'path';");
}

const regex = /const SEED_DESTINATIONS = \[[\s\S]*?\];/;
const replacement = "const SEED_DESTINATIONS = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/destinations/batch_real.json'), 'utf8'));";

content = content.replace(regex, replacement);

fs.writeFileSync('apps/backend/prisma/seed.ts', content);
console.log("Patched seed.ts");
