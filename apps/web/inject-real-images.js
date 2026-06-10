const fs = require('fs');
const path = require('path');

const realImages = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Chitrakot_waterfalls.JPG/1280px-Chitrakot_waterfalls.JPG",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bhoramdeo_Temple%2C_Kawardha.jpg/1280px-Bhoramdeo_Temple%2C_Kawardha.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/MAINPAT%2CAMBIKAPUR_CG.jpg/1280px-MAINPAT%2CAMBIKAPUR_CG.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Danteswari_Temple_0034.jpg/1280px-Danteswari_Temple_0034.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/1/19/Kanger_valley_National_Park.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Mahanadi_from_Banki.jpg/1280px-Mahanadi_from_Banki.jpg"
];

const fallbackPlacesMap = {
  "chitrakote-falls": realImages[0],
  "tirathgarh-falls": realImages[4],
  "kanger-valley": realImages[4],
  "bhoramdeo-temple": realImages[1],
  "danteshwari-temple": realImages[3],
  "mainpat-hill-station": realImages[2]
};

// 1. Update fallback-places.ts
const fallbackPlacesPath = path.join(__dirname, 'src', 'app', 'data', 'fallback-places.ts');
let fpContent = fs.readFileSync(fallbackPlacesPath, 'utf8');

for (const [slug, imgUrl] of Object.entries(fallbackPlacesMap)) {
  const regex = new RegExp(`slug:\\s*"${slug}",[\\s\\S]*?heroImage:\\s*"[^"]+"`);
  fpContent = fpContent.replace(regex, match => {
    return match.replace(/heroImage:\s*"[^"]+"/, `heroImage: "${imgUrl}"`);
  });
}
fs.writeFileSync(fallbackPlacesPath, fpContent, 'utf8');
console.log("Updated fallback-places.ts");

// 2. Update api.ts
const apiPath = path.join(__dirname, 'src', 'app', 'data', 'api.ts');
let apiContent = fs.readFileSync(apiPath, 'utf8');

// Replace the fallback arrays inside api.ts
const fallbacksArrayString = `[
        "${realImages[0]}",
        "${realImages[1]}",
        "${realImages[2]}",
        "${realImages[3]}",
        "${realImages[4]}",
        "${realImages[5]}"
      ]`;

apiContent = apiContent.replace(/const fallbacks = \[\s*"(?:\/fallback\.jpg|https:\/\/placehold\.co\/[^"]+)",[\s\S]*?\];/g, `const fallbacks = ${fallbacksArrayString};`);

// Replace remaining individual occurrences of /fallback.jpg or placehold
// We can just use replace repeatedly
let i = 0;
while (apiContent.includes('"/fallback.jpg"') || apiContent.includes('https://placehold.co/')) {
    apiContent = apiContent.replace(/\/fallback\.jpg|https:\/\/placehold\.co\/[^\s"'\`\}]+/, realImages[i % realImages.length]);
    i++;
}

fs.writeFileSync(apiPath, apiContent, 'utf8');
console.log("Updated api.ts");

// 3. Update page.tsx (specifically the hero slides)
const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

let j = 0;
while (pageContent.includes('"/fallback.jpg"')) {
    pageContent = pageContent.replace(/\/fallback\.jpg/, realImages[j % realImages.length]);
    j++;
}
fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log("Updated page.tsx");

// 4. Update explore/page.tsx (or any other files holding /fallback.jpg)
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

const allFiles = walk(path.join(__dirname, 'src'));
allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    let k = 0;
    while (content.includes('"/fallback.jpg"')) {
        content = content.replace(/\/fallback\.jpg/, realImages[k % realImages.length]);
        k++;
    }
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated globally', file);
    }
});

