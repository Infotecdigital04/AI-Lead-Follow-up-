import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:8796";
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_EXECUTABLE_PATH ||
    "C:/Users/Admin/AppData/Local/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe",
});
await mkdir("test-results/brand", { recursive: true });
let checked = 0;
try {
  for (const width of [1440, 1024, 768, 390, 320]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    for (const route of [
      "/",
      "/pricing",
      "/login",
      "/demo/overview",
      "/portal/demo",
    ]) {
      await page.goto(base + route);
      await page
        .locator(".rn-brand-image")
        .first()
        .waitFor({ state: "attached" });
      await page.waitForFunction(() =>
        [...document.querySelectorAll(".rn-brand-image")].every(
          (img) => img.complete && img.naturalWidth > 0,
        ),
      );
      const problems = await page.evaluate(() => {
        const issues = [];
        if (document.documentElement.scrollWidth > innerWidth + 1)
          issues.push("page overflow");
        for (const el of document.querySelectorAll(".rn-brand-image")) {
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          const p = el.parentElement.getBoundingClientRect();
          if (
            r.left < p.left - 1 ||
            r.right > p.right + 1 ||
            r.top < p.top - 1 ||
            r.bottom > p.bottom + 1
          )
            issues.push("logo exceeds link");
          if (r.width < 100) issues.push("logo too small");
        }
        return issues;
      });
      assert.deepEqual(problems, [], `${width} ${route}`);
      checked++;
      if (route === "/") {
        assert.equal(
          await page.locator(".rn-brand-dark img").getAttribute("src"),
          "/brand/logo-dark.webp",
        );
        assert.equal(
          await page.locator(".rn-preview-brand img").getAttribute("src"),
          "/brand/mark.webp",
        );
        await page.screenshot({
          path: `test-results/brand/header-${width}.png`,
        });
        await page.locator(".rn-brand-dark").scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `test-results/brand/footer-${width}.png`,
        });
      }
    }
    await page.close();
  }
  for (const asset of [
    "/favicon-16.png?v=nest1",
    "/favicon-32.png?v=nest1",
    "/favicon.ico?v=nest1",
    "/apple-touch-icon.png?v=nest1",
    "/favicon.svg",
  ]) {
    const response = await fetch(base + asset);
    assert.equal(response.status, 200, asset);
    assert.match(response.headers.get("content-type"), /image/);
  }
  console.log(
    `Branding checks passed: ${checked} page/viewport combinations and 5 icon URLs.`,
  );
} finally {
  await browser.close();
}
