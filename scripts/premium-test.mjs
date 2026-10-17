import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : {}),
});
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:8787";
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "no-preference",
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("response", (response) => {
  if (response.status() >= 400)
    errors.push(`${response.status()} ${response.url()}`);
});
await mkdir("test-results", { recursive: true });
try {
  await page.goto(base);
  await page.waitForFunction(
    () => document.documentElement.dataset.motion === "on",
  );
  const reveal = page.locator(".feature-section");
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".feature-section")).opacity ===
      "0",
  );
  assert.equal(
    await reveal.evaluate((el) => getComputedStyle(el).opacity),
    "0",
  );
  await reveal.scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".feature-section")).opacity ===
      "1",
  );
  assert.equal(
    await reveal.evaluate((el) => el.classList.contains("revealed")),
    true,
  );
  for (const label of ["Daily focus", "Service flow", "Client experience"]) {
    const tab = page.getByRole("tab", { name: label, exact: true });
    await tab.click();
    assert.equal(await tab.getAttribute("aria-selected"), "true");
    await page.waitForFunction(() => {
      const img = document.querySelector(".showcase-image-link img");
      return img.complete && img.naturalWidth > 0;
    });
  }
  await page
    .getByRole("tab", { name: "Client experience", exact: true })
    .focus();
  await page.keyboard.press("Home");
  assert.equal(
    await page
      .getByRole("tab", { name: "Daily focus", exact: true })
      .getAttribute("aria-selected"),
    "true",
  );
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await page
      .getByRole("tab", { name: "Service flow", exact: true })
      .getAttribute("aria-selected"),
    "true",
  );
  await page
    .locator(".showcase-description")
    .getByRole("link", { name: "Open live demo" })
    .click();
  await page.waitForURL("**/demo/jobs");
  await page.goto(base);
  await page.getByRole("button", { name: "Pause page motion" }).click();
  assert.equal(await page.locator("html").getAttribute("data-motion"), "off");
  await page.reload();
  await page.getByRole("button", { name: "Enable page motion" }).waitFor();
  assert.equal(await page.locator("html").getAttribute("data-motion"), "off");
  await page.getByRole("button", { name: "Enable page motion" }).click();
  assert.equal(await page.locator("html").getAttribute("data-motion"), "on");

  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, height] of [
    [320, 667],
    [390, 844],
    [768, 1024],
    [1358, 634],
    [1366, 768],
    [1440, 900],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(
      () => document.documentElement.dataset.motion === "off",
    );
    await page.waitForFunction(() => {
      const img = document.querySelector(".signature-product img");
      return img.complete && img.naturalWidth > 0;
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
      `Horizontal overflow at ${width}`,
    );
    assert.equal(
      await page
        .locator("[data-reveal]")
        .evaluateAll((els) =>
          els.every((el) => getComputedStyle(el).opacity === "1"),
        ),
      true,
    );
    if (width >= 1366) {
      const nav = await page
        .getByRole("navigation", { name: "Main navigation" })
        .boundingBox();
      assert.ok(
        Math.abs(nav.x + nav.width / 2 - width / 2) < 2,
        `Navigation must be centered at ${width}`,
      );
    }
    const hero = await page.locator(".signature-hero").boundingBox();
    const reassurance = await page
      .locator(".signature-reassurance")
      .boundingBox();
    const actions = await page.locator(".signature-actions").boundingBox();
    const stage = await page.locator(".signature-stage").boundingBox();
    assert.ok(
      actions.y + actions.height <= reassurance.y,
      `Actions overlap reassurance at ${width}x${height}`,
    );
    assert.ok(
      reassurance.y + reassurance.height + 18 <= stage.y,
      `Copy overlaps product at ${width}x${height}`,
    );
    assert.ok(
      hero.y + hero.height < height,
      `Next section must be visible at ${width}x${height}`,
    );
    await page.screenshot({ path: `test-results/premium-hero-${width}.png` });
    await page.locator(".product-showcase").scrollIntoViewIfNeeded();
    await page.locator(".showcase-image-link img").scrollIntoViewIfNeeded();
    await page.locator(".showcase-image-link img").evaluate((img) => img.decode());
    await page.screenshot({
      path: `test-results/premium-product-${width}.png`,
    });
    await page.screenshot({
      path: `test-results/premium-full-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  const toggle = page.getByRole("button", { name: "Toggle navigation" });
  await toggle.click();
  assert.equal(await toggle.getAttribute("aria-expanded"), "true");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Product", exact: true })
    .click();
  assert.equal(await toggle.getAttribute("aria-expanded"), "false");
  assert.deepEqual(errors, []);
  console.log(
    "PASS: centered navigation; seven responsive viewports; measured hero separation; all product images; keyboard tabs and demo links; scroll reveal; persistent motion controls; reduced motion; mobile navigation; no browser errors.",
  );
} finally {
  await browser.close();
}

