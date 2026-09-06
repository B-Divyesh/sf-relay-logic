# Relay Logic handoff

## Release

- Public URL: https://relay-logic.sociobot.in
- Demo URL: https://relay-logic.sociobot.in/demo
- Product type: static Vite and TypeScript browser game
- Deployed implementation SHA: `727e7d6ceb8c69e2b7024eac76ef10c0d4442fd8`
- Documentation baseline before review 1: `9d4daa2db10252e17f8b129e1a48a736d4629fd2`
- Previous runtime behavior source ancestor: `2baa0eab3319529988826a02a402e67fc2b8a428`
- Deployment: existing Azure Static Web App `sf-relay-logic`, Central US, production environment
- Deployed: 2026-09-05 UTC

At the repair deployment, the page reported build `727e7d6c` and referenced `index-Dz1qeejK.js` with `index-BuJPnqMq.css`. This repair was a scoped style and browser-test change; it did not alter puzzle generation, storage, or game rules. Review 1 records the later report-only live build label below.

## Independent review 3 — PASS

Review 3 inspected implementation `727e7d6ceb8c69e2b7024eac76ef10c0d4442fd8` from documentation checkout `de6a5787967175c90f4714e2f031e98f17f63f7d`. Later commits change only review, verification, handoff, and Graphify files. Live JavaScript and CSS are byte-identical to a clean build using footer label `803b5efb`.

The result is **PASS** with zero findings and zero untested public claims. A separate clean clone passed `npm ci`, 8 unit tests, 29 browser tests, `npm run build`, and all 22 claim commands individually. The full 29-test browser suite also passed against live HTTPS.

Fresh 1440 × 1000 and 412 × 839 browsers showed the job, audience, sample action, facts, and playable board before scrolling. The one-click demo showed a populated sample and persistent label. Reset from Sample board 2 deleted both demo keys and preserved seeded real data. A recorded desktop run solved all three samples and the live daily board for `2026-09-06`, seed `4033961918`, in 31 moves. A separate recorded phone run reached the loss screen and same-seed restart.

Live keyboard, touch, focus, reduced-motion, 200% text, lifecycle pause, corrupt and blocked storage recovery, privacy, legal-page, link, and designed-404 checks passed. Recorded 120-frame samples measured 60.0 FPS on desktop and phone. Fresh Lighthouse scores were 100 in performance, accessibility, best practices, and SEO; LCP was 931 ms, CLS was 0, and total blocking time was 13 ms.

The full report is `.factory/review-3.md`. Evidence is under `/work/.evidence/relay-logic-review-3/`.

## Independent review 2 — PASS

Review 2 inspected implementation `727e7d6ceb8c69e2b7024eac76ef10c0d4442fd8` from documentation checkout `637fc7228c5801766310b76ff995a65ecc11bb96`. Later commits change only review, verification, handoff, and Graphify files. Live CSS is byte-identical to the clean build; live JavaScript is identical after normalizing the footer build label and source-map filename.

The result is **PASS** with zero findings and zero untested public claims. A clean detached checkout passed `npm ci`, 8 unit tests, 29 browser tests, `npm run build`, and every one of the 22 claim commands separately. The full 29-test browser suite also passed against the live HTTPS site.

Fresh 1440 × 1000 and 390 × 844 browsers showed the job, audience, first action, facts, and playable board before scrolling. The one-click demo showed its complete sample board and persistent label. Reset removed both demo keys without changing seeded real data. The daily board for `2026-09-06` used seed `4033961918`, had one solver result, filled all 36 sockets in 31 moves, and reached the win screen. Daily replay retained the seed and reset the run. A phone run reached the loss screen and same-seed restart.

Live keyboard, touch, focus, reduced-motion, 200% text, corrupt and blocked storage recovery, privacy, legal-page, link, and designed-404 checks passed. Recorded 120-frame samples measured 60.0 FPS on desktop and phone. Fresh Lighthouse scores were 100 in performance, accessibility, best practices, and SEO; LCP was 914 ms, CLS 0, and total blocking time 14 ms.

The full report is `.factory/review-2.md`. Evidence is under `/work/.evidence/relay-logic-review-2/`.

## Independent review 1 — PASS

Review 1 inspected implementation `727e7d6ceb8c69e2b7024eac76ef10c0d4442fd8` from clean checkout `d990735a6dc5e28f0035c14c6f807455fa6295da`. Changes after the implementation are reporting and Graphify output only. The live footer label is `803b5efb`; live CSS is byte-identical to the clean build, and live JavaScript is identical after normalizing only the build label and source-map filename.

The result is **PASS** with zero findings and zero untested public claims. A clean worktree passed `npm ci`, 8 unit tests, 29 browser tests, `npm run build`, and all 22 claim commands separately. The same 29 browser tests passed against live HTTPS.

Fresh desktop and 390 px phone browsers showed the job, audience, sample action, facts, and playable board before scrolling. The one-click sample showed populated play and a persistent demo label. Reset deleted both demo keys while preserving seeded real data. The current daily board (`2026-09-06 · 4033961918`) reached its actual 36-socket win screen in 31 moves. A phone run reached the loss screen and same-seed restart.

Live route, recovery, privacy, keyboard, touch, focus, reduced-motion, 200% text, and designed-404 checks passed. Actual keyboard focus on both demo-banner actions measured 3 px and 15.25:1. A 120-frame sample measured 60.0 FPS. Fresh Lighthouse scores were 100 in performance, accessibility, best practices, and SEO; LCP was 1.0 s, CLS 0, and total blocking time 50 ms.

The full report is `.factory/review-1.md`. Evidence is under `/work/.evidence/relay-logic-review-1/`.

## Verification 4 finding — resolved

Independent verification 4 originally failed on one minor issue: the blue keyboard focus outline on **Reset demo** and **Start for real** measured `2.22:1` against the dark demo banner. The game and all 22 declared claims already passed, with zero untested public claims.

Repair 4 scopes the existing 3 px ring to the dark banner and uses the ivory faceplate color there. On the live 390 px phone view, both actions now render `rgb(255, 250, 240)` against `rgb(32, 35, 33)`, a `15.25:1` contrast ratio. The new outcome test focuses both actions at 1440 px and 390 px, reads their rendered styles, and calculates the ratio; it does not assert stylesheet text.

The historical report remains in `.factory/verification-4.md`. Its finding is closed by deployed implementation `727e7d6`; all earlier verification findings are also closed.

## Verification 5 — PASS

Independent verification 5 reviewed implementation `727e7d6ceb8c69e2b7024eac76ef10c0d4442fd8` against the live HTTPS page. The later documentation record is `57616d08daaa2b291343af5e36d93d3a8163afe6`; the checked checkout and live build label are `803b5efb`. The difference after the implementation is handoff/Graphify reporting, not product code.

The result is **PASS** with zero findings and zero untested claims. A fresh clone passed `npm ci`, 8 unit tests, 29 browser tests, `npm run build`, and all 22 claim commands one at a time. The complete 29-test suite also passed against the live URL. Axe checks found no serious or critical issues on all application routes; `verify-url.sh` passed `/` and `/demo` with no console errors.

Fresh desktop and phone live views showed the job, the solo-puzzle audience, **Try it with sample data**, the three facts, and the playable board before scrolling. The one-click demo showed a populated sample, retained its persistent label, and Reset demo left seeded real keys unchanged. The current UTC daily run (`2026-09-06`, seed `4033961918`) filled all 36 sockets in 31 moves and showed “Every signal is connected”. A separate phone run reached “This run ended” and same-seed restart reset its relays and fuses. The repaired demo-banner controls rendered a 3 px ivory ring at `15.25:1` contrast at 1440 px and 390 px.

Evidence and the full report are in `.factory/verification-5.md` and `/work/.evidence/relay-logic-verify-5/`. The factory result copy is `/work/.evidence/qa-report.md` and `/work/.evidence/qa-result.json`.

## Repair 3

Independent verification 3 found seven public promises without complete outcome coverage. All are now covered:

- `ad-free` completes the sample sequence while rejecting ad surfaces, embedded frames, account/payment controls, and cross-origin requests.
- `signal-redundancy` checks all five daily signals for distinct rendered colors plus visible letters and shapes on both endpoints and the legend.
- `count-up-timer` observes the timer start at zero, increase, and leave the board playable.
- `demo-banner` keeps the demo label visible through all three sample boards and the daily-board handoff.
- `keyboard-play` now reaches the board with real Tab presses, selects and places with Space, moves with arrows, places with Enter, and retains the boundary check.
- `demo-isolation` now reaches sample board 2 with both demo keys populated, resets to sample board 1, deletes both demo keys, and preserves existing real progress and settings.
- `local-save` now reaches sample board 2, advances the timer, places a relay, enables sound, reloads, and verifies the path, learn step, elapsed time, and setting in the rendered game.

The privacy regression was also tightened. It now allows the same-origin static files to load, then proves game actions issue no requests and create no cookies.

`.factory/claims.json` contains 22 unique IDs. Each ID occurs exactly once in a test title. These are outcome checks, not assertions that implementation text exists.

## Product state

- The playable circuit board remains on the first screen on desktop and phone.
- Three 4 × 4 sample boards lead into a 6 × 6 daily board.
- The shown UTC date creates a stable, solver-checked daily puzzle with one solution.
- Pointer, touch, Tab, arrows, Enter, and Space work.
- Invalid moves leave paths unchanged. Undo, path step-back, reset, sound, reload recovery, win, loss, and same-seed restart work.
- `/demo` uses only `demo:relay-logic:*` keys. Reset and Start for real do not alter real keys.
- `/privacy`, `/terms`, and the designed HTTP 404 remain available.
- There is no backend, account, payment, analytics, advertising, multiplayer, or AI integration.

The original enamel switchboard visual system in `.factory/design.md` is unchanged. Artwork remains code-native SVG and CSS with no third-party assets, fonts, scripts, or runtime services. The existing copy audit remains current because no public product copy changed.

## Clean verification

A detached clean worktree at the deployed SHA used the documented Node 22 and npm setup:

```sh
npm ci
npm test
npm run build
```

Results:

- `npm ci`: 60 packages, 0 audit vulnerabilities.
- Unit tests: 8 passed, including every 2026 daily seed and all learn boards.
- Browser tests: 29 passed in Chromium 1.58.2.
- Claims: all 22 commands in `.factory/claims.json` passed individually.
- Build: `dist/` produced successfully.
- JavaScript: 25.70 KB raw, 9.15 KB gzip.
- CSS: 13.48 KB raw, 4.05 KB gzip.

## Live verification

- The full 29-test browser suite passed against the HTTPS origin.
- Axe found no serious or critical issues on `/`, `/demo`, `/privacy`, `/terms`, or the designed 404.
- `verify-url.sh` passed `/` and `/demo` with correct titles, `lang=en`, one h1, one main landmark, labeled controls, and no console errors.
- Fresh 1440 × 1000 desktop and 412 × 839 phone contexts showed the job, solo-puzzle audience, sample action, three facts, and board before scrolling. The board began at 253 px and 575 px respectively.
- Each fresh context opened the sample in one click, placed a relay, kept “Demo — sample data, nothing is saved” and “Sample board 1 of 3” visible, then reset both demo keys without changing seeded real keys.
- The shipped suite completed all three sample boards, reached the loss screen, and restarted the same seed. A direct post-deploy daily run for `2026-09-05` solved all five signals across 36 sockets in 31 moves and showed “Every signal is connected”.
- The shipped suite covers normal, invalid, boundary, and reset paths. Recorded live checks also cover corrupt and blocked storage recovery.
- Keyboard focus, dialog focus, route focus, 44 px phone targets, 200% text, reduced motion, touch input, and phone overflow checks pass. The two dark-banner actions have a 3 px, `15.25:1` focus ring on phone and desktop.
- `/`, `/demo`, `/privacy`, `/terms`, `robots.txt`, and `sitemap.xml` return 200. An unknown route deliberately returns HTTP 404 with a designed route home.
- Security headers include CSP with `frame-ancestors 'none'`, Referrer-Policy, and X-Content-Type-Options. The hashed JavaScript returns one-year immutable caching.
- Lighthouse mobile: 99 performance, 100 accessibility, 100 best practices, 100 SEO. LCP 1,059 ms, CLS 0, total blocking time 137 ms, transfer size 15,427 bytes.
- A 120-frame post-deploy sample measured 59.5 fps on desktop and 60.0 fps on a 390 px phone context; the target is 60 fps.

Evidence is in `/work/.evidence/relay-logic-repair-4/`. The verb-first, 69-character catalog description is copied to `/work/.evidence/catalog-description.txt`.

## Earlier findings

- Initial static assets blocked by the 404 rule: resolved. The live hashed assets return 200; JavaScript has immutable caching and matches the deployed clean build byte for byte.
- Verification 1 missing touch, path step-back, Undo, and leave-demo claims: resolved; all four dedicated commands pass locally and live.
- Verification 2 missing sound and saved-data deletion claims: resolved; both dedicated commands pass locally and live.
- Verification 2 footer targets below 44 px: resolved; live phone measurements are 56.1 × 44, 46.4 × 44, and 166.2 × 44 CSS px.
- Verification 3’s four absent and three incomplete claims: resolved by the seven outcomes listed above.
- Verification 4’s `2.22:1` demo-banner focus outline: resolved by the scoped ivory focus ring and its rendered-contrast regression check.

## Known limits

- The 3–8 minute round length is a design target, not a measured human-study result.
- The brief’s 75% learn completion and 30% daily attempt goals are not measured because the game has no analytics.
- Offline play is not promised. A connection is required for the initial static load.
- Accounts, multiplayer, leaderboards, a puzzle editor, and paid features remain outside the researched scope.
