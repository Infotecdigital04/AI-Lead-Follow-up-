import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH || 'C:/Users/Admin/AppData/Local/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe'});
const base=process.env.TEST_BASE_URL || 'http://127.0.0.1:8793';
try {
  const errors=[];
  for(const [width,height] of [[1366,768],[1440,900],[390,844],[320,667]]) {
    const p=await browser.newPage({viewport:{width,height}});
    p.on('pageerror',e=>errors.push(e.message));
    await p.goto(base);
    await p.locator('[data-motion="gsap"]').waitFor();
    await p.waitForTimeout(1400);
    await p.screenshot({path:`test-results/motion-start-${width}.png`});
    const before=await p.locator('.rn-hero-product').boundingBox();
    await p.evaluate(()=>window.scrollTo({top:innerHeight*.7,behavior:'instant'}));
    await p.waitForTimeout(1200);
    const after=await p.locator('.rn-hero-product').boundingBox();
    if(width>=900){
      assert.ok(after.width>before.width*1.2,'Scroll zoom is missing');
      assert.ok(after.y>=76 && after.y+after.height<=height,'Animated screen clips');
    }
    await p.screenshot({path:`test-results/motion-scrolled-${width}.png`});
    await p.getByRole('button',{name:'Daily focus',exact:true}).click();
    await p.locator('.rn-screen-link img').evaluate(img=>img.decode());
    const image=await p.locator('.rn-screen-link img').evaluate(img=>({src:img.src,w:img.naturalWidth,h:img.naturalHeight}));
    assert.ok(image.h>1700,'Truncated dashboard capture returned');
    await p.locator('.rn-closing').scrollIntoViewIfNeeded();
    assert.ok((await p.locator('.rn-closing').boundingBox()).height<310,'Closing section too tall');
    await p.locator('.rn-footer').scrollIntoViewIfNeeded();
    await p.screenshot({path:`test-results/motion-footer-${width}.png`});
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow');
    await p.goto(base+'/demo/overview');
    assert.equal(await p.locator('.pin-spacer').count(),0,'Pin leaked into app');
    console.log({width,zoom:after.width/before.width,image});
    await p.close();
  }
  const reduced=await browser.newPage({reducedMotion:'reduce'});
  await reduced.goto(base);
  await reduced.waitForTimeout(800);
  assert.equal(await reduced.locator('[data-motion="gsap"],.pin-spacer').count(),0);
  assert.equal(await reduced.locator('.rn-reveal').first().evaluate(e=>getComputedStyle(e).opacity),'1');
  const nojs=await browser.newPage({javaScriptEnabled:false});
  await nojs.goto(base);
  assert.equal(await nojs.locator('h1').textContent(),'Relaynest.');
  assert.deepEqual(errors,[]);
  console.log('Scroll zoom, complete captures, footer height, route cleanup, reduced motion and no-JS checks passed.');
}finally{await browser.close();}
