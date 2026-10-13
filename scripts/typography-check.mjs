import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { seed } from "../src/data.js";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:8793";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.PLAYWRIGHT_EXECUTABLE_PATH ||
    "C:/Users/Admin/AppData/Local/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe",
});
const results = [],
  errors = [],
  fonts = [];
await mkdir("test-results/typography", { recursive: true });
const paths = [
  "/",
  "/pricing",
  "/login",
  "/checkout",
  "/privacy",
  "/terms",
  "/refunds",
  "/demo/overview",
  "/demo/leads",
  "/demo/customers",
  "/demo/appointments",
  "/demo/jobs",
  "/demo/tasks",
  "/demo/invoices",
  "/demo/reports",
  "/demo/templates",
  "/demo/settings",
  "/portal/demo",
  "/not-found",
];
async function audit(page, name, width) {
  await page.locator("h1, h2").first().waitFor();
  const result = await page.evaluate(() => {
    const visible = (e) => {
      const r = e.getBoundingClientRect(),
        s = getComputedStyle(e);
      return (
        r.width > 0 &&
        r.height > 0 &&
        s.visibility !== "hidden" &&
        s.display !== "none" &&
        parseFloat(s.fontSize) > 0 &&
        !e.closest('[aria-hidden="true"],.sr-only,.rn-sr-only')
      );
    };
    const describe = (e) =>
      `${e.tagName}.${String(e.className).slice(0, 90)}: ${e.textContent.trim().slice(0, 55)}`;
    const texts = [...document.querySelectorAll("body *")].filter(
      (e) =>
        visible(e) &&
        [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()),
    );
    const mobile = innerWidth <= 760;
    const sizes = [
      [
        ".rn-nav-links a,.rn-login,.sidebar nav a,.login-link,.site-nav nav a",
        mobile ? 16 : 15,
      ],
      [".rn-mobile-nav a", 16],
      [".button,.rn-pill,.rn-text-link", mobile ? 14 : 15],
      [
        ".rn-hero-description,.rn-section-heading > p,.workspace-heading p,.auth-content > p:not(.legal-note),.legal-page p:not(.info-note)",
        mobile ? 15 : 16,
      ],
      [
        ".rn-industry-card p,.rn-journey-steps p,.plan > p,.plan li",
        mobile ? 14 : 15,
      ],
      [
        ".rn-product-tabs button,.rn-industry-tabs button,.billing-period,.currency-select,.currency-select select",
        14,
      ],
      [".rn-faq-list summary", mobile ? 15 : 16],
      [".rn-faq-list details > div", mobile ? 14 : 15],
      ["footer nav a,footer > div a", 13],
      [".rn-eyebrow,.pricing-note", 12],
    ];
    const belowMinimum = sizes.flatMap(([selector, min]) =>
      [...document.querySelectorAll(selector)]
        .filter(
          (e) => visible(e) && parseFloat(getComputedStyle(e).fontSize) < min,
        )
        .map((e) => `${min}px minimum: ${describe(e)}`),
    );
    return {
      belowMinimum,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      wrongFonts: texts
        .filter(
          (e) =>
            !getComputedStyle(e).fontFamily.includes("-apple-system") ||
            /DM Sans|Manrope/.test(getComputedStyle(e).fontFamily),
        )
        .map(describe),
      smallText: texts
        .filter(
          (e) =>
            parseFloat(getComputedStyle(e).fontSize) <
              (e.closest(
                ".rn-device,.rn-floating-followup,.rn-journey-stage,.rn-walk-device,.rn-walk-draft,.rn-dark-console",
              )
                ? 9
                : innerWidth <= 760
                  ? 12
                  : 13) &&
            !e.closest(
              ".rn-eyebrow,.eyebrow,.page-kicker,.nav-caption,.focus-eyebrow,.pricing-note,.payment-note,.plan-ribbon,.rn-sr-only",
            ),
        )
        .map((e) => `${getComputedStyle(e).fontSize} ${describe(e)}`),
      shortButtons: [
        ...document.querySelectorAll("button,.button,.rn-pill,.rn-text-link"),
      ]
        .filter((e) => visible(e) && e.getBoundingClientRect().height < 43.5)
        .map(describe),
      clippedText: texts
        .filter(
          (e) =>
            e.clientWidth > 0 &&
            e.scrollWidth > e.clientWidth + 2 &&
            ["hidden", "clip"].includes(getComputedStyle(e).overflowX) &&
            getComputedStyle(e).textOverflow !== "ellipsis",
        )
        .map(describe),
      smoothing: getComputedStyle(document.body).webkitFontSmoothing,
    };
  });
  results.push({ width, name, ...result });
}
try {
  for (const width of [1440, 1024, 768, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(`${width}: ${e.message}`));
    page.on("request", (r) => {
      if (r.resourceType() === "font") fonts.push(r.url());
    });
    for (const path of paths) {
      await page.goto(base + path);
      await page.waitForTimeout(path === "/" ? 1300 : 150);
      await audit(page, path, width);
      if (path === "/pricing") {
        const header = await page.locator(".site-header").boundingBox();
        const actions = await page.locator(".nav-actions").boundingBox();
        assert.ok(
          actions.y + actions.height <= header.y + header.height + 1,
          "Navigation extends below its header",
        );
        if (width > 900) {
          assert.equal(
            await page.locator(".mobile-login").isVisible(),
            false,
            "Mobile-only login leaked into desktop navigation",
          );
          assert.equal(await page.locator(".login-link").isVisible(), true);
        } else {
          assert.equal(await page.locator(".login-link").isVisible(), false);
          await page.getByRole("button", { name: "Toggle navigation" }).click();
          assert.equal(await page.locator(".mobile-login").isVisible(), true);
          await audit(page, "/public-mobile-menu", width);
          await page.getByRole("button", { name: "Toggle navigation" }).click();
        }
      }
      if (
        [
          "/",
          "/pricing",
          "/login",
          "/demo/overview",
          "/demo/settings",
          "/portal/demo",
        ].includes(path)
      ) {
        if (path === "/") {
          for (const selector of [
            ".rn-lead-hero",
            "#journey",
            "#pricing",
            "#solutions",
            "#walkthrough",
            "#faq",
            ".rn-final-band",
          ]) {
            await page.locator(selector).scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);
            await page.screenshot({
              path: `test-results/typography/home-${selector.replaceAll(/[^a-z]/g, "")}-${width}.png`,
            });
          }
          await page
            .getByRole("button", {
              name: "Play product walkthrough",
              exact: true,
            })
            .click();
          await page.waitForTimeout(500);
          await page
            .getByRole("button", { name: "Pause walkthrough", exact: true })
            .click();
          await audit(page, "/walkthrough-dialog", width);
          await page.getByRole("dialog").screenshot({
            path: `test-results/typography/dialog-${width}.png`,
          });
          await page.keyboard.press("Escape");
        } else
          await page.screenshot({
            path: `test-results/typography/${path.replaceAll("/", "-")}-${width}.png`,
            fullPage: true,
          });
      }
      if (path === "/demo/leads") {
        await page.locator(".workspace-heading .button").click();
        await page.locator(".modal").waitFor();
        await audit(page, "/lead-editor", width);
        await page.screenshot({
          path: `test-results/typography/editor-${width}.png`,
        });
      }
      if (path === "/login") {
        await page.route("**/api/auth/request", (route) =>
          route.fulfill({ json: { ok: true } }),
        );
        await page
          .locator('input[type="email"]')
          .fill("type-check@example.com");
        await page.locator("form button.primary").click();
        await page.locator('input[autocomplete="one-time-code"]').waitFor();
        await audit(page, "/login-code", width);
      }
    }
    // Browser-only fixtures exercise signed-in states without changing real accounts.
    const session = {
      user: { email: "alex@example.com" },
      business: { name: "Northside Auto", role: "Owner" },
      subscription: { status: "active" },
    };
    await page.route("**/api/session", (route) =>
      route.fulfill({ json: session }),
    );
    await page.route("**/api/workspace/records", (route) =>
      route.fulfill({ json: seed() }),
    );
    for (const path of ["/app/overview", "/app/settings"]) {
      await page.goto(base + path);
      await page.locator(".workspace-heading").waitFor();
      await audit(page, path, width);
    }
    session.business = null;
    await page.goto(base + "/app/overview");
    await page.locator(".onboarding").waitFor();
    await audit(page, "/account-onboarding", width);
    session.business = { name: "Northside Auto" };
    session.subscription.status = "inactive";
    await page.goto(base + "/app/overview");
    await page.locator(".subscription-gate").waitFor();
    await audit(page, "/account-plans", width);
    await page.screenshot({
      path: `test-results/typography/account-plans-${width}.png`,
      fullPage: true,
    });
    console.log(`Audited ${width}px`);
    await context.close();
  }
  await writeFile(
    "test-results/typography/results.json",
    JSON.stringify({ results, errors, fonts }, null, 2),
  );
  const problems = results.filter(
    (r) =>
      r.overflow ||
      r.wrongFonts.length ||
      r.shortButtons.length ||
      r.clippedText.length ||
      r.smallText.length ||
      r.belowMinimum.length,
  );
  console.log(JSON.stringify({ problems, errors, fonts }, null, 2));
  assert.deepEqual(errors, []);
  assert.deepEqual(fonts, [], "Web fonts must not be requested");
  assert.deepEqual(problems, [], "Typography/layout regressions");
} finally {
  await browser.close();
}
