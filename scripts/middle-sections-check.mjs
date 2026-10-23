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
    [1440, 900],
    [1034, 900],
    [768, 1024],
    [390, 844],
    [320, 667],
  ]) {
    const p = await browser.newPage({ viewport: { width, height } });
    p.on("pageerror", (e) => errors.push(e.message));
    await p.goto(base);
    await p.locator('[data-motion="gsap"]').waitFor();
    await p.locator("#journey").scrollIntoViewIfNeeded();
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `test-results/middle-journey-${width}.png` });
    const layout = await p.evaluate(() => {
      const r = (s) => {
        const b = document.querySelector(s).getBoundingClientRect();
        return {
          x: b.x,
          y: b.y,
          right: b.right,
          bottom: b.bottom,
          w: b.width,
          h: b.height,
        };
      };
      return {
        phone: r(".rn-journey-phone"),
        draft: r(".rn-draft-body a"),
        journey: r("#journey"),
        pricing: r("#pricing"),
        industry: r("#solutions"),
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    assert.equal(layout.overflow, false, "Page overflows");
    assert.ok(
      layout.phone.bottom <= layout.journey.bottom,
      "Phone clips outside the journey",
    );
    assert.ok(
      layout.phone.x >= layout.draft.right ||
        layout.phone.right <= layout.draft.x ||
        layout.phone.y >= layout.draft.bottom ||
        layout.phone.bottom <= layout.draft.y,
      "Phone overlaps draft CTA",
    );
    assert.ok(
      layout.journey.y < layout.pricing.y &&
        layout.pricing.y < layout.industry.y,
      "Wrong section order",
    );
    assert.equal(await p.locator(".rn-journey-steps li").count(), 3);
    await p.locator("#pricing").scrollIntoViewIfNeeded();
    await p.waitForTimeout(900);
    await p.locator("#pricing select").selectOption("USD");
    await p.getByRole("button", { name: "Monthly", exact: true }).click();
    assert.match(
      await p.locator("#pricing .plan").first().locator(".price").textContent(),
      /39/,
    );
    assert.match(
      await p.locator("#pricing .plan").nth(1).locator(".price").textContent(),
      /99/,
    );
    await p.screenshot({ path: `test-results/middle-pricing-${width}.png` });
    await p.locator("#pricing .segmented button").nth(1).click();
    assert.equal(
      await p
        .locator("#pricing .segmented button")
        .nth(1)
        .getAttribute("aria-pressed"),
      "true",
    );
    assert.match(
      await p
        .locator("#pricing .plan")
        .first()
        .locator(".billing-period")
        .textContent(),
      /372.*billed yearly/,
    );
    await p.locator("#pricing select").selectOption("INR");
    assert.match(
      await p.locator("#pricing .plan").first().locator(".price").textContent(),
      /2,399/,
    );
    await p.locator("#pricing .segmented button").first().click();
    assert.match(
      await p.locator("#pricing .plan").first().locator(".price").textContent(),
      /2,999/,
    );
    assert.match(
      await p.locator("#pricing .pricing-note").textContent(),
      /payment-provider/,
    );
    await p
      .getByRole("button", { name: "Explore Growth", exact: true })
      .click();
    await p.waitForURL("**/login?plan=growth&interval=monthly");
    await p.locator(".rn-home").waitFor({ state: "detached" });
    console.log(
      JSON.stringify({
        width,
        layout,
        pricing: "monthly/yearly/USD/INR and signup passed",
      }),
    );
    await p.close();
  }
  const p = await browser.newPage({ reducedMotion: "reduce" });
  await p.goto(base + "/pricing");
  await p.locator(".plans .plan").first().waitFor();
  assert.equal(await p.locator(".plans .plan").count(), 3);
  assert.equal(
    await p
      .getByRole("button", { name: "Explore Growth", exact: true })
      .count(),
    0,
  );
  const nojs = await browser.newPage({ javaScriptEnabled: false });
  await nojs.goto(base);
  assert.equal(await nojs.locator("#journey,#pricing").count(), 2);
  assert.deepEqual(errors, []);
  console.log(
    "Middle sections: responsive layout, pricing, routing, shared pricing page, and SSR passed.",
  );
} finally {
  await browser.close();
}
