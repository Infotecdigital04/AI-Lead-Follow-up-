# Platform UI handoff

This pass starts from `73fe8bc4e7a893e2477f1cde3b9cb0a66099f619` on
`codex/relaynest-client-portal`. Feature/backend development can continue separately
from the interface layer. Always retrieve the latest branch before replacing files.

## Keep these boundaries

- `src/platform-ui.css` is imported last by `src/workspace.jsx`. It refines the
  workspace, record lists, settings and invoice dialogs without styling marketing pages.
- `src/workspace-polish.css` and `src/focus.jsx` retain the daily-focus queue design.
- Invoice editor/preview remain in `src/workspace.jsx`. Preserve accessible line-item
  labels, mobile layouts, the sticky dialog actions and the business-name prop.
- `src/booking.jsx` and `src/booking.css` contain the four-step request flow. The public
  API still creates a lead, not a confirmed calendar appointment. Do not claim live
  slot availability or confirmation until those backend features exist.
- Booking submits the existing `{name,email,phone,service,slot,notes}` contract.
  The human-readable slot includes the visitor's device timezone. Demo requests stay local.
- Settings exposes the existing booking URL, with copy/open controls.
- Shared `Modal` accepts optional `className` and has an accessible title. Preserve its
  native dialog focus handling and the draft when invoice preview closes.
- Use the supplied transparent Brand assets, native system fonts and lucide icons.

## Verification

Run `npm run build`, `npm test`, and a local preview with `npm run preview`.
Browser checks accept `TEST_BASE_URL` and `PLAYWRIGHT_EXECUTABLE_PATH`:

- `node scripts/platform-ui-check.mjs`: booking validation/review/retry, demo persistence,
  invoice math/add/remove/preview/save, signed-in business names and settings booking link.
- `node scripts/workspace-polish-check.mjs`: workspace routes and focus-queue interactions.
- `node scripts/typography-check.mjs`: public, demo and account layout regression checks.

No subscription prices, payment gates, integrations or API/schema contracts were changed.
Review requests and unified inbox were not present in the starting branch and are not
implemented or claimed by this UI pass.
