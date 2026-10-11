# Relaynest homepage handoff

Deployment: `Infotecdigital04/AI-Lead-Follow-up-`, branch `codex/relaynest-client-portal`, Cloudflare Worker `ai-lead-follow-up`.

## Active files

- `src/typography.css`: the final shared typography layer, imported after the page styles in `src/main.jsx`. Uses only the native Apple-first system stack, with no downloaded fonts. DM Sans and Manrope imports and dependencies are removed. Type tokens cover desktop/mobile body, cards, controls and supporting copy. Headings use bounded `clamp()` sizes with discrete responsive steps; preserve these tokens instead of adding smaller page-specific overrides. All button targets have a 44px height floor. Decorative product previews retain a separate proportional type scale with a 9px minimum for visible text.
- `scripts/typography-check.mjs`: tests public routes, all demo pages, client portal, lead editor, and browser-fixture authenticated/onboarding/subscription states at 1440, 1024, 768 and 390px. Verifies system font inheritance, no font downloads, minimum text sizes, touch targets and overflow. Signed-in tests use intercepted sample responses, not a real paid account. Run against the preview with `node scripts/typography-check.mjs`; set `TEST_BASE_URL` for live checks.

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

The hero deliberately uses a quieter 500 weight and 36-64px height-aware type scale after user feedback that the global 88px/700 heading overwhelmed the dashboard. Preserve the final hero overrides in `typography.css`, including short-laptop viewport rules. Do not enlarge this headline back to the global section scale; keep the readable body and control sizes elsewhere unchanged.

The middle of the homepage now includes `HomeSections` from `src/home-sections.jsx` and scoped `src/home-sections.css`: an illustrative three-step automotive service journey followed by a dark pricing band. They sit between the existing dark workspace and industry sections. The phone artwork uses the existing car asset ONLY as a labelled automotive example. All visible calls to action lead to existing demos or plan signup. Pricing reuses `PlanCards` in `src/public.jsx` with optional `exploreLabels`; monthly/yearly calculations, country-based currency and the payment-approval notice remain shared with `/pricing`. Do not duplicate the price book or suggest live payment availability.

The user supplied a light hero with sculptural jade/silver ribbons, a tablet-like sample dashboard, a dark workspace section, contextual industry photos, and a very compact dark footer. Preserve this composition. The hero is responsive HTML with sample data, not a screenshot of the full app. Keep its full frame visible within its section; do not use fixed-height cropping. The real app remains reachable through the demo links. Homepage English copy is not a claim of complete translation coverage.

Artwork was generated with the built-in ImageGen tool and optimized as WebP. Prompts: (1) two broad interlocking pale-jade glass and satin champagne-silver ribbon loops on a warm-white studio floor, no text/tablet/UI; (2) black sports coupe in a clean premium detailing workshop, no logos or people; (3) boutique salon with circular mirror, chair and beauty products, no logos or people. These are illustrative assets, not customer endorsements.

## Working with Claude or Codex

## Walkthrough, FAQ and closing section

`src/home-finale.jsx` and `src/home-finale.css` add the walkthrough, six native expandable FAQs, and compact dark closing CTA/footer. `HomeExtras` follows industries; `ClosingFooter` replaces the old footer. The play button opens an accessible native dialog with three sample-data chapters, GSAP playback, pause and chapter controls, Escape dismissal and focus restoration. This is an interactive illustration, not a recorded video or a live AI request. Reduced-motion users start paused. All demo links lead to existing routes. The FAQs continue to work without JavaScript.

`src/home-motion.js` handles scroll reveals, walkthrough frame motion and closing artwork parallax. FAQ toggle events refresh ScrollTrigger positions. Keep the final footer selectors specific enough to override the older generic footer styles. Do not crop the sculpture or turn the dashboard into a background image.

Run `node scripts/finale-check.mjs` against the local preview (port 8793) or set `TEST_BASE_URL` for live verification. It covers 320, 390, 768, 1034 and 1440 pixel widths, artwork, playback, chapter routes, keyboard FAQs, focus restoration, reduced motion and SSR. `scripts/reference-check.mjs` now uses the closing CTA for its route-cleanup check.

### New generated artwork

Mode: built-in ImageGen, optimized to 1440px WebP. These are decorative illustrations, not customer photographs.

- `public/walkthrough-desk.webp`: Prompt: "Create a landscape 1536x1024 photorealistic website product showcase BACKGROUND. Calm modern workspace in soft daylight, pale sage wall, light green stone desktop across bottom, small leafy plant in ivory ceramic pot at extreme left, small ivory pencil cup at extreme right, subtle shadows from window and leaves on right wall. Large EMPTY central 80 percent of composition reserved for a separate HTML dashboard to be overlaid. No computer, no laptop, no tablet, no screen, no text, no typography, no logos, no people. Premium architectural product photography. Clean pale sage/white palette, natural true-to-life surfaces, softly lit but sharp visible objects, refined minimal framing. Desk low in frame, wall behind. Horizontal composition."
- `public/closing-sculpture.webp`: Prompt: "Premium photorealistic abstract sculpture for a SaaS website closing banner, landscape 1536x1024. Two beautifully intertwined sculptural oval loops made of pale jade satin-finish ceramic with subtle polished edges, physical interlocking form, resting on a dark emerald stone studio floor, positioned only in the RIGHT THIRD of a wide frame. Strong soft directional light from upper right catches the jade surfaces, elegant realistic contact shadows, deep almost black emerald #0b1914 studio background. Left two thirds nearly empty dark #0b1914 with subtle natural illumination, reserved for HTML copy. All parts of sculpture fully visible, no cropping. Rich material microtexture, tactile premium industrial design photograph, sophisticated minimal composition. No text, no letters, no logos, no people, no spheres, no floating orbs, no bokeh."

### Collaboration

Fetch the current deployment branch before editing; preserve newer commits. Push small commits to this branch to trigger Cloudflare. Avoid force pushes. Keep homepage styling scoped to prevent global footer rules leaking in. Run `npm run build`, inspect desktop/mobile screenshots at several scroll positions, and check the complete bottom edge of the images. Respect reduced motion and retain real links and controls. Do not add fake customer counts or claims of activated integrations.

