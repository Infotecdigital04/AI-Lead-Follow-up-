# Deploy Relaynest on Cloudflare Workers

The proposed hostname is `relaynest.infotecdigital.com`. Nothing in this repository changes DNS automatically. Use Cloudflare Workers with Static Assets, not a Pages-only static deployment, because the application needs `/api/*` routes and D1.

## 1. Free Preview First

The site and demo can be deployed without a payment account. The Workers free plan and D1 free allowance are suitable for an initial low-traffic launch, subject to their current quotas. Free does not mean unlimited. Email, AI, and payment processing have separate allowances or charges. Keep paid upgrades disabled unless you choose them.

Official references:

- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/workers/static-assets/

## 2. Create D1

Sign into your Cloudflare account in the terminal:

```sh
npx wrangler login
npx wrangler d1 create relaynest
```

Replace the all-zero `database_id` in `wrangler.jsonc` with the returned ID. Keep the binding name `DB`. Then apply the migration:

```sh
npm run db:remote
```

The all-zero ID is a local placeholder, not a production database. Do not deploy without replacing it.

## 3. Build and Deploy

```sh
npm ci
npm run deploy
```

For Cloudflare Git integration, connect this GitHub repository in Workers & Pages and use:

- Build command: `npm ci && npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: the repository root
- Production branch: `main`, after review and merge

The dashboard Worker is named `ai-lead-follow-up`, matching `name` in `wrangler.jsonc`. This infrastructure name is separate from the Relaynest product name and the `relaynest` D1 database name.

Before merging, use `codex/relaynest-client-portal` if you want to test the source through Workers Builds. The initial `main` commit contains only a README and cannot deploy the application. A build reporting no dependencies and no static files may be using that initial branch or an incorrect root directory. Check the build's commit and repository-root setting, and make sure the build command above runs before deployment. Replace the D1 placeholder and apply migrations before deploying the full application.

Both the compiled frontend in `dist/` and Worker API are deployed. The public pages are generated during the build, so the committed source must include `scripts/prerender.mjs` and the image in `public/`.

## 4. Attach Your Subdomain

In the Worker's Settings > Domains & Routes, add the Custom Domain `relaynest.infotecdigital.com`. Cloudflare must manage the `infotecdigital.com` DNS zone. Verify that the subdomain is unused first; do not replace the main website or an existing service. Cloudflare provisions the associated DNS and certificate for a Worker Custom Domain.

Keep `APP_ORIGIN` in `wrangler.jsonc` exactly equal to the final HTTPS origin. If you choose another subdomain, also update `index.html`, `public/robots.txt`, `public/sitemap.xml`, and `scripts/prerender.mjs`. The default workers.dev URL can show the demo, but production checkout and origin settings should use the chosen canonical hostname.

Reference: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/

## 5. Enable Email Sign-in

Create a Resend account, verify a sending domain you control, and add its DNS records in Cloudflare. Confirm that `hello@infotecdigital.com` is a real, monitored support mailbox, or change all contact references to your actual address. Set `EMAIL_FROM` to an approved sender.

Set secrets through Cloudflare's encrypted secret settings or the following commands; never put them in GitHub or chat:

```sh
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put OTP_SECRET
```

Use a long random value for `OTP_SECRET` (at least 32 random bytes). OTPs expire after 10 minutes, allow five verification attempts, and are consumed once. Sessions last seven days and are stored as hashes. Changing the OTP secret invalidates outstanding OTPs. Production cookies are Secure, HttpOnly, and SameSite=Lax.

Reference: https://resend.com/docs/dashboard/domains/introduction

## 6. Payment Account and Subscription Setup

Paddle is the provisional SaaS payment provider. Its standard public pricing is 5% + US$0.50 per checkout transaction, with no monthly fee; verify current pricing and account eligibility before committing. It has identity-verification provisions for individuals/sole traders, but that is not an approval guarantee. Your country, product review, identity, payout method, and tax information still matter. No provider can promise payment acceptance from every country.

- https://www.paddle.com/pricing
- https://www.paddle.com/help/start/account-verification/what-is-identity-verification
- https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle

Use Paddle sandbox first. Create monthly/yearly recurring prices for Starter, Growth and Pro after finalizing actual features and capacity. The amounts currently displayed are proposals. Keep the regional display prices and actual Paddle price overrides consistent; add a provider price-preview endpoint before a public paid launch to avoid stale quotes.

Set encrypted secrets:

```sh
npx wrangler secret put PADDLE_API_KEY
npx wrangler secret put PADDLE_WEBHOOK_SECRET
npx wrangler secret put PADDLE_CLIENT_TOKEN
npx wrangler secret put PADDLE_PRICE_STARTER_MONTHLY
npx wrangler secret put PADDLE_PRICE_GROWTH_MONTHLY
npx wrangler secret put PADDLE_PRICE_PRO_MONTHLY
npx wrangler secret put PADDLE_PRICE_STARTER_YEARLY
npx wrangler secret put PADDLE_PRICE_GROWTH_YEARLY
npx wrangler secret put PADDLE_PRICE_PRO_YEARLY
```

The client token is intentionally returned to the browser; the API key and webhook secret are not. Configure the approved default payment link as `https://relaynest.infotecdigital.com/checkout`. Send subscription lifecycle webhooks to `https://relaynest.infotecdigital.com/api/billing/webhook`. Keep `PADDLE_ENV` as `sandbox` until testing is complete. Live mode requires live credentials, live price IDs, domain approval, final policies, and `PADDLE_ENV=production`.

Test signup, workspace creation, successful checkout, delayed webhook, renewal, cancellation, past-due and paused subscriptions, duplicate/out-of-order events, refunds/revocations, and unauthorized workspace access. Access requires active/trialing status from a valid subscription event. Configure provider refund handling so access is revoked as appropriate; transaction refunds alone do not currently update subscription status.

Customer repair/service invoice payments are not processed by this Paddle SaaS account. Each service business needs a separate, appropriately approved merchant account for its own services.

## 7. Optional AI

Without an AI binding, the assistant returns an explicitly labelled template. To enable actual message generation, add `"ai": { "binding": "AI" }` to `wrangler.jsonc`. The Worker uses `@cf/meta/llama-3.1-8b-instruct-fp8`. Review current model availability and free usage before enabling it. The application limits drafts to 30 per business per day; provider-wide usage can still exceed free allowances across many businesses. Sending remains approval-only.

https://developers.cloudflare.com/workers-ai/platform/pricing/

## 8. Search, Performance, and Launch

Public product and pricing pages are pre-rendered, private routes are excluded from indexing, fonts are self-hosted, the product screenshot is compressed, and app/checkout code loads separately. Add the final site to Google Search Console and submit `/sitemap.xml`. Measure Core Web Vitals and Lighthouse on the actual deployed domain under mobile throttling. No top ranking or performance score has been measured or promised.

Write original, useful industry pages after real customer validation. Expand and professionally review translations; only publish hreflang alternates once each language has complete, indexable content at its own stable URL. Current language switching does not create separate SEO pages. Arabic uses RTL; untranslated copy falls back to English.

Before paid sales: finish plan entitlements, validate legal policy drafts and operator information, confirm support email, add backups/retention cleanup, test actual provider integrations, and complete staff invitations, business timezone handling, pagination, and accessibility review as needed for your initial customers. The requested super-admin panel is intentionally a later phase.
