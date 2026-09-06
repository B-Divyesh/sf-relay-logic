# Route colored signals through a daily circuit — review 3

## Verdict

**PASS — zero findings and zero untested public claims.**

## Reviewed release

- Live URL: https://relay-logic.sociobot.in
- Implementation candidate: `727e7d6ceb8c69e2b7024eac76ef10c0d4442fd8` (`Fix demo banner focus contrast`)
- Documentation checkout reviewed: `de6a5787967175c90f4714e2f031e98f17f63f7d`
- Live footer build label: `803b5efb`

The changes after `727e7d6` affect only review, verification, handoff, and Graphify files. Product source, tests, public assets, package files, and host configuration are unchanged. A clean build using the live label produced JavaScript and CSS byte-identical to the live assets. The live JavaScript SHA-256 is `4c315dfc72fe9bd8e3c4c3cd11080517e10cc4eb66e05d33cc77b05e67c2adbf`; the CSS SHA-256 is `4506fa6cbe662a4426c3d0e1ac1260601e425d9f08e15e608f5b288e60947cb8`. The live runtime therefore matches implementation candidate `727e7d6`.

Three pre-existing modified files under `graphify-out/` were not changed by this review.

## First screen before scrolling

Fresh browsers opened at scroll position zero with empty storage.

- Job: **Route colored signals through a circuit.**
- Audience: solo puzzle players who want one fresh board without reading a long rule sheet.
- First action: **Try it with sample data**. The adjacent line says three short boards teach the rule.
- Facts: free to play, no account or ads, and progress stays in this browser.

At 1440 × 1000, the board began at 253.1 px and was fully visible. At 412 × 839, it began at 575.3 px and showed playable sockets before scrolling. Both layouts had zero horizontal overflow. The game itself, not a menu wall, was on the first screen.

## Demo and complete game runs

The home action opened `/demo` in one click. The first sample showed a populated 4 × 4 board with 16 sockets, three labeled source and receiver pairs, etched channels, controls, and **Sample board 1 of 3**. The **Demo — sample data, nothing is saved** label remained visible through every sample and the daily handoff.

Demo isolation passed with distinct real progress and sound values preloaded. After reaching Sample board 2 with both demo keys populated, **Reset demo** deleted both demo keys, restored Sample board 1, and preserved both real values exactly. **Start for real** also passed in the live suite and deleted demo data without copying it into real data.

The recorded desktop run solved Sample boards 1, 2, and 3. Each filled all 16 sockets in 13 moves and displayed **Every signal is connected**. It then solved the live daily board for `2026-09-06`, seed `4033961918`. The solver found exactly one solution. The run filled all 36 sockets in 31 moves and displayed the win screen. **Play this board again** retained the seed and reset relays, fuses, and timer.

A fresh recorded phone run placed a relay with touch, reset an active board through its confirmation dialog, failed three board tests, and displayed **This run ended**. **Try the same board** retained seed `3403825992` and restored an empty board with all three fuses.

Normal, invalid, boundary, and recovery paths passed. These included pointer and touch input, Tab, Space, arrows, Enter, a left-edge arrow boundary, an invalid disconnected placement followed by a valid relay, Undo, path step-back, rule hint, sound on and off, reload persistence, corrupt saved JSON, blocked storage writes, reset confirmation, same-seed restart, and browser history. Blocked writes did not stop play and showed the storage recovery message.

## Clean checkout and public claims

A separate clean clone at `de6a578` used Node `22.23.2`, npm `10.9.8`, and the documented setup.

```sh
npm ci
npm test
npm run build
```

- `npm ci`: 60 packages installed and zero audit vulnerabilities.
- Unit tests: 8 passed. They solver-check every 2026 daily date and all learn boards.
- Browser tests: 29 passed.
- Build: passed and produced `dist/`.
- JavaScript: 25.70 KB raw, 9.15 KB gzip.
- CSS: 13.48 KB raw, 4.05 KB gzip.

All 22 commands in `.factory/claims.json` were then run separately from the clean clone. Every command passed. The manifest has 22 unique IDs, and each ID appears exactly once in a shipped test title:

`daily-seed`, `fresh-daily`, `complete-run`, `free-no-account`, `ad-free`, `loss-end`, `invalid-recovery`, `rule-hint`, `reset-scope`, `local-save`, `move-sound`, `demo-isolation`, `privacy-local`, `keyboard-play`, `signal-redundancy`, `count-up-timer`, `demo-banner`, `touch-play`, `step-back`, `undo-action`, `leave-demo`, and `clear-saved-data`.

The live landing page, demo, privacy page, terms page, README, demo documentation, copy audit, and asset provenance were cross-checked. No public promise lacks a claim entry or complete outcome test. The stated 3–8 minute round length is identified as an intended session length, not a measured completion claim.

## Accessibility, privacy, routes, and performance

- The complete 29-test browser suite passed against live HTTPS.
- Playwright Axe found no serious or critical issue on `/`, `/demo`, `/privacy`, `/terms`, or the missing-page route.
- `verify-url.sh` passed `/` and `/demo`: HTTPS 200, correct titles, `lang=en`, one h1, one main landmark, labeled controls, alt checks, and no console errors.
- Every application route has a distinct title, one h1, one main landmark, ordered headings, and a matching canonical URL.
- The skip link is the first focus target and becomes visible. Keyboard focus reaches the board and controls. Reset and end dialogs focus their primary actions. Back navigation restores the route and h1 focus.
- The repaired demo-banner actions still render a 3 px ivory focus ring with 15.25:1 contrast on desktop and phone.
- At 390 px, every visible interactive target across all four application routes measured at least 46.39 × 44 CSS px. At 200% text size, the h1, action, and board remained present with no horizontal overflow.
- Reduced motion changed the socket transition to effectively zero. A 1.3-second frozen lifecycle did not catch the timer up by the hidden duration; normal counting resumed afterward. There is no flashing or looping decoration.
- Demo actions made no requests, set no cookies, and contacted no other origin. The Privacy control deleted all four real and demo storage keys.
- `/`, `/demo`, `/privacy`, `/terms`, `robots.txt`, `sitemap.xml`, favicon, touch icon, and social image returned 200. Internal links returned 200.
- `/review-3-missing-page` deliberately returned HTTP 404 and displayed the designed heading and return action. This expected 404 is not a defect.
- Live headers include CSP with `frame-ancestors 'none'`, HSTS, Referrer-Policy, X-Content-Type-Options, and Permissions-Policy. The hashed JavaScript has one-year immutable caching.
- Fresh 120-frame samples measured 60.0 FPS on desktop and phone.
- Fresh Lighthouse mobile scores were 100 performance, 100 accessibility, 100 best practices, and 100 SEO. LCP was 931 ms, CLS was 0, total blocking time was 13 ms, and transfer size was 15,428 bytes.

Offline play and update handling are not promised. The live page registers no service worker. There is no backend, account system, payment, multiplayer, installed artifact, or AI feature, so tenant isolation, restart persistence, health, 429/Retry-After, independent multiplayer clients, CLI installation, and AI gateway checks do not apply. The researched puzzle job does not imply a missing AI-assisted step.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Initial asset requests were caught by the 404 rule | Resolved. Live hashed JS and CSS return 200 with immutable caching and are byte-identical to the clean product build using the live label. |
| Verification 1 lacked touch, path step-back, Undo, and leave-demo claim checks | Resolved. Each behavior has one manifest entry and one complete outcome test; every exact command passed. |
| Verification 2 lacked sound and saved-data deletion claim checks | Resolved. Both declared commands passed separately and against live. |
| Verification 2 footer targets were below 44 px | Resolved. Every live phone target now measures at least 44 px in both dimensions. |
| Verification 3 had four missing and three incomplete claim checks | Resolved. All 22 claims have one complete tagged outcome test; every exact command passed. |
| Verification 4 found a 2.22:1 demo-banner focus outline | Resolved. The live ring remains 3 px and 15.25:1 at desktop and phone widths. |

No earlier finding remains open.

## Evidence

- `/work/.evidence/relay-logic-review-3/desktop-complete-run.webm`
- `/work/.evidence/relay-logic-review-3/phone-loss-run.webm`
- `/work/.evidence/relay-logic-review-3/first-screen-desktop.png`
- `/work/.evidence/relay-logic-review-3/first-screen-phone.png`
- `/work/.evidence/relay-logic-review-3/demo-active-desktop.png`
- `/work/.evidence/relay-logic-review-3/daily-win-desktop.png`
- `/work/.evidence/relay-logic-review-3/loss-end-phone.png`
- `/work/.evidence/relay-logic-review-3/designed-404-phone.png`
- `/work/.evidence/relay-logic-review-3/live-review.json`
- `/work/.evidence/relay-logic-review-3/runtime-detail.json`
- `/work/.evidence/relay-logic-review-3/clean-npm-test.txt`
- `/work/.evidence/relay-logic-review-3/clean-build.txt`
- `/work/.evidence/relay-logic-review-3/individual-claims.txt`
- `/work/.evidence/relay-logic-review-3/live-e2e.txt`
- `/work/.evidence/relay-logic-review-3/verify-home/verify.json`
- `/work/.evidence/relay-logic-review-3/verify-demo/verify.json`
- `/work/.evidence/relay-logic-review-3/lighthouse-clean.json`

## Result counts

- Findings: 0
- Untested public claims: 0
- Verdict: **PASS**
