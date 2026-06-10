const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src');
const searchString1 = '"/images/bastar/bastar-hero.webp"';
const replaceString1 = '"https://images.unsplash.com/photo-1432405972618-c60002a157c5?auto=format&fit=crop&w=1200&q=80"';
const searchString2 = '"/images/bastar/chitrakote.webp"';
const replaceString2 = '"https://images.unsplash.com/photo-1432405972618-c60002a157c5?auto=format&fit=crop&w=1200&q=80"';

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = false;
            if (content.includes(searchString1)) {
                content = content.split(searchString1).join(replaceString1);
                updated = true;
            }
            if (content.includes(searchString2)) {
                content = content.split(searchString2).join(replaceString2);
                updated = true;
            }
            if (updated) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    });
}

walkDir(directory);
console.log("Done");
