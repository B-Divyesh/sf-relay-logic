# Verify the daily circuit-routing game

## Verdict: FAIL

The live game completes its main job on phone and desktop, and all 16 declared claim commands pass. This verification still fails because one public behavior has no outcome test, another has no declared claim entry, and three footer links miss the required 44 px touch-target height.

## Reviewed release

- Live URL: https://relay-logic.sociobot.in
- Implementation candidate: `9c0bb2c2a50f15dd98d48d6d4ddcbe97476e9aed`
- Documentation and handoff SHA: `1d7d6635fd30c674593aaa3850b3956f92e44dd9`
- Later repository and live footer label: `8a604bc68647bf1bfd76dc5ed3049f4fa122a7ab` / `8a604bc6`

The `9c0bb2c..8a604bc` diff contains only the handoff and Graphify output. It contains no product source, public asset, package, or host configuration change. A fresh production build produced the same hashed JavaScript and CSS names as live. Their SHA-256 hashes also match the live files exactly.

## Findings

### F-1 — Medium — two public behaviors are missing complete claim declarations

The claims contract requires each public behavior to have one `.factory/claims.json` entry and one outcome test tagged `@claim:<id>`.

- The visible **Sound after a move** setting promises audible feedback. Existing claim tests enable and preserve the setting, but none verifies that a valid move produces sound when it is on and stays silent when it is off.
- The README says, “The Privacy page can erase real and demo keys,” and the Privacy page says its control clears real and demo progress plus settings. An untagged browser test verifies deletion, but `.factory/claims.json` has no entry or dedicated claim command for this public behavior.

The first behavior is an untested public claim. The second behavior has aggregate regression coverage but is missing the declaration and exact tagged command required by the claims contract.

Recommended repair: add separate claim entries. Test sound with a stubbed `AudioContext` and assert oscillator creation only after enabling sound and making a move. Tag the existing data-deletion test with its own claim ID and assert all four storage keys are removed.

### F-2 — Minor — footer links are shorter than the required phone touch target

In a fresh 390 × 844 browser on `/demo`, the live footer links measured:

- Privacy: 52.1 × 21.6 CSS px
- Terms: 42.4 × 21.6 CSS px
- Built by Param Factory: 162.2 × 21.6 CSS px

Their clickable rectangles have no enclosing label or padded target. The attached accessibility and design contracts require interactive touch targets of at least 44 × 44 CSS px. Other live controls met the requirement; the 22 px sound checkbox is inside a full-size clickable label and was not counted as a defect.

Recommended repair: give each footer link a minimum 44 px block or inline-flex hit area while preserving the current visual spacing.

## Job, audience, and first action

Fresh desktop (1440 × 1000) and Pixel 7 (412 × 839) sessions started at scroll position 0 with empty storage.

- Job: “Route colored signals through a circuit.”
- Audience: “For solo puzzle players who want one fresh board without reading a long rule sheet.”
- First action: “Try it with sample data.” The adjacent text says three short boards teach the rule.

The playable board starts at y=253 px on desktop and y=575 px on the phone, so the game itself is visible in the first screen. The phone page has no horizontal overflow. The title, audience, first action, three facts, and board appear without scrolling.

## Game and demo results

- The home action opened `/demo` in one click.
- “Demo — sample data, nothing is saved” remained visible with Reset demo and Start for real.
- “Sample board 1 of 3” appeared in both fresh contexts. The scripted run verified the label on all three sample boards.
- A deterministic solver run completed all three samples, showed “Every signal is connected,” and opened the daily board.
- Three failed board tests showed “This run ended.” “Try the same board” restored the same seed with clear paths and fuses.
- Touch placed a relay in a fresh phone context. Arrow keys and Enter placed a relay in a keyboard run.
- Invalid placement left the board unchanged, then a valid relay worked. The left-edge arrow boundary kept focus on the same cell.
- Undo, path step-back, hint, reset confirmation, reload persistence, and settings persistence passed.
- Reset demo removed demo progress without changing a preloaded real marker. Start for real removed both demo keys and preserved real progress and settings.
- Corrupt saved JSON recovered to sample board 1. When storage writes were forced to fail, a relay still placed and the page explained that play could continue for the visit.
- Loss and reset dialogs moved focus inside the dialog. Route changes moved focus to the new h1.
- Fresh desktop and phone sessions each measured 60.0 animation frames per second over 120 intervals. This is a QA observation, not a public performance claim.

The recorded end screens are `/work/.evidence/relay-logic-verify-2/solved-end.png` and `/work/.evidence/relay-logic-verify-2/loss-end.png`.

## Accessibility, privacy, routes, and performance

- The worker URL verifier passed `/` and `/demo` with correct title, `lang=en`, one h1, one main landmark, labeled controls, and no console errors.
- The live 24-test browser suite passed serious and critical axe checks on `/`, `/demo`, `/privacy`, `/terms`, and the designed 404.
- Keyboard play, visible focus behavior, reduced motion, phone layout, route focus, and dialog focus passed. Transition and animation durations were effectively zero under reduced motion.
- Text resized to 200% at 390 px without horizontal overflow or loss of the heading or board.
- Demo actions made only same-origin requests. There is no backend, account, analytics, payment, multiplayer, or AI feature to test.
- Offline play and update handling are not promised. A network connection is documented as required for initial load.
- `/`, `/demo`, `/privacy`, `/terms`, `robots.txt`, and `sitemap.xml` returned 200. `/not-a-page` deliberately returned HTTP 404 and rendered the designed return path. The external Sociobot link returned 200.
- Live headers include CSP with `frame-ancestors 'none'`, HSTS, `Referrer-Policy`, `X-Content-Type-Options`, and a restrictive permissions policy. The hashed JavaScript returns one-year immutable caching.
- Lighthouse mobile scored 100 performance, 100 accessibility, 100 best practices, and 100 SEO. LCP was 907 ms, CLS was 0, total blocking time was 51 ms, and transferred bytes were 15,331.
- The production build contains 25.70 KB JavaScript and 13.28 KB CSS before gzip. Both are below budget.

## Clean checkout and claims

A clean clone at `8a604bc68647bf1bfd76dc5ed3049f4fa122a7ab` used the documented Node/npm setup. `npm ci` installed 60 packages with zero audit vulnerabilities.

- `npm test`: 8 unit tests and 24 Chromium browser tests passed.
- `npm run build`: passed and produced `dist/`.
- All 16 commands in `.factory/claims.json` passed individually.
- All 16 declared IDs are unique and each appears exactly once in test titles.
- The same 24 browser tests passed against live HTTPS.
- Declared claim results: 16 pass, 0 fail.
- Untested public claims: 1.

## Earlier findings

- The original static-asset 404 issue remains resolved. The live hashed script returned 200 with immutable caching and loaded in every browser run.
- Verification 1 found missing claims for touch input, path step-back, Undo, and leaving demo. The repaired entries and their four isolated commands all passed locally and live. Each ID appears exactly once. That finding is resolved.
- No earlier minor finding was left open. F-1 and F-2 above are new findings from this verification.

## Evidence

- `/work/.evidence/relay-logic-verify-2/live-e2e.txt`
- `/work/.evidence/relay-logic-verify-2/claim-commands.txt`
- `/work/.evidence/relay-logic-verify-2/npm-test.txt`
- `/work/.evidence/relay-logic-verify-2/npm-build.txt`
- `/work/.evidence/relay-logic-verify-2/live-inspection.json`
- `/work/.evidence/relay-logic-verify-2/dialog-focus.json`
- `/work/.evidence/relay-logic-verify-2/storage-recovery.json`
- `/work/.evidence/relay-logic-verify-2/lighthouse.json`
- `/work/.evidence/relay-logic-verify-2/live-build-sha256.txt`
- `/work/.evidence/relay-logic-verify-2/desktop-home.png`
- `/work/.evidence/relay-logic-verify-2/phone-home.png`
- `/work/.evidence/relay-logic-verify-2/solved-end.png`
- `/work/.evidence/relay-logic-verify-2/loss-end.png`

## Result counts

- Findings: 2
- Untested public claims: 1
- Verdict: FAIL
