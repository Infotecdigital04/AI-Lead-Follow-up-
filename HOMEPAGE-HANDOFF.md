# Relaynest homepage handoff

Deployment: `Infotecdigital04/AI-Lead-Follow-up-`, branch `codex/relaynest-client-portal`, Cloudflare Worker `ai-lead-follow-up`.

## Active design (13 October 2026)

The homepage uses an asymmetric hero: clear left-aligned copy and a readable, opaque three-task product preview on the right. Preserve the exact headline "Keep every lead moving forward.", demo and compare-plans CTAs, and "No signup. No card." reassurance. The ribbon artwork is a quiet accent behind the interface, never behind essential copy.

The reference-fidelity pass adds a separate `.rn-product-tilt` perspective wrapper around the animated preview, porcelain-like opaque surfaces, a raised draft panel and gently angled story close-ups. The outer wrapper keeps CSS perspective independent of GSAP transforms. Mobile removes perspective and card rotation for legibility. Preserve the corrected single inset on industry captions; do not combine padding with the older absolute-position offsets.

Page order: hero, combined enquiry-to-delivery product story, industry examples, shared pricing, FAQ, final CTA/footer. The old separate workspace, journey and full-page walkthrough sections have been retired. The walkthrough remains accessible through the product-story button and an accessible modal.

The product story contains three sample-data close-ups: capture the enquiry, prepare the follow-up, share service progress. Automotive imagery is used only in the explicitly labelled automotive example. Industry tabs use relevant automotive/salon artwork or existing product captures. Do not invent testimonials, payment availability or capabilities.

## Files and scope

- `src/studio-home.jsx`: active homepage for both the client router and prerendering. Owns the mobile navigation, three-task preview, industry selector and walkthrough dialog state.
- `src/home-refined.css`: final homepage layout and typography layer, scoped under `.rn-refined`. Imported after `typography.css` in `src/main.jsx`. Make new homepage adjustments here rather than stacking overrides in old tablet hero rules.
- `src/home-sections.jsx`: `ProductStory` and `HomePricing`. Pricing reuses `PlanCards` from `src/public.jsx`; never duplicate or alter the price book for visual changes.
- `src/home-finale.jsx`: exported `WalkthroughDialog`, native FAQ disclosures and closing CTA/footer. The modal supports playback/pause, chapter navigation, Escape, focus restoration and reduced motion.
- `src/home-motion.js`: dynamically loaded GSAP and ScrollTrigger. Brief geometric entrances, floating sculpture/draft, scroll-linked story panels and subtle product/footer motion. No opacity animation, pinned hero or hidden essential text. Ambient movement has a pause control and pauses when the page is hidden. Preserve cleanup on route changes.
- `src/typography.css`: shared native font stack: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif. No downloaded font files. Homepage body is 18px desktop / 16px mobile; product details and support text are at least 13px.
- Older `studio-home.css`, `home-sections.css` and `home-finale.css` remain foundational styles. Retired hero selectors in these files and typography.css do not govern the new hero.
- `homev2.jsx`, `homev2.css` and the old Home export in public.jsx are not the active homepage.

## Verification

Run `npm run build`, then `npm test`. Start the local worker preview with `$env:PORT='8793'; node scripts/local-preview.mjs`.

- `node scripts/refined-home-check.mjs`: active homepage suite at 1440, 1024, 768, 390 and 320px. Checks section order, readable previews, geometry, GSAP movement/pause, walkthrough controls and focus restoration, industry selection, monthly/yearly and currency pricing, plan routes, mobile navigation, reduced motion, blocked animation imports and prerendered content without JavaScript. Writes screenshots and results to test-results/refined-home.
- `node scripts/typography-check.mjs`: broader public/demo/portal/account typography coverage. Authenticated states use intercepted fixtures, not a real paid account.
- Set `TEST_BASE_URL` to test deployment instead of localhost.
- Older reference-check, hero-balance-check and finale-check scripts target retired layouts; use the refined homepage suite for the current composition.

Inspect screenshots as well as assertions. Product previews must remain opaque and unclipped; page height should follow content rather than fixed viewport crops. Hovering an industry photograph intentionally scales it within its clipped image container; text must stay within bounds.

## Pricing and backend

Keep existing routes, demo behavior, currency selection, monthly/yearly calculations and checkout guards unchanged. Plan CTAs remain exploration/signup links while subscriptions await payment-provider approval. The disclaimer and feature lists come from the existing shared pricing components.

## Artwork

Existing assets are illustrative artwork, not customer endorsements:
- ribbon-sculpture.webp: pale jade and brushed-metal interlocking ribbons.
- industry-automotive.webp / industry-salon.webp: category-specific illustrative photography.
- closing-sculpture.webp: intertwined pale-jade loops in a dark emerald setting.
- Complete product captures end in -complete.jpg; workspace-preview.jpg is a retired cropped capture.
No new generated assets were required for this refinement.

## Working with Claude or Codex

Fetch the deployment branch before editing and preserve newer commits. Keep changes scoped; do not force-push or reset unrelated local work. Prefer one final scoped homepage layer over global CSS overrides. Rebuild, inspect responsive screenshots and run the active checks before deployment. Keep essential content visible if GSAP fails, honor reduced motion and retain real links and controls.
