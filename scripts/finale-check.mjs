import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:8793";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.PLAYWRIGHT_EXECUTABLE_PATH ||
    "C:/Users/Admin/AppData/Local/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe",
});
await mkdir("test-results", { recursive: true });
const errors = [];
try {
  for (const [width, height] of [
    [1440, 1000],
    [1034, 900],
    [768, 1024],
    [390, 844],
    [320, 667],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base);
    await page.locator('[data-motion="gsap"]').waitFor();
    for (const [name, selector] of [
      ["walkthrough", "#walkthrough"],
      ["faq", "#faq"],
      ["closing", ".rn-final-band"],
    ]) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(1200);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `Overflow: ${name} ${width}`,
      );
      await page
        .locator(selector)
        .screenshot({ path: `test-results/finale-${name}-${width}.png` });
    }
    for (const selector of [".rn-walk-backdrop", ".rn-final-art"]) {
      assert.equal(
        await page
          .locator(selector)
          .evaluate((e) => e.complete && e.naturalWidth > 0),
        true,
        "Missing artwork",
      );
    }
    assert.ok(
      (await page
        .locator(".rn-final-footer")
        .evaluate((e) => e.getBoundingClientRect().height)) < 140,
      "Footer too tall",
    );
    const questions = page.locator(".rn-faq-list details");
    assert.equal(await questions.count(), 6);
    assert.equal(await questions.first().getAttribute("open"), "");
    await questions.nth(2).locator("summary").focus();
    await page.keyboard.press("Enter");
    assert.equal(await questions.nth(2).getAttribute("open"), "");
    await page
      .getByRole("button", { name: "Play product walkthrough", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    assert.equal(
      await page.evaluate(() => document.body.style.overflow),
      "hidden",
    );
    if (width === 1440) {
      await page.waitForTimeout(6500);
      assert.equal(
        await dialog.locator("h2").textContent(),
        "Prepare your follow-up",
        "Autoplay did not advance",
      );
    }
    await dialog
      .getByRole("button", { name: "Pause walkthrough", exact: true })
      .click();
    await dialog
      .getByRole("button", { name: "03 Track the client journey" })
      .click();
    assert.equal(
      await dialog.locator("h2").textContent(),
      "Track the client journey",
    );
    assert.equal(
      await dialog.getByRole("button", { name: "Next chapter" }).isDisabled(),
      true,
    );
    assert.equal(
      await dialog
        .getByRole("link", { name: "Try this in the demo" })
        .getAttribute("href"),
      "/portal/demo",
    );
    await dialog.screenshot({
      path: `test-results/finale-dialog-${width}.png`,
    });
    await dialog.getByRole("button", { name: "Previous chapter" }).click();
    assert.equal(
      await dialog.locator("h2").textContent(),
      "Prepare your follow-up",
    );
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached" });
    assert.equal(await page.evaluate(() => document.body.style.overflow), "");
    assert.equal(
      await page.evaluate(() =>
        document.activeElement?.getAttribute("aria-label"),
      ),
      "Play product walkthrough",
    );
    await page
      .getByRole("button", { name: "Play product walkthrough", exact: true })
      .click();
    await dialog.getByRole("link", { name: "Try this in the demo" }).click();
    await page.waitForURL("**/demo/leads");
    await page.locator(".rn-home").waitFor({ state: "detached" });
    assert.equal(await page.evaluate(() => document.body.style.overflow), "");
    console.log(`Finale passed at ${width}x${height}`);
    await page.close();
  }
  const reduced = await browser.newPage({ reducedMotion: "reduce" });
  await reduced.goto(base);
  await reduced
    .getByRole("button", { name: "Play product walkthrough", exact: true })
    .click();
  assert.equal(
    await reduced
      .getByRole("button", { name: "Play walkthrough", exact: true })
      .isVisible(),
    true,
  );
  await reduced.getByRole("button", { name: "Next chapter" }).click();
  assert.equal(
    await reduced.locator("#rn-tour-title").textContent(),
    "Prepare your follow-up",
  );
  await reduced.close();
  const nojs = await browser.newPage({ javaScriptEnabled: false });
  await nojs.goto(base);
  assert.match(
    await nojs.locator("#rn-walkthrough-title").textContent(),
    /See how your day/,
  );
  await nojs.locator(".rn-faq-list summary").nth(4).click();
  assert.equal(
    await nojs.locator(".rn-faq-list details").nth(4).getAttribute("open"),
    "",
  );
  assert.match(
    await nojs.locator("#rn-final-title").textContent(),
    /Your next chapter/,
  );
  assert.deepEqual(errors, []);
  console.log(
    "Walkthrough playback/navigation, keyboard FAQ, focus restoration, reduced motion, SSR and responsive layouts passed.",
  );
} finally {
  await browser.close();
}
