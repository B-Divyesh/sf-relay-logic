# Relay Logic handoff

## Release

- Public URL: https://relay-logic.sociobot.in
- Demo URL: https://relay-logic.sociobot.in/demo
- Product type: static Vite and TypeScript browser game
- Implementation SHA deployed: `3ef2ff40b732ced3745ee0fd3122a39f6af0ad6e`
- Deployment: Azure Static Web App `sf-relay-logic`, Central US, production environment
- Deployed: 2026-09-05 UTC

The deployment was built after the implementation commit. The live footer reports build `3ef2ff40`.

## What was built

- A playable circuit-routing board appears in the first viewport on desktop and phone.
- Three 4 × 4 learn boards lead into a 6 × 6 daily board.
- Five signal identities use color, a letter, and a shape.
- The UTC date creates the daily seed, endpoints, path lengths, and extra channels.
- A backtracking solver accepts only boards with one complete path cover.
- Invalid placements do not change paths. A valid move works immediately afterward.
- Hints explain a rule and do not place a relay, name a cell, or read the solution.
- Undo, reset confirmation, sound settings, reload persistence, and three-failure loss handling are complete.
- Win and loss dialogs give a clear next action.
- `/demo` uses separate `demo:relay-logic:*` storage and has reset and exit controls.
- `/privacy`, `/terms`, and a designed HTTP 404 are live.
- Security headers and one-year immutable caching for hashed assets are active.

The visual system is the original enamel switchboard described in `design.md`. All imagery is code-native SVG and CSS. No generated or third-party art, font, icon, script, analytics, or runtime service is used.

## Verification

Clean checkout at the implementation SHA:

```sh
npm ci
npm test
npm run build
```

Results:

- npm audit: 0 vulnerabilities.
- Unit: 8 passing. This includes every 2026 daily seed and all learn boards.
- Browser: 20 passing in Chromium 1.58.2.
- Claims: every command in `claims.json` passed from a clean checkout.
- Build: 25.70 KB JavaScript and 13.28 KB CSS before gzip.
- Gzip: 9.15 KB JavaScript and 4.01 KB CSS.
- Build output: `dist/`.

Live checks:

- `verify-url.sh` passed `/` and `/demo` with no console errors.
- The full 20-test browser suite passed against the HTTPS site.
- Fresh 1440 × 1000 and 390 × 844 contexts showed the job, audience, first action, and board before scrolling.
- Both fresh contexts measured 60 animation frames per second over 120 frames.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100.
- Lighthouse metrics: LCP 1.0 seconds, CLS 0, total blocking time 40 ms, transferred size 15 KiB.
- `/`, `/demo`, `/privacy`, and `/terms` return 200.
- An unknown route returns 404 and renders “This page is not connected.”
- Hashed JavaScript returns `Cache-Control: public, max-age=31536000, immutable`.
- The external Param Factory link returns 200.

Evidence is in `/work/.evidence/relay-logic/`. It includes phone and desktop entry screenshots, solved and loss screens, URL reports, the 404 response, and Lighthouse JSON. The catalog description is copied to `/work/.evidence/catalog-description.txt`.

## Earlier findings

The starting repository had no product implementation, handoff, or earlier review files. During this build, the first deployed 404 rule blocked static assets. The route rules now allow product assets before the 404 fallback. Cold HTTPS checks confirm the fix.

## Known limits

- The 3–8 minute round length is a design target, not a measured human-study result.
- The brief's 75% learn completion and 30% daily attempt goals are not measured. The privacy-first build has no analytics.
- Offline play is not promised. A network connection is needed to load the static app.
- There is no account, multiplayer mode, leaderboard, puzzle editor, or paid tier. These are outside the brief.
