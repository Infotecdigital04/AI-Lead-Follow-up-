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
          "/brand/logo-dark.webp?v=nest2",
        );
        assert.equal(
          await page.locator(".rn-preview-brand img").getAttribute("src"),
          "/brand/mark.webp?v=nest2",
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
    "/favicon-16.png?v=nest2",
    "/favicon-32.png?v=nest2",
    "/favicon.ico?v=nest2",
    "/apple-touch-icon.png?v=nest2",
    "/favicon.svg",
  ]) {
    const response = await fetch(base + asset);
    assert.equal(response.status, 200, asset);
    assert.match(response.headers.get("content-type"), /image/);
  }
  const alphaPage = await browser.newPage();
  await alphaPage.goto(base);
  for (const asset of [
    "/brand/logo-light.webp?v=nest2",
    "/brand/logo-dark.webp?v=nest2",
    "/brand/mark.webp?v=nest2",
    "/favicon-16.png?v=nest2",
    "/favicon-32.png?v=nest2",
    "/apple-touch-icon.png?v=nest2",
  ]) {
    const alpha = await alphaPage.evaluate(async (src) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let transparent = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] === 0) transparent++;
      return {
        ratio: transparent / (canvas.width * canvas.height),
        corners: [
          data[3],
          data[canvas.width * 4 - 1],
          data[(canvas.height - 1) * canvas.width * 4 + 3],
          data[data.length - 1],
        ],
      };
    }, asset);
    assert.deepEqual(
      alpha.corners,
      [0, 0, 0, 0],
      `${asset}: transparent corners`,
    );
    assert.ok(
      alpha.ratio > 0.15,
      `${asset}: background must remain transparent`,
    );
  }
  await alphaPage.close();
  console.log(
    `Branding checks passed: ${checked} page/viewport combinations, 5 icon URLs and 6 transparent assets.`,
  );
} finally {
  await browser.close();
}
