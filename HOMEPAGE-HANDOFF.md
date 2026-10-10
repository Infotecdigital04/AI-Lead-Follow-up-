# Relaynest homepage handoff

Deployment: `Infotecdigital04/AI-Lead-Follow-up-`, branch `codex/relaynest-client-portal`, Cloudflare Worker `ai-lead-follow-up`.

## Active files

- `src/studio-home.jsx`: active homepage in both `src/main.jsx` and `src/prerender.jsx`.
- `src/studio-home.css`: homepage styling, scoped under `.rn-home`.
- `src/home-motion.js`: lazy-loaded GSAP and ScrollTrigger, ambient ribbon/follow-up movement, entrance reveals and scroll-controlled dashboard perspective. No pinned hero. Reduced motion and explicit ambient pause are supported; cleanup runs when leaving the route.
- `public/ribbon-sculpture.webp`: generated mint-glass and brushed-metal artwork; HTML UI and text are separate from the image.
- `public/industry-automotive.webp` and `public/industry-salon.webp`: generated illustrative photography used ONLY for their labelled business categories. Do not use generic car/furniture photos in the hero. Creative/professional tabs show relevant product views instead.
- `scripts/reference-check.mjs`: current responsive, motion, pause, category, route-cleanup and SSR checks. Older studio/motion scripts target the retired layout.
- `public/*-complete.jpg`: complete app captures. `workspace-preview.jpg` is the old, truncated image; do not switch back to it.
- `scripts/capture-complete.mjs`: recaptures the three demo pages, including their actual page footers.

`homev2.jsx`, `homev2.css`, and the old `Home` export in `public.jsx` are not the active homepage. `PlanCards` in `public.jsx` is shared with the pricing page; do not introduce conflicting price tables. Payments remain subject to provider activation.

## Reference design

The middle of the homepage now includes `HomeSections` from `src/home-sections.jsx` and scoped `src/home-sections.css`: an illustrative three-step automotive service journey followed by a dark pricing band. They sit between the existing dark workspace and industry sections. The phone artwork uses the existing car asset ONLY as a labelled automotive example. All visible calls to action lead to existing demos or plan signup. Pricing reuses `PlanCards` in `src/public.jsx` with optional `exploreLabels`; monthly/yearly calculations, country-based currency and the payment-approval notice remain shared with `/pricing`. Do not duplicate the price book or suggest live payment availability.

The user supplied a light hero with sculptural jade/silver ribbons, a tablet-like sample dashboard, a dark workspace section, contextual industry photos, and a very compact dark footer. Preserve this composition. The hero is responsive HTML with sample data, not a screenshot of the full app. Keep its full frame visible within its section; do not use fixed-height cropping. The real app remains reachable through the demo links. Homepage English copy is not a claim of complete translation coverage.

Artwork was generated with the built-in ImageGen tool and optimized as WebP. Prompts: (1) two broad interlocking pale-jade glass and satin champagne-silver ribbon loops on a warm-white studio floor, no text/tablet/UI; (2) black sports coupe in a clean premium detailing workshop, no logos or people; (3) boutique salon with circular mirror, chair and beauty products, no logos or people. These are illustrative assets, not customer endorsements.

## Working with Claude or Codex

Fetch the current deployment branch before editing; preserve newer commits. Push small commits to this branch to trigger Cloudflare. Avoid force pushes. Keep homepage styling scoped to prevent global footer rules leaking in. Run `npm run build`, inspect desktop/mobile screenshots at several scroll positions, and check the complete bottom edge of the images. Respect reduced motion and retain real links and controls. Do not add fake customer counts or claims of activated integrations.
