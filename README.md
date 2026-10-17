# Relaynest

A Cloudflare-first lead follow-up and client workspace for Infotec Digital. Proposed address: **relaynest.infotecdigital.com**. The name is provisional; trademark availability has not been checked.

## Run locally

Requires Node.js 22.12+ (tested with Node 24).

```sh
npm ci
npm run build
npm run preview
```

Open http://127.0.0.1:8787. Preview uses the Cloudflare workerd runtime and a local D1 database. It deliberately has no production email, payment, or AI credentials. Demo records persist only in the current browser. Do not enter real customer information into the demo.

For frontend development, run `npm run dev` alongside the preview server. Vite forwards API calls to port 8787. The deployment build is pre-rendered; do not publish the Vite dev server.

## Included

- Public product, pricing, login, checkout, and pre-launch policy pages.
- Interactive demo with lead CRUD, status and follow-up tracking, search, CSV import/export, customer records, appointments, job stages, tasks, templates, invoice payment tracking, and computed reports.
- Client service portal that excludes internal notes and unapproved updates.
- Email OTP authentication, hashed expiring sessions, server-side tenant access, owner/staff record checks, audit log writes, input validation, same-origin mutation checks, and rate-limited email/AI endpoints.
- Paddle subscription adapter with server-selected price IDs and signed, replay-resistant, timestamp-ordered webhook processing. Payment redirects do not grant access. Only use it for Relaynest subscriptions, not customers' repair/service payments.
- Cloudflare D1 migration and optional Workers AI binding. Template drafts remain available without AI. Human approval is required for sending.
- Initial interface translations for English, Hindi, Tamil, Spanish, French, German, Portuguese and Arabic; RTL layout for Arabic. Dictionaries are partial, with English fallback. This is not an all-language launch.
- Region-based selection among ten proposed display currencies. Those are explicit regional price proposals, not live FX conversion. Paddle determines supported checkout currencies and actual amounts.
- Five pre-rendered public pages, sitemap, robots rules, self-hosted variable fonts, lazy-loaded workspace and checkout, responsive layouts, and reduced-motion support.

## Still Requires Activation

This is a first-version implementation, not a live commercial service. To activate real accounts and paid use, follow [DEPLOYMENT.md](DEPLOYMENT.md). The payment, email, and optional AI connections have not been exercised against live provider accounts.

Before selling, confirm legal/operator contact information and policy drafts, set real product prices and entitlements, verify the payment account, and run sandbox purchase/renewal/cancellation tests. Proposed plan feature distinctions are not yet enforced. No guarantees are made about search ranking or Lighthouse scores.

The following are deferred: platform super-admin panel (requested later), staff invitations and business role management UI, inbound Meta/Google/WhatsApp connectors, scheduled automatic follow-ups and reminders, custom service stages, customer document uploads and two-way messages, account deletion UI, and advanced reporting. Appointments currently use the viewer's local date/time; a business-timezone scheduler is needed before cross-timezone booking. Current list queries return at most 2,000 records; pagination is required before that scale.

SaaS subscription collection is separate from service-business invoice collection. A garage must use its own payment provider for repair payments. Invoice status in this version is manually tracked, not evidence of a verified gateway payment.

## Verification

```sh
npm test
npx playwright install chromium
# In another terminal with npm run preview running:
node scripts/browser-test.mjs
```

The browser suite covers demo lead create/read/delete and persistence, human draft approval, portal privacy, desktop/mobile routes, RTL, unauthorized API access, forged payment webhooks and cross-origin request rejection. Set `PLAYWRIGHT_EXECUTABLE_PATH` to reuse an existing Chromium installation.

## Project Layout

`src/` contains the React UI, dictionaries, and demo data. `server/` contains the Cloudflare Worker and validation. `migrations/` contains D1 SQL. `scripts/` contains the pre-renderer, preview runtime, and browser checks. Production assets are generated in `dist/`; local test data and server bundles live in ignored `work/`.
