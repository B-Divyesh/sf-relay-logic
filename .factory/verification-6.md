# Route colored signals through a daily circuit — verification 6

## Verdict

**PASS** — zero findings and zero untested public claims.

## Reviewed version

- Live URL: https://relay-logic.sociobot.in
- Implementation candidate: `727e7d6ceb8c69e2b7024eac76ef10c0d4442fd8` (`Fix demo banner focus contrast`)
- Documentation baseline reviewed: `036caf134d8469d28ac9b77760a40c592e2514a7`
- Live footer build label: `803b5efb`

Changes after `727e7d6` are verification, review, handoff, and Graphify records only. They do not change product source, public assets, dependencies, or host configuration. A clean production build with `VITE_BUILD_SHA=803b5efb` produced the same live asset names. Local and live files were byte-identical:

- JavaScript: `4c315dfc72fe9bd8e3c4c3cd11080517e10cc4eb66e05d33cc77b05e67c2adbf`
- CSS: `4506fa6cbe662a4426c3d0e1ac1260601e425d9f08e15e608f5b288e60947cb8`

The released implementation was preserved. No product code was changed.

## Public browser support and worker limits

The public README calls Relay Logic a browser game and documents pointer, touch, and keyboard input. It does not name minimum browser versions or promise support for a specific engine. This qualification tested the latest Playwright 1.58.2 engines available on the worker:

| Engine | Exact version | Live result |
| --- | --- | --- |
| Chromium | `145.0.7632.6` | All 29 shipped browser tests passed. Daily win and phone loss runs passed. |
| Firefox | `146.0.1` | 28 shipped tests passed. The Pixel 7 test could not start because Playwright Firefox rejects `isMobile`; the same 390 × 844 touch path passed with Firefox-supported `hasTouch`. Daily win and phone loss runs passed. |
| WebKit | `26.0` (`Version/26.0 Safari/605.1.15`) | 28 shipped tests passed. The multi-board test exceeded its Chromium-sized 30-second timeout; the unchanged test passed with a 120-second limit. Daily win and phone loss runs passed. |

These are worker constraints, not product defects:

- Firefox automation has no `isMobile` emulation option. A fresh 390 × 844 Firefox context with touch enabled placed a relay, restored its save, reached loss, and restarted.
- The worker has no audio output device. Chromium and WebKit reported a running native `AudioContext`. Firefox received a trusted gesture and scheduled the native oscillator, but its context stayed suspended in both headless and Xvfb-headed runs. The declared recorded-fixture sound test passed in all three engines and proved sound-on versus sound-off behavior.
- Linux WebKit uses software rendering. Its high-DPI device profiles produced non-representative frame cadence. A plain WebKit context measured the live page at 61.5 FPS; the high-DPI phone profile measured 53.5–56.7 FPS. No public frame-rate promise exists.

No public browser claim was left untested.

## First screen

Fresh desktop and 390 × 844 phone contexts in all three engines opened at scroll position zero with empty storage.

- Job: “Route colored signals through a circuit.”
- Audience: solo puzzle players who want one fresh board without a long rule sheet.
- First action: **Try it with sample data**. The adjacent text says three short boards teach the rule.
- Facts: free to play, no account or ads, and progress stays in this browser.

The playable board began inside every first viewport. The phone view had no horizontal overflow at normal text size. Screenshots for all six engine/viewport combinations are in `/work/.evidence/relay-logic-verify-6/`.

## Demo and complete game runs

The first action entered `/demo` in one click. The populated 4 × 4 board, “Sample board 1 of 3”, and “Demo — sample data, nothing is saved” were immediately visible. The shipped complete-run check solved all three samples, displayed each solved screen, retained the demo label, and opened the daily board in Chromium, Firefox, and WebKit.

A separate recorded run in each engine played the live daily board for `2026-09-06`, seed `4033961918`, through its actual ending. Each run connected five signal pairs, filled all 36 sockets in 31 moves, and showed “Every signal is connected”. **Play this board again** retained the seed and reset relays and timer.

Each engine also ran a recorded 390 × 844 touch session. It started native audio after a user gesture, placed a relay, restored the path, timer, and sound setting after reload, used three failed tests to show “This run ended”, and restarted the same seed with no relays or spent fuses.

The broader live suites also passed pointer input, Tab, Space, arrows, Enter, invalid placement followed by valid recovery, arrow-key boundary behavior, Undo, path step-back, hint, reset confirmation, demo reset, demo exit, sound on/off, route focus, dialog focus, and local-storage isolation. Corrupt saved JSON recovered to Sample board 1 in every engine. Forced storage-write failure still allowed a valid relay and displayed the recovery message.

Reset demo removed both demo keys, restored Sample board 1, and preserved seeded real progress and settings. Start for real removed demo data without copying it. No real data was changed by the sample runs.

## Claims and clean checkout

A detached clean worktree at `036caf1` used the documented prerequisites:

- Node.js `22.23.2`
- npm `10.9.8`
- `npm ci`: 60 packages, 0 vulnerabilities
- `npm test`: 8 unit tests and 29 Chromium browser tests passed
- `npm run build`: passed and created `dist/`
- JavaScript: 25,701 bytes raw / 9.15 KB gzip
- CSS: 13,478 bytes raw / 4.05 KB gzip

Every exact command in `.factory/claims.json` was then run separately. All 22 passed. Every ID occurs exactly once in the shipped test titles:

`daily-seed`, `fresh-daily`, `complete-run`, `free-no-account`, `ad-free`, `loss-end`, `invalid-recovery`, `rule-hint`, `reset-scope`, `local-save`, `move-sound`, `demo-isolation`, `privacy-local`, `keyboard-play`, `signal-redundancy`, `count-up-timer`, `demo-banner`, `touch-play`, `step-back`, `undo-action`, `leave-demo`, and `clear-saved-data`.

The live page, README, demo documentation, Privacy page, and Terms page were cross-checked against the manifest. The 3–8 minute round length is explicitly an intended session shape, not a measured completion promise. There is no missing or incomplete public claim.

## Accessibility, privacy, routes, and performance

- Playwright Axe found no serious or critical issue on `/`, `/demo`, `/privacy`, `/terms`, or the designed missing-page route in Chromium, Firefox, or WebKit.
- `verify-url.sh` passed `/` and `/demo`: correct titles, `lang=en`, one h1, one main landmark, image-alt and button-label checks, and no load console error.
- Keyboard play, visible focus, dialog focus, route focus, 44 px phone targets, touch, and reduced motion passed. The repaired demo-banner focus ring remains 3 px ivory on charcoal and above 3:1.
- A doubled-text diagnostic retained all headings, board content, controls, and actions. At a 640 px test viewport it introduced no horizontal overflow.
- Demo actions and complete runs sent no action request, made no third-party runtime request, and set no cookie. The Privacy control removed real and demo progress and settings.
- `/`, `/demo`, `/privacy`, `/terms`, `robots.txt`, `sitemap.xml`, all declared images, and hashed JS/CSS returned 200. The Param Factory external link returned 200.
- `/not-a-page` deliberately returned HTTP 404 and rendered “This page is not connected” with a return action. This expected 404 is not a defect.
- Live headers include CSP with `frame-ancestors 'none'`, HSTS, Referrer-Policy, X-Content-Type-Options, and Permissions-Policy. Hashed assets use one-year immutable caching.
- Lighthouse mobile: 98 performance, 100 accessibility, 100 best practices, and 100 SEO. LCP was 1,049 ms, CLS was 0, total blocking time was 162 ms, and transferred bytes were 15,392.
- Chromium measured 59.5 FPS on desktop and phone. Firefox measured 59.0 FPS desktop and 60.0 FPS phone. WebKit software-emulation limits are recorded above and are not a product performance result.

Offline play and update behavior are not promised, and no service worker exists. The product has no backend, accounts, payment, analytics, multiplayer, leaderboard, AI feature, or shared database. Tenant isolation, restart persistence, health, 429/Retry-After, and independent multiplayer-client checks do not apply.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Initial asset requests were caught by the 404 rule | Resolved. Live JS, CSS, images, and metadata assets return 200; hashed assets use immutable caching and match the clean build byte for byte. |
| Verification 1 lacked touch, path step-back, Undo, and leave-demo claim checks | Resolved. Each has one manifest entry and one passing outcome test. Touch also passed in all three live engines. |
| Verification 2 lacked sound and saved-data deletion checks | Resolved. Both exact claim commands passed, and the live privacy deletion path passed across engines. |
| Verification 2 footer targets were below 44 px | Resolved. The phone target test passed in all three engines. |
| Verification 3 had four missing and three incomplete claim checks | Resolved. All 22 claims have exactly one complete tagged test, and every exact command passed. |
| Verification 4 found a 2.22:1 demo-banner focus outline | Resolved. The 3 px ivory ring test passed on desktop and phone in all three engines. |
| Verification 5 and reviews 1–3 reported no open finding | Confirmed. This broader engine run found no regression. |

No earlier finding remains open.

## Evidence

- `/work/.evidence/relay-logic-verify-6/chromium-daily-win.png`
- `/work/.evidence/relay-logic-verify-6/firefox-daily-win.png`
- `/work/.evidence/relay-logic-verify-6/webkit-daily-win.png`
- `/work/.evidence/relay-logic-verify-6/chromium-phone-loss.png`
- `/work/.evidence/relay-logic-verify-6/firefox-phone-loss.png`
- `/work/.evidence/relay-logic-verify-6/webkit-phone-loss.png`
- `/work/.evidence/relay-logic-verify-6/*-first-screen-desktop.png`
- `/work/.evidence/relay-logic-verify-6/*-first-screen-phone.png`
- `/work/.evidence/relay-logic-verify-6/manual-results/*/video.webm`
- `/work/.evidence/relay-logic-verify-6/manual-results/*/trace.zip`
- `/work/.evidence/relay-logic-verify-6/verify-home/verify.json`
- `/work/.evidence/relay-logic-verify-6/verify-demo/verify.json`
- `/work/.evidence/relay-logic-verify-6/lighthouse.json`

## Result counts

- Findings: **0**
- Untested public claims: **0**
- Verdict: **PASS**
