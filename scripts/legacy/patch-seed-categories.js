const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('apps/backend/prisma/seed.ts', 'utf8');

const regex = /const SEED_CATEGORIES = \[[\s\S]*?\];/;
const replacement = `const SEED_CATEGORIES = [
  { name: "Waterfalls", slug: "waterfalls" },
  { name: "Forests & Parks", slug: "forests" },
  { name: "Historic Temples", slug: "temples" },
  { name: "Tribal Villages", slug: "villages" },
  { name: "Hill Stations", slug: "hill-stations" },
  { name: "Caves & Rocks", slug: "caves" }
];`;

content = content.replace(regex, replacement);

fs.writeFileSync('apps/backend/prisma/seed.ts', content);
console.log("Patched SEED_CATEGORIES in seed.ts");
