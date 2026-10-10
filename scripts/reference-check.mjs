import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.PLAYWRIGHT_EXECUTABLE_PATH ||
    "C:/Users/Admin/AppData/Local/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe",
});
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:8793";
await mkdir("test-results", { recursive: true });
try {
  const errors = [];
  for (const [width, height] of [
    [1366, 768],
    [1440, 900],
    [1920, 1080],
    [768, 1024],
    [390, 844],
    [320, 667],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base);
    await page.locator('[data-motion="gsap"]').waitFor();
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `test-results/reference-hero-${width}.png` });
    const geometry = await page.evaluate(() => {
      const box = (selector) => {
        const r = document.querySelector(selector).getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height, bottom: r.bottom };
      };
      return {
        hero: box(".rn-hero"),
        device: box(".rn-device"),
        main: box(".rn-device-main"),
        cta: box(".rn-hero-actions"),
        note: box(".rn-reassurance"),
        footer: box(".rn-footer"),
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    assert.equal(geometry.overflow, false, "Horizontal overflow");
    assert.ok(
      geometry.device.bottom < geometry.hero.bottom,
      "Dashboard clipped at section boundary",
    );
    assert.ok(
      geometry.main.x >= geometry.device.x &&
        geometry.main.x + geometry.main.w <=
          geometry.device.x + geometry.device.w + 2,
      "Dashboard content overflows",
    );
    assert.ok(
      geometry.note.y >= geometry.cta.bottom,
      "CTA reassurance overlaps",
    );
    assert.ok(geometry.footer.h < 140, "Footer is too tall");
    const moving = await page
      .locator(".rn-ribbon-motion")
      .evaluate((e) => getComputedStyle(e).transform);
    await page.waitForTimeout(600);
    assert.notEqual(
      await page
        .locator(".rn-ribbon-motion")
        .evaluate((e) => getComputedStyle(e).transform),
      moving,
      "Ambient motion missing",
    );
    await page.getByRole("button", { name: "Pause ambient animation" }).click();
    const paused = await page
      .locator(".rn-ribbon-motion")
      .evaluate((e) => getComputedStyle(e).transform);
    await page.waitForTimeout(250);
    assert.equal(
      await page
        .locator(".rn-ribbon-motion")
        .evaluate((e) => getComputedStyle(e).transform),
      paused,
      "Pause does not stop motion",
    );
    await page.locator("#product").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: `test-results/reference-product-${width}.png`,
    });
    await page
      .getByRole("button", { name: "Client portal", exact: true })
      .click();
    await page
      .getByRole("link", { name: "Open the client portal", exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "Daily focus", exact: true })
      .click();
    await page.locator("#solutions").scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await page.screenshot({
      path: `test-results/reference-solutions-${width}.png`,
    });
    await page
      .getByRole("button", { name: "Creative studios", exact: true })
      .click();
    assert.equal(
      await page
        .locator(".rn-industry-card")
        .first()
        .locator("h3")
        .textContent(),
      "Creative studios",
    );
    assert.equal(
      await page
        .locator(
          '.rn-industry-grid img[src*="automotive"], .rn-industry-grid img[src*="salon"]',
        )
        .count(),
      0,
      "Unrelated industry photography",
    );
    await page.getByRole("button", { name: "Automotive", exact: true }).click();
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: `test-results/reference-full-${width}.png`,
      fullPage: true,
    });
    if (width < 761) {
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.getByRole("button", { name: "Open menu" }).click();
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .waitFor();
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#rn-mobile-navigation").count(), 0);
    }
    await page.locator(".rn-footer-invite").click();
    await page.waitForURL("**/demo/overview");
    await page.locator(".rn-home").waitFor({ state: "detached" });
    assert.equal(
      await page.locator(".rn-home").count(),
      0,
      "Homepage did not unmount",
    );
    assert.equal(
      await page.locator(".pin-spacer").count(),
      0,
      "Animation leaked into app",
    );
    console.log(JSON.stringify({ width, height, geometry }));
    await page.close();
  }
  const reduced = await browser.newPage({ reducedMotion: "reduce" });
  await reduced.goto(base);
  await reduced.waitForTimeout(500);
  assert.equal(await reduced.locator('[data-motion="gsap"]').count(), 0);
  assert.equal(await reduced.locator(".rn-motion-toggle").isVisible(), false);
  const nojs = await browser.newPage({ javaScriptEnabled: false });
  await nojs.goto(base);
  assert.match(await nojs.locator("h1").textContent(), /Relaynest/);
  assert.equal(
    await nojs
      .locator(".rn-hero-copy")
      .evaluate((e) => getComputedStyle(e).opacity),
    "1",
  );
  assert.deepEqual(errors, []);
  console.log(
    "Reference layout, motion/pause, responsive previews, industry relevance, navigation, reduced-motion and SSR checks passed.",
  );
} finally {
  await browser.close();
}
