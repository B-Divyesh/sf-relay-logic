# Route colored signals through a daily circuit — review 2

## Verdict

**PASS — zero findings and zero untested public claims.**

## Reviewed release

- Live URL: https://relay-logic.sociobot.in
- Implementation candidate: `727e7d6ceb8c69e2b7024eac76ef10c0d4442fd8` (`Fix demo banner focus contrast`)
- Documentation checkout reviewed: `637fc7228c5801766310b76ff995a65ecc11bb96`
- Live footer build label: `803b5efb`

The changes after `727e7d6` affect only review, verification, handoff, and Graphify files. They do not change product source, tests, public assets, package files, or host configuration. Live CSS is byte-identical to the clean build. Live JavaScript is byte-identical after normalizing the footer build label and generated source-map filename. The live runtime therefore matches implementation candidate `727e7d6`.

The three modified `graphify-out/` files were present before this review and were not changed.

## First screen before scrolling

Fresh desktop and phone browsers opened at scroll position zero with empty storage.

- Job: **Route colored signals through a circuit.**
- Audience: solo puzzle players who want one fresh board without reading a long rule sheet.
- First action: **Try it with sample data**. The next line says three short boards teach the rule.
- Facts: free to play, no account or ads, and progress stays in this browser.

At 1440 × 1000, the board began at 253.1 px and was fully visible. At 390 × 844, the board began at 592.6 px and its playable top section was visible. Both pages had zero horizontal overflow. The game, not a menu, was on the first screen.

## Live game runs

The home action opened `/demo` in one click. The first sample showed a complete 4 × 4 board with 16 sockets, three labeled source and receiver pairs, etched channels, controls, a sample-board label, and the persistent **Demo — sample data, nothing is saved** banner. A pointer move and a separate phone touch move placed a relay and showed immediate feedback.

Before demo entry, I added distinct real progress and sound values. Demo play created only demo state. **Reset demo** deleted both demo keys, restored Sample board 1, and preserved both real values exactly. **Start for real** also deleted demo state without copying it.

The deterministic live suite solved Sample boards 1, 2, and 3, showed a solved end screen for each, kept the demo banner visible, and reached the daily-board handoff. A separate desktop run solved the current daily board, `2026-09-06 · 4033961918`. The solver found exactly one solution. The run filled 36 sockets in 31 moves and showed **Every signal is connected**. **Play this board again** kept the seed and reset relays, fuses, and timer.

A fresh phone run used touch, reset an active board through its confirmation dialog, failed three board tests, and showed **This run ended**. **Try the same board** kept the seed and restored an empty board with all three fuses.

Normal, invalid, boundary, and recovery paths passed. These included pointer and touch input, Tab/Space/arrows/Enter, a left-edge arrow boundary, disconnected placement followed by a valid relay, Undo, path step-back, rule hint, sound on/off, reload persistence, corrupt saved JSON, and blocked storage writes. Blocked writes did not stop play and produced the documented browser-storage message.

## Clean checkout and claims

A detached clean checkout at `637fc722` used Node `22.23.2`, npm `10.9.8`, and the documented setup.

```sh
npm ci
npm test
npm run build
```

- `npm ci`: 60 packages installed and zero audit vulnerabilities.
- Unit tests: 8 passed.
- Browser tests: 29 passed.
- Build: passed and produced `dist/`.
- JavaScript: 25.70 KB raw, 9.15 KB gzip.
- CSS: 13.48 KB raw, 4.05 KB gzip.

All 22 exact commands in `.factory/claims.json` were then run separately from the clean checkout. Every command passed. The manifest contains 22 unique IDs, and each ID appears exactly once in a shipped test title:

`daily-seed`, `fresh-daily`, `complete-run`, `free-no-account`, `ad-free`, `loss-end`, `invalid-recovery`, `rule-hint`, `reset-scope`, `local-save`, `move-sound`, `demo-isolation`, `privacy-local`, `keyboard-play`, `signal-redundancy`, `count-up-timer`, `demo-banner`, `touch-play`, `step-back`, `undo-action`, `leave-demo`, and `clear-saved-data`.

The live landing page, demo, privacy page, terms page, README, demo documentation, and provenance note were cross-checked. No public promise is missing coverage. The 3–8 minute wording is expressly an intended session length, not a measured completion claim. Artwork provenance was also checked directly against the repository: the shipped board, symbols, wordmark, favicon, and social preview are code-native or repository-owned assets.

## Accessibility, privacy, routes, and performance

- The complete 29-test browser suite passed against live HTTPS.
- Playwright Axe found no serious or critical issue on `/`, `/demo`, `/privacy`, `/terms`, or the missing-page route.
- `verify-url.sh` passed `/` and `/demo`: HTTPS 200, correct title, `lang=en`, one h1, one main landmark, image-alt and button-label checks, and no console errors.
- Every application route has a distinct title, one h1, one main landmark, and `lang=en`.
- Keyboard focus reached the board and controls. Reset and end dialogs moved focus to their primary actions. Browser back restored the home route and focused its h1.
- The demo-banner controls retain a 3 px ivory focus ring with 15.25:1 contrast at desktop and phone widths.
- Phone sockets and footer links meet the 44 px target. At 200% text size, the h1, sample action, and board remained available with no horizontal overflow.
- Reduced motion removed the socket transition duration. Signals always repeat color with a visible letter and shape. There is no flashing.
- Demo play made no action request, set no cookie, and contacted no other origin. There is no analytics, tracking, advertising, account, payment, or third-party runtime service.
- `/`, `/demo`, `/privacy`, `/terms`, `robots.txt`, `sitemap.xml`, the favicon, touch icon, social image, and the external Param Factory link returned 200.
- `/review-2-missing-page` deliberately returned HTTP 404 and rendered the designed heading and return action. This is the expected missing-page behavior.
- Live response headers include CSP with `frame-ancestors 'none'`, HSTS, Referrer-Policy, X-Content-Type-Options, and Permissions-Policy. Hashed assets use one-year immutable caching.
- Fresh Lighthouse mobile scores were 100 performance, 100 accessibility, 100 best practices, and 100 SEO. LCP was 914 ms, CLS was 0, total blocking time was 14 ms, and transfer size was 15,416 bytes.
- Recorded 120-frame samples measured 60.0 FPS on desktop and phone.

Offline play and update handling are not promised. The live page registers no service worker. There is no backend, account, payment, multiplayer, or AI feature, so tenant isolation, server restart persistence, health, 429/Retry-After, independent multiplayer clients, and AI gateway checks do not apply. The researched puzzle job does not imply a missing AI-assisted step.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Initial static assets were caught by the 404 rule | Resolved. Live hashed JS and CSS return 200 with immutable caching and match the clean product build after build-label normalization. |
| Verification 1 lacked touch, path step-back, Undo, and leave-demo claim checks | Resolved. Each has a manifest entry and outcome test; every exact command passed. |
| Verification 2 lacked sound and saved-data deletion checks | Resolved. Both declared commands passed separately and against live. |
| Verification 2 footer targets were below 44 px | Resolved. The live phone target test passed for every footer link. |
| Verification 3 had four missing and three incomplete claim checks | Resolved. All 22 claims have one tag and complete observable checks; every command passed. |
| Verification 4 found a 2.22:1 demo-banner focus outline | Resolved. The live ring remains 3 px and 15.25:1 at desktop and phone widths. |

No earlier finding remains open.

## Evidence

- `/work/.evidence/relay-logic-review-2/first-screen-desktop.png`
- `/work/.evidence/relay-logic-review-2/first-screen-phone.png`
- `/work/.evidence/relay-logic-review-2/demo-active-desktop.png`
- `/work/.evidence/relay-logic-review-2/daily-win-desktop.png`
- `/work/.evidence/relay-logic-review-2/loss-end-phone.png`
- `/work/.evidence/relay-logic-review-2/browser-artifacts/` — recorded desktop and phone videos and traces
- `/work/.evidence/relay-logic-review-2/recovery-artifacts/` — corrupt and blocked storage trace
- `/work/.evidence/relay-logic-review-2/clean-npm-test.txt`
- `/work/.evidence/relay-logic-review-2/clean-build.txt`
- `/work/.evidence/relay-logic-review-2/live-e2e.txt`
- `/work/.evidence/relay-logic-review-2/routes.json`
- `/work/.evidence/relay-logic-review-2/verify-home/verify.json`
- `/work/.evidence/relay-logic-review-2/verify-demo/verify.json`
- `/work/.evidence/relay-logic-review-2/lighthouse.json`

## Result counts

- Findings: 0
- Untested public claims: 0
- Verdict: **PASS**
