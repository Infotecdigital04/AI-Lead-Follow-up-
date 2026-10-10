# Relaynest homepage handoff

Deployment: `Infotecdigital04/AI-Lead-Follow-up-`, branch `codex/relaynest-client-portal`, Cloudflare Worker `ai-lead-follow-up`.

## Active files

- `src/studio-home.jsx`: active homepage in both `src/main.jsx` and `src/prerender.jsx`.
- `src/studio-home.css`: homepage styling, scoped under `.rn-home`.
- `src/home-motion.js`: lazy-loaded GSAP and ScrollTrigger, desktop scroll-controlled hero, entrance and section animations. MatchMedia handles reduced motion and small screens. Cleanup must run when leaving the route.
- `public/*-complete.jpg`: complete app captures. `workspace-preview.jpg` is the old, truncated image; do not switch back to it.
- `scripts/capture-complete.mjs`: recaptures the three demo pages, including their actual page footers.

`homev2.jsx`, `homev2.css`, and the old `Home` export in `public.jsx` are not the active homepage. `PlanCards` in `public.jsx` is shared with the pricing page; do not introduce conflicting price tables. Payments remain subject to provider activation.

## Working with Claude or Codex

Fetch the current deployment branch before editing; preserve newer commits. Push small commits to this branch to trigger Cloudflare. Avoid force pushes. Keep homepage styling scoped to prevent global footer rules leaking in. Run `npm run build`, inspect desktop/mobile screenshots at several scroll positions, and check the complete bottom edge of the images. Respect reduced motion and retain real links and controls. Do not add fake customer counts or claims of activated integrations.
