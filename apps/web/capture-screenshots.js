// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium } = require('playwright');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const artifactDir = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\e538396c-93bf-4121-a736-54dd0e47a337';
  
  // Create images dir if it doesn't exist
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  try {
    console.log('Navigating to http://localhost:3000...');
    // Retry mechanism to ensure server is up
    for(let i=0; i<5; i++){
      try {
        await page.goto('http://localhost:3000', { timeout: 10000 });
        break;
      } catch (e) {
        console.log(`Retry ${i+1}...`);
        await page.waitForTimeout(3000);
      }
    }
    
    // Screenshot 1: Default Homepage
    console.log('Taking default homepage screenshot...');
    await page.waitForTimeout(2000); // Wait for hydration and animations
    await page.screenshot({ path: path.join(artifactDir, 'home_default.png'), fullPage: false });

    // Click Hindi Language Switcher
    console.log('Switching to Hindi...');
    const hindiButton = page.getByRole('button', { name: 'हिन्दी' });
    await hindiButton.waitFor({ state: 'visible', timeout: 5000 });
    await hindiButton.click();
    await page.waitForTimeout(1000);
    
    // Screenshot 2: Hindi Translation Applied
    await page.screenshot({ path: path.join(artifactDir, 'home_hindi.png'), fullPage: false });

    // Open Voice Translator
    console.log('Opening Voice Translator...');
    const voiceButton = page.getByTitle('Live Voice Translator');
    await voiceButton.waitFor({ state: 'visible', timeout: 5000 });
    await voiceButton.click();
    await page.waitForTimeout(1000);

    // Screenshot 3: Voice Translator Dialog Open
    await page.screenshot({ path: path.join(artifactDir, 'voice_translator.png'), fullPage: false });

    console.log('Successfully captured screenshots!');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
  }
}

capture();
