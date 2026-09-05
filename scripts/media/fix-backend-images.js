const fs = require('fs');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.json') || file.endsWith('.ts') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('apps/backend/prisma');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    content = content.replace(/https:\/\/upload\.wikimedia\.org\/[^\s"'\`\}]+/g, 'https://placehold.co/1200x800/115e59/ffffff.png?text=CG+Tourism');
    content = content.replace(/https:\/\/picsum\.photos\/seed\/[^\s"'\`\}]+/g, 'https://placehold.co/1200x800/115e59/ffffff.png?text=CG+Tourism');
    content = content.replace(/https:\/\/picsum\.photos\/[^\s"'\`\}]+/g, 'https://placehold.co/1200x800/115e59/ffffff.png?text=CG+Tourism');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});
