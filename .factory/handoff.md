# Relay Logic handoff

## Release

- Public URL: https://relay-logic.sociobot.in
- Demo URL: https://relay-logic.sociobot.in/demo
- Product type: static Vite and TypeScript browser game
- Implementation SHA deployed: `9c0bb2c2a50f15dd98d48d6d4ddcbe97476e9aed`
- Deployment: Azure Static Web App `sf-relay-logic`, Central US, production environment
- Deployed: 2026-09-05 UTC

The deployment was built after the implementation commit. The live footer reports build `9c0bb2c2`.

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
- Browser: 24 passing in Chromium 1.58.2.
- Claims: all 16 commands in `claims.json` passed individually from a clean checkout.
- Build: 25.70 KB JavaScript and 13.28 KB CSS before gzip.
- Gzip: 9.15 KB JavaScript and 4.01 KB CSS.
- Build output: `dist/`.

Live checks:

- `verify-url.sh` passed `/` and `/demo` with no console errors.
- The full 24-test browser suite passed against the HTTPS site.
- Fresh 1440 × 1000, 412 × 839 touch, and 390 × 844 layout contexts showed the job, audience, first action, and board before scrolling.
- Both fresh contexts measured 60 animation frames per second over 120 frames.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100.
- Lighthouse metrics: LCP 0.9 seconds, CLS 0, total blocking time 0 ms, transferred size 15 KiB.
- `/`, `/demo`, `/privacy`, and `/terms` return 200.
- An unknown route returns 404 and renders “This page is not connected.”
- Hashed JavaScript returns `Cache-Control: public, max-age=31536000, immutable`.
- The external Param Factory link returns 200.

Evidence is in `/work/.evidence/relay-logic-repair-1/`. It includes phone and desktop entry screenshots, solved and loss screens, URL reports, cold-browser measurements, and Lighthouse JSON. The catalog description is copied to `/work/.evidence/catalog-description.txt`.

## Earlier findings

The starting repository had no product implementation, handoff, or earlier review files. During this build, the first deployed 404 rule blocked static assets. The route rules now allow product assets before the 404 fallback. Cold HTTPS checks confirm the fix.

Independent verification 1 found one medium issue: four public behaviors had no claim entries or tagged browser tests. Repair 1 adds one claim and one outcome-based browser test for each behavior:

- A fresh phone context taps a source and linked socket, then observes a placed relay.
- Selecting an earlier relay restores the exact shortened path and reopens the signal.
- Undo restores the active source and removes only the last valid relay placement.
- Start for real deletes both populated demo keys while preserving existing real progress and settings.

The claim manifest now has 16 unique IDs and the suite has exactly one matching tag per ID. No product behavior code changed because manual verification showed all four behaviors already worked. The repaired tests pass locally, from a clean clone, and against the deployed HTTPS product. The medium finding is resolved, and no minor findings remain open.

## Known limits

- The 3–8 minute round length is a design target, not a measured human-study result.
- The brief's 75% learn completion and 30% daily attempt goals are not measured. The privacy-first build has no analytics.
- Offline play is not promised. A network connection is needed to load the static app.
- There is no account, multiplayer mode, leaderboard, puzzle editor, or paid tier. These are outside the brief.

## Independent verification 1

Independent verification on 2026-09-05 reviewed implementation `3ef2ff40b732ced3745ee0fd3122a39f6af0ad6e` and documentation/test SHA `dd0b80d5657b0fa6d725e70b4b44adb74e5c3174` against https://relay-logic.sociobot.in. The live footer reports later build label `7046d18c`; its diff from the implementation changes only handoff/test/Graphify files, not product source or deployment configuration.

`npm ci`, `npm run build`, `npm test`, all 12 declared claim commands, the live 20-test suite, the worker URL verifier, fresh desktop and phone sessions, touch, keyboard, win/loss, privacy, headers, routes, and designed 404 checks passed. The earlier static-asset 404 issue remains resolved: the live hashed script is 200 and immutable-cached.

Verification verdict: **FAIL**. Four public behavior claims have no `.factory/claims.json` entry or tagged regression test: touch input, stepping back along a path, Undo restoring the last valid action, and leaving demo mode without copying demo data. The behavior worked in the manual check, but the claims contract requires automated coverage. See `.factory/verification-1.md` for evidence and repair details.
