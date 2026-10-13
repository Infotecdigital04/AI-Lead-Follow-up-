import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:8793";
const out = "test-results/refined-home";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_EXECUTABLE_PATH ||
    "C:/Users/Admin/AppData/Local/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe",
});
const errors = [],
  problems = [];
async function geometry(page, label) {
  const found = await page.evaluate(() => {
    const result = [];
    if (document.documentElement.scrollWidth > innerWidth + 1)
      result.push("Horizontal overflow");
    for (const selector of [
      "#rn-headline",
      ".rn-preview-task",
      ".rn-closeup",
      ".rn-industry-card > div",
      ".rn-home-pricing .plan",
      ".rn-faq-list summary",
    ]) {
      for (const el of document.querySelectorAll(selector)) {
        if (!el.getClientRects().length) continue;
        if (el.scrollWidth > el.clientWidth + 2)
          result.push(`Content overflow: ${selector}`);
        const s = getComputedStyle(el);
        if (Number(s.opacity) < 0.99)
          result.push(`Transparent content: ${selector}`);
      }
    }
    for (const el of document.querySelectorAll(
      ".rn-preview-task strong,.rn-preview-task div > span,.rn-closeup p,.rn-closeup-link,.rn-lead-note",
    )) {
      if (parseFloat(getComputedStyle(el).fontSize) < 13)
        result.push("Small product text: " + el.textContent);
    }
    return result;
  });
  problems.push(...found.map((problem) => ({ label, problem })));
}
try {
  for (const [width, height] of [
    [1440, 900],
    [1024, 768],
    [768, 1024],
    [390, 844],
    [320, 740],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base);
    await page.locator('[data-motion="gsap"]').waitFor();
    await page.waitForTimeout(1200);
    assert.equal(await page.locator(".rn-preview-task").count(), 3);
    assert.equal(
      await page.locator(".rn-preview-search").getAttribute("href"),
      "/demo/leads",
    );
    const tilt = await page
      .locator(".rn-product-tilt")
      .evaluate((el) => getComputedStyle(el).transform);
    assert.equal(
      tilt === "none",
      width <= 760,
      "Product perspective must flatten on mobile",
    );
    assert.equal(await page.locator(".rn-story-step").count(), 3);
    assert.equal(
      await page.locator(".rn-walkthrough,.rn-journey,.rn-dark-stage").count(),
      0,
    );
    assert.deepEqual(
      await page
        .locator("main > section")
        .evaluateAll((els) => els.map((el) => el.id || el.className)),
      ["rn-lead-hero", "product", "solutions", "pricing", "faq"],
    );
    assert.equal(
      await page.locator(".rn-lead-actions a").first().getAttribute("href"),
      "/demo/overview",
    );
    assert.equal(
      await page.locator(".rn-lead-actions a").last().getAttribute("href"),
      "#pricing",
    );
    const copy = await page.locator(".rn-lead-copy").boundingBox();
    const preview = await page.locator(".rn-focus-preview").boundingBox();
    if (width > 1000)
      assert.ok(copy.x + copy.width <= preview.x + 2, "Hero columns overlap");
    else assert.ok(preview.y >= copy.y + copy.height, "Stacked hero overlaps");
    await page.screenshot({ path: `${out}/hero-${width}.png` });
    const before = await page
      .locator(".rn-lead-sculpture")
      .evaluate((el) => getComputedStyle(el).transform);
    await page.waitForTimeout(400);
    assert.notEqual(
      await page
        .locator(".rn-lead-sculpture")
        .evaluate((el) => getComputedStyle(el).transform),
      before,
    );
    await page.getByRole("button", { name: "Pause ambient animation" }).click();
    const stopped = await page
      .locator(".rn-lead-sculpture")
      .evaluate((el) => getComputedStyle(el).transform);
    await page.waitForTimeout(200);
    assert.equal(
      await page
        .locator(".rn-lead-sculpture")
        .evaluate((el) => getComputedStyle(el).transform),
      stopped,
    );
    await geometry(page, `${width}-hero`);
    for (const id of ["product", "solutions", "pricing", "faq"]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(750);
      await geometry(page, `${width}-${id}`);
      await page.screenshot({ path: `${out}/${id}-${width}.png` });
    }
    const launcher = page.getByRole("button", {
      name: "Play product walkthrough",
      exact: true,
    });
    await launcher.click();
    await page.getByRole("dialog").waitFor();
    await page
      .getByRole("button", { name: "Pause walkthrough", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Next chapter", exact: true })
      .click();
    assert.equal(
      await page.locator("#rn-tour-title").innerText(),
      "Prepare your follow-up",
    );
    await page
      .getByRole("button", { name: "Next chapter", exact: true })
      .click();
    assert.equal(
      await page.locator("#rn-tour-title").innerText(),
      "Track the client journey",
    );
    await page.screenshot({ path: `${out}/walkthrough-${width}.png` });
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog").count(), 0);
    assert.ok(await launcher.evaluate((el) => el === document.activeElement));
    for (const name of [
      "Beauty & wellness",
      "Creative studios",
      "Professional services",
      "Automotive",
    ]) {
      await page.getByRole("button", { name, exact: true }).click();
      assert.equal(
        await page
          .getByRole("button", { name, exact: true })
          .getAttribute("aria-pressed"),
        "true",
      );
      assert.equal(
        await page.locator(".rn-industry-card h3").first().innerText(),
        name,
      );
    }
    await page.locator("#pricing select").selectOption("USD");
    const prices = () => page.locator("#pricing .price").allTextContents();
    assert.deepEqual(
      (await prices()).map((s) =>
        Number(s.split("/")[0].replace(/[^\d.]/g, "")),
      ),
      [39, 99, 249],
    );
    await page.locator("#pricing .segmented button").nth(1).click();
    assert.deepEqual(
      (await prices()).map((s) =>
        Number(s.split("/")[0].replace(/[^\d.]/g, "")),
      ),
      [31, 79, 199],
    );
    await page.locator("#pricing select").selectOption("INR");
    assert.ok((await prices())[0].includes("2,399"));
    await page.locator("#pricing .segmented button").first().click();
    assert.ok((await prices())[0].includes("2,999"));
    assert.ok(
      (await page.locator("#pricing .plan > button").allTextContents()).every(
        (s) => s.startsWith("Explore"),
      ),
    );
    await page
      .getByRole("button", { name: "Explore Growth", exact: true })
      .click();
    assert.ok(page.url().includes("/login?plan=growth&interval=monthly"));
    await page.goto(base);
    await page.locator("#faq details").nth(2).locator("summary").click();
    assert.ok(
      await page
        .locator("#faq details")
        .nth(2)
        .evaluate((el) => el.open),
    );
    if (width <= 760) {
      await page
        .getByRole("button", { name: "Open menu", exact: true })
        .click();
      await page
        .getByRole("navigation", { name: "Mobile navigation", exact: true })
        .getByRole("link", { name: "Product", exact: true })
        .click();
      assert.equal(await page.locator("#rn-mobile-navigation").count(), 0);
    }
    await page.close();
    console.log(`Verified ${width}px`);
  }
  for (const mode of ["reduced", "blocked-animation", "no-js"]) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      reducedMotion: mode === "reduced" ? "reduce" : "no-preference",
      javaScriptEnabled: mode !== "no-js",
    });
    if (mode === "blocked-animation")
      await page.route("**/*ScrollTrigger*.js", (route) => route.abort());
    await page.goto(base);
    await page.waitForTimeout(800);
    assert.ok(await page.locator("#rn-headline").isVisible());
    assert.ok(await page.locator(".rn-lead-actions").isVisible());
    assert.equal(await page.locator(".rn-story-step").count(), 3);
    await geometry(page, mode);
    if (mode === "reduced") {
      assert.equal(
        await page
          .getByRole("button", { name: "Pause ambient animation" })
          .isVisible(),
        false,
      );
      await page
        .getByRole("button", { name: "Play product walkthrough", exact: true })
        .click();
      assert.ok(
        await page
          .getByRole("button", { name: "Play walkthrough", exact: true })
          .isVisible(),
      );
    }
    await page.close();
  }
  await writeFile(
    `${out}/results.json`,
    JSON.stringify({ problems, errors }, null, 2),
  );
  console.log(JSON.stringify({ problems, errors }, null, 2));
  assert.deepEqual(problems, []);
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
