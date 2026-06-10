const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace all variations of the placehold.co URL
    content = content.replace(/https:\/\/placehold\.co\/[^\s"'\`\}]+/g, '/fallback.jpg');
    
    // Also fix any remaining broken URLs that might have been missed
    content = content.replace(/\/fallback\.jpg\}/g, '/fallback.jpg');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
        changedFiles++;
    }
});

console.log(`Replaced placeholders in ${changedFiles} files.`);
