# Verify the daily circuit-routing game

## Verdict: FAIL

The live game completes its main job on phone and desktop. All 22 declared claim commands pass independently, and no public claim is untested. This verification still fails because the keyboard focus outline on the two demo-banner actions does not meet the required 3:1 contrast.

## Reviewed release

- Live URL: https://relay-logic.sociobot.in
- Implementation candidate: `b280c937ca3bee7a9bb9117709e7102095538281`
- Final repair documentation SHA: `de5bba0b673dd7ae774c598ba704ed36cfff049d`
- Runtime behavior source ancestor: `2baa0eab3319529988826a02a402e67fc2b8a428`
- Later repository and live build label: `e2b14c6c9c70d7ff28ab803c606787c8e62e794c` / `e2b14c6c`

The change from `de5bba0` to `e2b14c6` contains Graphify output only. A clean build with the live label produced JavaScript and CSS that are byte-identical to the live assets. The implementation reviewed is therefore `b280c937`; the later build label does not represent a product change.

## Finding

### F-1 — Minor — demo-banner focus outlines are below 3:1 contrast

On `/demo`, keyboard focus uses a `3px` `#075a9a` outline for **Reset demo** and **Start for real**. Those transparent buttons sit on the banner's `#202321` background. The contrast between the outline and adjacent banner is `2.22:1`. The attached accessibility contract requires a designed focus ring with at least `3:1` contrast.

The ring is present and the controls remain operable, so this is minor rather than a blocked keyboard path. It affects both phone and desktop layouts. Evidence: `/work/.evidence/relay-logic-verify-4/focus-demo-reset.png` and the recorded computed styles in the live check.

Recommended repair: use a focus color that reaches at least `3:1` against `#202321`, or give these two controls a contrasting focused background or inner indicator. Keep the existing focus treatment on light surfaces if desired.

## Job, audience, and first action

Fresh browsers opened at the top of the page with empty storage.

- Job: “Route colored signals through a circuit.”
- Audience: “For solo puzzle players who want one fresh board without reading a long rule sheet.”
- First action: “Try it with sample data.” The next line says three short boards teach the rule.
- Facts: free to play, no account or ads, and progress stays in this browser.

The board begins at 253 px in a 1440 × 1000 desktop viewport and 575 px in a 412 × 839 phone viewport. It is visible before scrolling in both. Neither page has horizontal overflow.

## Game and demo results

- One click entered `/demo` and showed a ready 4 × 4 sample board.
- “Demo — sample data, nothing is saved” and the sample-board label remained visible through all three samples and the daily handoff.
- A deterministic run solved all three sample boards and the 6 × 6 daily board for 2026-09-05.
- The daily board used seed `4017184299`, had one solver result, filled 36 sockets in 31 moves, and showed “Every signal is connected.”
- Three failed tests showed “This run ended.” Restart restored seed `3403825992`, all fuses, and an empty route.
- Phone touch placed a relay. Pointer, Tab, Space, arrows, Enter, Undo, path step-back, and reset worked.
- Invalid placement left the board unchanged. The next valid relay worked. The left-edge keyboard boundary kept focus in the board.
- Sound feedback occurred only when enabled. The setting and current game state survived reload.
- Reset demo removed both demo keys, restored sample board 1, and left seeded real progress and settings unchanged.
- Start for real removed demo data without copying it into real storage.
- Corrupt storage recovered to sample board 1. Blocked writes did not stop play and produced a useful recovery message.
- Reset and loss dialogs received focus. The timer paused while the page was marked hidden.
- Fresh desktop and phone runs each measured 60.0 request-animation-frame callbacks per second over 120 frames.

End-screen evidence is in `/work/.evidence/relay-logic-verify-4/sample-solved-end.png`, `/work/.evidence/relay-logic-verify-4/daily-solved-end.png`, and `/work/.evidence/relay-logic-verify-4/loss-end.png`.

## Claims and clean checkout

A detached clean worktree at `de5bba0` used Node 22 and the documented npm setup.

- `npm ci`: 60 packages installed; 0 audit vulnerabilities.
- `npm test`: 8 unit tests and 28 Chromium browser tests passed.
- `npm run build`: passed and created `dist/`.
- Build output: 25.70 KB JavaScript, 13.41 KB CSS, and 55.41 KB social image.
- The manifest has 22 unique claim IDs. Each ID occurs exactly once in a test title.
- Every command in `.factory/claims.json` was run separately and passed.
- The same 28 browser tests passed against the live HTTPS origin.

| Claim IDs | Result |
| --- | --- |
| `daily-seed`, `fresh-daily` | Pass |
| `complete-run`, `free-no-account`, `ad-free`, `loss-end` | Pass |
| `invalid-recovery`, `rule-hint`, `reset-scope`, `local-save` | Pass |
| `move-sound`, `demo-isolation`, `privacy-local`, `keyboard-play` | Pass |
| `signal-redundancy`, `count-up-timer`, `demo-banner`, `touch-play` | Pass |
| `step-back`, `undo-action`, `leave-demo`, `clear-saved-data` | Pass |

The live page, README, demo documentation, privacy page, and terms page were cross-checked against the manifest. No public claim is missing an outcome test. The 3–8 minute text is explicitly an intended session design target, not a measured completion promise.

## Accessibility, privacy, routes, and performance

- The worker URL verifier passed `/` and `/demo`: correct title, `lang=en`, one h1, one main landmark, labeled controls, alt checks, and no console errors.
- Axe found no serious or critical violations on `/`, `/demo`, `/privacy`, `/terms`, or the designed missing-page route.
- Keyboard operation, skip link, route focus, dialog focus, touch input, reduced motion, and 200% text checks passed apart from F-1.
- At 390 px, footer links measured 56.1 × 44, 46.4 × 44, and 166.2 × 44 CSS px.
- Demo play and the complete deterministic run contacted only `https://relay-logic.sociobot.in` and set no cookies.
- `/`, `/demo`, `/privacy`, `/terms`, `robots.txt`, and `sitemap.xml` returned 200.
- `/not-a-page` deliberately returned HTTP 404 and rendered the designed page with a return path. This is expected, not a defect.
- Every route had its own title, one h1, one main landmark, `lang=en`, and a route-specific canonical URL. The external Param Factory link returned 200.
- Security headers include CSP with `frame-ancestors 'none'`, HSTS, Referrer-Policy, X-Content-Type-Options, and a restrictive permissions policy.
- The live hashed JavaScript returned 200 with one-year immutable caching.
- Lighthouse mobile scored 99 performance, 100 accessibility, 100 best practices, and 100 SEO. LCP was 1,038 ms, CLS was 0, total blocking time was 92.5 ms, and transfer size was 15,376 bytes.
- Offline play and update handling are not promised. There is no service worker. A connection is required for the first load.
- There is no backend, account, payment, multiplayer, or AI feature. Tenant isolation, backend restart, health, 429, and independent multiplayer-client checks do not apply.

## Earlier findings

- Initial static assets blocked by the 404 rule: resolved. Live assets return 200, use immutable caching, and are byte-identical to a clean build with the live label.
- Verification 1 missing touch, path step-back, Undo, and leave-demo claims: resolved. All four IDs occur once and all four commands pass separately and live.
- Verification 2 missing sound and saved-data deletion claims: resolved. Both commands pass separately and live.
- Verification 2 footer targets below 44 px: resolved. The live phone measurements are listed above.
- Verification 3 absent ad-free, signal-redundancy, count-up-timer, and persistent-demo-label claims: resolved. All four commands pass separately and live.
- Verification 3 incomplete keyboard, demo reset, and local-save checks: resolved. The expanded outcomes pass separately and live.

No earlier finding remains open. F-1 is new in this independent review.

## Evidence

- `/work/.evidence/relay-logic-verify-4/live-check.json`
- `/work/.evidence/relay-logic-verify-4/recovery-check.json`
- `/work/.evidence/relay-logic-verify-4/lighthouse.json`
- `/work/.evidence/relay-logic-verify-4/verify-home/verify.json`
- `/work/.evidence/relay-logic-verify-4/verify-demo/verify.json`
- `/work/.evidence/relay-logic-verify-4/desktop-home.png`
- `/work/.evidence/relay-logic-verify-4/phone-home.png`
- `/work/.evidence/relay-logic-verify-4/desktop-demo.png`
- `/work/.evidence/relay-logic-verify-4/phone-demo.png`
- `/work/.evidence/relay-logic-verify-4/focus-demo-reset.png`
- `/work/.evidence/relay-logic-verify-4/sample-solved-end.png`
- `/work/.evidence/relay-logic-verify-4/daily-solved-end.png`
- `/work/.evidence/relay-logic-verify-4/loss-end.png`

## Result counts

- Findings: 1
- Untested public claims: 0
- Verdict: FAIL
