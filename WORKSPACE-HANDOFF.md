# Workspace presentation

This pass owns only `src/focus.jsx`, `src/workspace-polish.css` and the focused browser check. The CSS loads through DailyFocus and is scoped to `.app-shell`. It adjusts workspace navigation, the metrics strip and daily queue without replacing shared fonts or marketing styles.

Invoice builder, booking, review requests, inbox, server endpoints and pricing remain separate work owned by Claude. Do not overwrite `workspace.jsx`, `main.jsx`, `data.js`, schemas or backend files when deploying this pass.

DailyFocus preserves the existing `focusItems` selection and oldest-first ordering. The queue retains category filters, expansion, keyboard record opening and the all-tasks route. Dates use the existing formatter; overdue counts come from actual records. Reduced motion requires no animation.

Run `TEST_BASE_URL=<preview-or-live-url> node scripts/workspace-polish-check.mjs` for desktop/mobile layout and interaction checks. The test uses sample records in isolated browser storage, never real customer data.
