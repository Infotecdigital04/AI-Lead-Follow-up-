import { chromium } from 'playwright';
const browser = await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH || 'C:/Users/Admin/AppData/Local/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe'});
try {
  const page = await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'});
  for (const [route,file,ready] of [
    ['/demo/overview','workspace-complete.jpg','.workspace-footer'],
    ['/demo/jobs','workboard-complete.jpg','.workspace-footer'],
    ['/portal/demo','portal-complete.jpg','.client-footer'],
  ]) {
    await page.goto(`http://127.0.0.1:8793${route}`);
    await page.locator(ready).waitFor();
    await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:`public/${file}`,fullPage:true,type:'jpeg',quality:82});
    console.log(file,await page.evaluate(()=>({width:innerWidth,height:Math.max(innerHeight,document.documentElement.scrollHeight)})));
  }
} finally { await browser.close(); }
