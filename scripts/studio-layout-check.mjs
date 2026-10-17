import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({headless:true, channel:"msedge"});
try {
  const page = await browser.newPage();
  for (const [width,height] of [[1366,768],[390,844],[320,667]]) {
    await page.setViewportSize({width,height});
    await page.goto(process.env.TEST_BASE_URL || "http://127.0.0.1:8793");
    await page.locator('.rn-motion').waitFor();
    await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:`test-results/layout-hero-${width}.png`});
    const hero = await page.locator('.rn-hero-product img').evaluate(img=>{
      const r=img.getBoundingClientRect(), section=img.closest('section').getBoundingClientRect();
      return {ratio:r.width/r.height,natural:img.naturalWidth/img.naturalHeight,gap:section.bottom-r.bottom};
    });
    assert.ok(Math.abs(hero.ratio-hero.natural)<.02,'Hero distorted');
    assert.ok(hero.gap>=24,'Hero bottom clipped');
    for (const name of ['Daily focus','Service tracking','Client portal']) {
      await page.getByRole('button',{name,exact:true}).click();
      await page.locator('.rn-screen-link img').evaluate(img=>img.decode());
      const screen=await page.locator('.rn-screen-link img').evaluate(img=>{
        const r=img.getBoundingClientRect();return {ratio:r.width/r.height,natural:img.naturalWidth/img.naturalHeight};
      });
      assert.ok(Math.abs(screen.ratio-screen.natural)<.02,`${name} has letterboxing`);
    }
    await page.locator('.rn-product-stage').screenshot({path:`test-results/layout-product-${width}.png`});
    await page.locator('.rn-footer').scrollIntoViewIfNeeded();
    await page.screenshot({path:`test-results/layout-footer-${width}.png`});
    const footer=await page.locator('.rn-footer').evaluate(el=>{
      const r=el.getBoundingClientRect(),brand=el.querySelector('.brand').getBoundingClientRect();
      return {offset:brand.left-r.left,padding:parseFloat(getComputedStyle(el).paddingLeft),scroll:document.documentElement.scrollWidth,width:innerWidth};
    });
    assert.ok(Math.abs(footer.offset-footer.padding)<2,'Footer brand shifted');
    assert.ok(footer.scroll<=width,'Page overflow');
    console.log({width,hero,footer});
  }
} finally {await browser.close();}
