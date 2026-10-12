import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH ||
    "C:/Users/Admin/AppData/Local/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe",
});
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:8793";
await mkdir("test-results/hero-balance", { recursive: true });
try {
  for (const [width, height] of [[1440, 900], [1366, 627], [1024, 768], [768, 1024], [390, 844], [390, 667]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(base);
    await page.locator('[data-motion="gsap"]').waitFor();
    await page.waitForTimeout(1800);
    const geometry = await page.evaluate(() => {
      const box = selector => {
        const r = document.querySelector(selector).getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, height: r.height };
      };
      const heading = document.querySelector(".rn-hero-copy h2");
      return {
        heading: box(".rn-hero-copy h2"), device: box(".rn-device"),
        hero: box(".rn-hero"), note: box(".rn-reassurance"),
        ribbon: box(".rn-ribbon-motion"),
        actions: box(".rn-hero-actions"),
        size: parseFloat(getComputedStyle(heading).fontSize),
        weight: getComputedStyle(heading).fontWeight,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    assert.equal(geometry.overflow, false);
    assert.equal(geometry.weight, "500");
    assert.ok(geometry.size <= (width >= 1000 && height <= 800 ? 44 : 64));
    assert.ok(geometry.heading.height < geometry.device.height * 0.45, "Headline overwhelms product");
    assert.ok(geometry.device.bottom < geometry.hero.bottom, "Dashboard clipped by section");
    assert.ok(geometry.note.top >= geometry.actions.bottom, "CTA overlaps supporting text");
    assert.ok(geometry.device.top > geometry.note.bottom, "Dashboard overlaps copy");
    assert.ok(geometry.note.top >= geometry.actions.bottom + 7, "Supporting text crowds actions");
    assert.ok(geometry.ribbon.top > geometry.note.bottom, "Artwork intrudes into hero copy");
    assert.equal(await page.locator(".rn-hero-copy > .rn-eyebrow").count(), 0);
    await page.locator(".rn-hero-actions").getByRole("link", { name: "Explore the demo" }).waitFor();
    const visible = Math.min(height, geometry.device.bottom) - Math.max(0, geometry.device.top);
    assert.ok(geometry.device.bottom <= height, "Dashboard does not fit on first screen");
    assert.deepEqual(errors, []);
    await page.screenshot({ path: `test-results/hero-balance/${width}-${height}.png` });
    console.log(JSON.stringify({ width, height, ...geometry, visibleRatio: visible / geometry.device.height }));
    await page.close();
  }
} finally {
  await browser.close();
}

