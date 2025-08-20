const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Navigate to the landing page
  await page.goto('http://localhost:3002', { 
    waitUntil: 'networkidle2', 
    timeout: 30000 
  });
  
  // Wait for animations to complete
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Take screenshot
  await page.screenshot({ 
    path: 'landing-page-screenshot.png', 
    fullPage: true 
  });
  
  console.log('Screenshot saved as landing-page-screenshot.png');
  
  await browser.close();
})();