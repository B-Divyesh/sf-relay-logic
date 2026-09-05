# Relay Logic handoff

## Release

- Public URL: https://relay-logic.sociobot.in
- Demo URL: https://relay-logic.sociobot.in/demo
- Product type: static Vite and TypeScript browser game
- Implementation SHA deployed: `2baa0eab3319529988826a02a402e67fc2b8a428`
- Documentation and verification SHA: `fd621a6012b46a4870ed4ddc8791ff78e8ea7570` (not deployed; the repair release record)
- Deployment: Azure Static Web App `sf-relay-logic`, Central US, production environment
- Deployed: 2026-09-05 UTC

The product behavior was built from the implementation commit. A later Graphify-only rebuild makes the live footer report `adc7ce06`; verification 3 normalized that label and the resulting source-map filename and found the JavaScript otherwise byte-identical to candidate `2baa0ea`. The live CSS is byte-identical.

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

Repair 2 was verified from a clean installed checkout at the implementation SHA:

```sh
npm ci
npm test
npm run build
```

Results:

- npm audit: 0 vulnerabilities.
- Unit: 8 passing. This includes every 2026 daily seed and all learn boards.
- Browser: 26 passing in Chromium 1.58.2.
- Claims: all 18 commands in `claims.json` passed individually from a clean checkout.
- Build: 25.70 KB JavaScript and 13.41 KB CSS before gzip.
- Gzip: 9.15 KB JavaScript and 4.04 KB CSS.
- Build output: `dist/`.

Repair 2 live checks:

- `verify-url.sh` passed `/` and `/demo` with no console errors.
- The full 26-test browser suite passed against the HTTPS site.
- Fresh 1440 × 1000 desktop and 412 × 839 Pixel 7 contexts showed the job “Route colored signals through a circuit,” the solo-puzzle audience, the “Try it with sample data” action, and the board before scrolling. The board began at 253 px on desktop and 575 px on phone.
- In both fresh contexts, one click opened the demo. Its persistent banner and “Sample board 1 of 3” label remained visible. Reset demo cleared demo keys while a preloaded real marker remained unchanged.
- The deterministic live browser run completed all three sample boards, captured the solved end screen, reached the three-failure loss screen, and restarted the same seed. Screenshots are in `/work/.evidence/relay-logic-repair-2/`.
- Every footer link measured at least 44 × 44 CSS px at 390 px: Privacy 56.1 × 44, Terms 46.4 × 44, and Built by Param Factory 166.2 × 44.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100.
- Lighthouse metrics: LCP 901 ms, CLS 0, total blocking time 8.5 ms, transferred size 14,759 bytes.
- `/`, `/demo`, `/privacy`, and `/terms` return 200.
- An unknown route returns 404 and renders “This page is not connected.”
- Hashed JavaScript returns `Cache-Control: public, max-age=31536000, immutable`.
- The external Param Factory link returns 200.

## Repair 2 disposition

Independent verification 2 found two defects and one untested public claim. All are resolved in implementation `2baa0eab3319529988826a02a402e67fc2b8a428`:

- **Sound after a move** is now claim `move-sound`. Its browser test replaces Web Audio with a recorded fixture, clears source-selection noise, then proves a valid relay starts audio only while the setting is on and is silent after it is turned off.
- **Saved-data deletion** is now claim `clear-saved-data`. Its browser test seeds real and demo progress plus both sound-setting keys, invokes the Privacy control, and proves all four keys are removed.
- **Footer link targets** now have a 44 px minimum width and height. The phone accessibility test measures their rendered rectangles rather than checking CSS text.

No public behavior or claim is left untested. The previous static-asset 404 fix remains resolved: the current live asset `/assets/index-DtEfDcwH.js` returns 200, has immutable caching, and contains the deployed build label `2baa0ea`.

Evidence for this repair is in `/work/.evidence/relay-logic-repair-2/`. `.factory/catalog-description.txt` remains the verb-first 69-character description and is copied to `/work/.evidence/catalog-description.txt`.

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

## Independent verification 2

Independent verification on 2026-09-05 reviewed implementation `9c0bb2c2a50f15dd98d48d6d4ddcbe97476e9aed` and documentation `1d7d6635fd30c674593aaa3850b3956f92e44dd9` against the live site. The live footer reports later Graphify/report label `8a604bc6`; the diff contains no product source, public asset, package, or host configuration change. Fresh build asset hashes match live exactly.

The clean checkout passed `npm ci`, `npm test` (8 unit and 24 browser tests), all 16 declared claim commands, and `npm run build`. The 24-test suite also passed against live HTTPS. Fresh desktop and phone entry checks, the complete three-board run, win and loss screens, demo isolation, restart and recovery, keyboard and touch, focus, reduced motion, 200% text, routes, privacy requests, security headers, and Lighthouse checks otherwise passed. Lighthouse scored 100/100/100/100.

Verification verdict: **FAIL** with two findings and one untested public claim. The visible Sound after a move behavior lacks an outcome test and claim entry. Saved-data deletion has an untagged regression but no claim entry or dedicated claim command. The Privacy, Terms, and external footer links measure 21.6 px high at 390 px instead of the required 44 px touch target. See `.factory/verification-2.md` and `/work/.evidence/relay-logic-verify-2/`.

## Independent verification 3

Independent verification on 2026-09-05 reviewed implementation `2baa0eab3319529988826a02a402e67fc2b8a428`, release handoff `fd621a6012b46a4870ed4ddc8791ff78e8ea7570`, and SHA record `0353f345177ccdcf9bc62daf4712e8c03a895cc1` against the live site. The live footer reports later Graphify-only build label `adc7ce06`; normalized live JavaScript and exact CSS comparison confirm the same product behavior.

From a detached clean worktree, `npm ci`, `npm test` (8 unit and 26 browser tests), `npm run build`, and all 18 declared claim commands passed. The 26 browser tests also passed against live HTTPS. Fresh desktop and phone sessions, touch, keyboard, all three sample wins, a daily-board win, loss and same-seed restart, demo isolation, corrupt and blocked storage recovery, focus, reduced motion, 200% text, privacy requests, routes, headers, and the designed HTTP 404 passed. Lighthouse mobile scored 100/100/100/100. Earlier verification findings are resolved, including the sound and saved-data claim commands and 44 px footer targets.

Verification verdict: **FAIL** with two findings and seven untested public claims. Four public promises have no complete claim entry: no ads, letter-and-shape signal redundancy, no countdown, and a demo banner that persists through board changes. Three promises are only partly covered: Tab and Space keyboard operation, Reset demo deleting both demo keys and restoring sample board 1 from later progress, and local storage of the learn step and timer. Manual live checks show those behaviors work; the failure is the mandatory claim coverage. See `.factory/verification-3.md` and `/work/.evidence/relay-logic-verify-3/`.
