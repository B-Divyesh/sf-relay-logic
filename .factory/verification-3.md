# Verify the daily circuit-routing game

## Verdict: FAIL

The live game completes its main job on phone and desktop, all 18 declared claim commands pass, and the earlier findings are resolved. This verification still fails because seven public promises are absent from the claim manifest or are only partly asserted by their tagged tests.

## Reviewed release

- Live URL: https://relay-logic.sociobot.in
- Implementation candidate: `2baa0eab3319529988826a02a402e67fc2b8a428`
- Release handoff: `fd621a6012b46a4870ed4ddc8791ff78e8ea7570`
- Release SHA record: `0353f345177ccdcf9bc62daf4712e8c03a895cc1`
- Later repository head and live footer label: `adc7ce061059980ab41d6247d16b3740a4d9e37f` / `adc7ce06`

The changes after the implementation candidate are documentation and Graphify output only. The live CSS is byte-identical to the candidate build. The live JavaScript becomes byte-identical after replacing the build label and resulting source-map filename. The reviewed runtime therefore matches implementation candidate `2baa0ea`.

## Findings

### F-1 — Medium — four public promises are missing from the claim manifest

These statements appear on the live page or in the README, but no entry in `.factory/claims.json` names and tests the complete promise:

- “No account or ads” includes an ad-free promise. `free-no-account` proves free completion without login or payment, but it does not assert that no ad UI or ad request appears.
- “Color is paired with a letter and shape” is the published color-accessibility behavior. No claim test checks that each signal has all three identifiers.
- “There is no countdown” has no claim entry or timer-direction assertion.
- “A persistent banner identifies demo mode” has no claim entry. Existing tests see the banner at entry or after reset, but no tagged test asserts that it remains through board changes.

Manual live checks found no ads, showed letters and shapes, observed a count-up timer, and retained the demo banner. The defect is missing regression coverage required by the claims contract.

Recommended repair: add one manifest entry and one tagged outcome test for each promise. The privacy test should also reject ad requests and ad containers, not only compare request origins.

### F-2 — Medium — three published claims are only partly tested

- The live note and README say Tab reaches a socket and Space selects or places a relay. `keyboard-play` programmatically focuses the source, then tests an arrow key and Enter. It never presses Tab or Space, and its claim text names only arrows and Enter.
- `.factory/demo.md` says Reset demo deletes both demo keys and restores sample board 1. `demo-isolation` starts on sample board 1, creates only the progress key, then checks only that progress key. It does not populate and remove the demo sound key or reset from a later sample.
- The Privacy page says the current paths, learn-board step, timer, and sound setting use local storage. `local-save` reloads and asserts a path plus sound only. It does not assert the saved learn step or timer.

Manual live checks confirmed Tab and Space play, reset a populated sample 2 with sound back to sample 1, and removed both demo keys without changing a real marker. Those successful observations do not satisfy the required tagged regression coverage.

Recommended repair: broaden the three claim declarations and their single tagged tests to assert every published part.

## Job, audience, and first action

Fresh desktop at 1440 × 1000 and Pixel 7 at 412 × 839 started at scroll position 0 with empty storage.

- Job: “Route colored signals through a circuit.”
- Audience: “For solo puzzle players who want one fresh board without reading a long rule sheet.”
- First action: “Try it with sample data.” The adjacent text says three short boards teach the rule.
- Facts: free to play, no account or ads, and progress stays in this browser.

The board began at 253 px on desktop and 575 px on phone, inside both first viewports. The page had no horizontal overflow.

## Demo and game results

- One click opened `/demo`.
- “Demo — sample data, nothing is saved” and “Sample board 1 of 3” were visible.
- Phone touch and desktop pointer input placed a relay.
- Reset demo removed populated demo progress and sound keys, restored sample board 1 from sample board 2, and preserved a real-data marker.
- A deterministic live run solved all three sample boards and the 6 × 6 daily board for 2026-09-05. Each produced the actual “Every signal is connected” end screen.
- Three failed tests produced “This run ended.” Restart kept seed `3403825992`, cleared paths, and restored all fuses.
- Invalid input left the board unchanged; a valid move then worked.
- Tab reached a source, ArrowRight moved focus, and Space placed a relay. The left-edge arrow boundary remained in place in the shipped suite.
- Undo, path step-back, hint, reset confirmation, reload persistence, sound feedback, and sound persistence passed.
- Corrupt saved JSON recovered to sample board 1. Forced storage-write failure still allowed play and showed the recovery message.
- End and reset dialogs moved focus inside the dialog. Route navigation moved focus to the new h1.
- The timer paused while the document was hidden.
- Full demo and daily play made requests only to `https://relay-logic.sociobot.in`.
- Fresh desktop and phone measurements were 60.0 animation frames per second over 120 intervals.

Recorded screens are in `/work/.evidence/relay-logic-verify-3/`, including `solved-end.png`, `daily-solved-end.png`, and `loss-end.png`.

## Accessibility, routes, privacy, and performance

- The worker URL verifier passed `/` and `/demo` with no console errors.
- The live 26-test suite passed axe serious/critical checks on `/`, `/demo`, `/privacy`, `/terms`, and the designed 404.
- Every measured phone target was at least 44 × 44 CSS px. Footer links measured 56.1 × 44, 46.4 × 44, and 166.2 × 44.
- Reduced-motion transition duration was effectively zero.
- Text at 200% stayed within a 390 px viewport with the heading and board present.
- `/`, `/demo`, `/privacy`, `/terms`, `robots.txt`, and `sitemap.xml` returned 200.
- `/not-a-page` deliberately returned 404 and rendered “This page is not connected” with a return link. This is expected behavior.
- Route titles, one h1, one main landmark, `lang=en`, and canonical URLs were correct.
- The external Param Factory link returned 200.
- Security headers include CSP with `frame-ancestors 'none'`, HSTS, Referrer-Policy, X-Content-Type-Options, and a restrictive permissions policy.
- The hashed JavaScript returned 200 with one-year immutable caching.
- Lighthouse mobile scored 100 performance, 100 accessibility, 100 best practices, and 100 SEO. LCP was 937 ms, CLS was 0, total blocking time was 29 ms, and transfer size was 14,740 bytes.
- Offline play and update handling are not promised. There is no backend, account, multiplayer, payment, or AI feature, so tenant, restart, health, 429, and independent-client checks do not apply.

## Clean checkout and declared claims

A detached clean worktree at `2baa0eab3319529988826a02a402e67fc2b8a428` used the documented Node 22 and npm setup.

- `npm ci`: passed with 60 packages and zero audit vulnerabilities.
- `npm test`: passed with 8 unit tests and 26 Chromium tests.
- `npm run build`: passed and produced `dist/`.
- Build output: 25.70 KB JavaScript (9.15 KB gzip) and 13.41 KB CSS (4.04 KB gzip).
- All 18 claim IDs are unique and occur exactly once in the product tests.
- Every declared command was also run individually from that worktree.

| Claim ID | Result |
| --- | --- |
| `daily-seed` | Pass |
| `fresh-daily` | Pass |
| `complete-run` | Pass |
| `free-no-account` | Pass |
| `loss-end` | Pass |
| `invalid-recovery` | Pass |
| `rule-hint` | Pass |
| `reset-scope` | Pass |
| `local-save` | Pass |
| `move-sound` | Pass |
| `demo-isolation` | Pass |
| `privacy-local` | Pass |
| `keyboard-play` | Pass |
| `touch-play` | Pass |
| `step-back` | Pass |
| `undo-action` | Pass |
| `leave-demo` | Pass |
| `clear-saved-data` | Pass |

The verdict is based on the seven unlisted or incomplete public claims above, not a failed declared command.

## Earlier findings

- The original static-asset 404 is resolved. The live JavaScript asset returns 200 and immutable caching.
- Verification 1’s missing touch, path step-back, Undo, and leave-demo declarations are resolved. All four tagged commands pass locally and live.
- Verification 2’s missing sound-feedback and saved-data deletion declarations are resolved. Both tagged commands pass locally and live.
- Verification 2’s footer touch-target issue is resolved. Every footer link now measures at least 44 × 44 CSS px.
- No earlier minor finding remains open.

## Evidence

- `/work/.evidence/relay-logic-verify-3/npm-test.txt`
- `/work/.evidence/relay-logic-verify-3/npm-build.txt`
- `/work/.evidence/relay-logic-verify-3/claim-commands.txt`
- `/work/.evidence/relay-logic-verify-3/live-e2e.txt`
- `/work/.evidence/relay-logic-verify-3/entry-inspection.json`
- `/work/.evidence/relay-logic-verify-3/runtime-inspection.json`
- `/work/.evidence/relay-logic-verify-3/manual-unclaimed-behaviors.json`
- `/work/.evidence/relay-logic-verify-3/manual-reset-demo.json`
- `/work/.evidence/relay-logic-verify-3/route-metadata.json`
- `/work/.evidence/relay-logic-verify-3/url-headers.txt`
- `/work/.evidence/relay-logic-verify-3/live-candidate-comparison.json`
- `/work/.evidence/relay-logic-verify-3/lighthouse.json`
- `/work/.evidence/relay-logic-verify-3/desktop-home.png`
- `/work/.evidence/relay-logic-verify-3/phone-home.png`
- `/work/.evidence/relay-logic-verify-3/solved-end.png`
- `/work/.evidence/relay-logic-verify-3/daily-solved-end.png`
- `/work/.evidence/relay-logic-verify-3/loss-end.png`

## Result counts

- Findings: 2
- Untested public claims: 7
- Verdict: FAIL
