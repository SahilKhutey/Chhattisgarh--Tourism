import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const ASSETS = [
  {
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    dest: 'public/videos/waterfall.mp4'
  },
  {
    url: 'https://www.w3schools.com/html/mov_bbb.mp4', // Using BBB as a reliable public placeholder
    dest: 'public/videos/forest.mp4'
  },
  {
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    dest: 'public/videos/temple.mp4'
  },
  {
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    dest: 'public/videos/village.mp4'
  }
];

function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(__dirname, '..', destPath);
    const file = fs.createWriteStream(fullPath);
    
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${destPath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(fullPath, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log('Downloading CDN assets...');
  for (const asset of ASSETS) {
    try {
      await downloadFile(asset.url, asset.dest);
    } catch (e) {
      console.error(`Failed to download ${asset.dest}:`, e);
    }
  }
  console.log('CDN assets ready.');
}

run();
