# Route colored signals through a circuit — verification 5

## Verdict

**PASS** — zero findings and zero untested public claims.

## Reviewed version

- Live URL: https://relay-logic.sociobot.in
- Implementation candidate: `727e7d6ceb8c69e2b7024eac76ef10c0d4442fd8` (`Fix demo banner focus contrast`)
- Documentation record before this verification: `57616d08daaa2b291343af5e36d93d3a8163afe6`
- Checked checkout and live build label: `803b5efb86ccfc193e752fcd376e9b94af895951`

`727e7d6..803b5ef` changes only the handoff record and Graphify files. The live JavaScript asset `index-CINFML7m.js` is byte-identical to the clean build. The live footer identifies build `803b5efb`; this is a documentation/build-label difference, not a product-code change from the reviewed implementation.

## First screen

- Job: “Route colored signals through a circuit.”
- Audience: solo puzzle players who want one fresh board without reading a long rule sheet.
- First action: **Try it with sample data**. It opens Sample board 1 of 3 and explains that three short boards teach the rule.

Fresh live desktop (1440 × 1000) and phone (412 × 839) pages showed this text, the three facts, and the playable board before scrolling. The board started at y=253.1 px on desktop and y=575.3 px on phone. Evidence: `first-screen-desktop.png` and `first-screen-phone.png`.

## Demo and game run

The home action entered the demo in one click. The populated demo showed the board, an active source, “Sample board 1 of 3”, and the persistent “Demo — sample data, nothing is saved” label. Reset demo removed both demo keys and left pre-seeded real progress and sound settings unchanged. Start for real then returned to `/`.

I played the current UTC daily board (`daily-2026-09-06`, seed `4033961918`) from entry through its end screen. It connected five signal pairs across 36 sockets in 31 moves and showed “Every signal is connected”. Evidence: `daily-win-current-desktop.png`.

I also used all three board tests to reach “This run ended” on the phone demo. **Try the same board** restored the same seed (`3403825992`), zero relays, and no spent fuses. Evidence: `loss-end-phone.png`.

The live scripted checks covered valid play, an invalid disconnected placement followed by a valid relay, an arrow-key boundary, Undo, path step-back, reset, reload recovery, malformed saved-data recovery, touch, keyboard, sound, and storage isolation. A 120-frame live desktop sample measured 60.0 FPS. The game has no backend, multiplayer, service worker, offline, or update promise, so tenant, persistence, rate-limit, offline, and update checks do not apply.

## Claims and clean checkout

A fresh clone at `803b5ef` used the documented Node 22 and npm setup.

```sh
npm ci
npm test
npm run build
```

`npm ci` completed with 0 vulnerabilities. `npm test` passed 8 unit tests and 29 Chromium browser tests. `npm run build` produced `dist/`. The JavaScript bundle is 25,701 bytes raw / 9,116 bytes gzip; CSS is 13,478 bytes raw / 4,043 bytes gzip.

Every one of the 22 exact commands in `.factory/claims.json` passed separately from the clean checkout. Each manifest ID occurs exactly once in the shipped test titles: `daily-seed`, `fresh-daily`, `complete-run`, `free-no-account`, `ad-free`, `loss-end`, `invalid-recovery`, `rule-hint`, `reset-scope`, `local-save`, `move-sound`, `demo-isolation`, `privacy-local`, `keyboard-play`, `signal-redundancy`, `count-up-timer`, `demo-banner`, `touch-play`, `step-back`, `undo-action`, `leave-demo`, and `clear-saved-data`.

The landing page, demo, README, privacy page, and terms page were cross-checked against that manifest. The 3–8 minute text is explicitly a design target, not a measured public promise. No unlisted public behavior claim was found.

## Accessibility, privacy, routes, and live checks

- The full 29-test Playwright suite passed against the live HTTPS origin.
- The included Playwright Axe checks found no serious or critical issues on `/`, `/demo`, `/privacy`, `/terms`, and the designed missing-page route.
- `verify-url.sh` passed `/` and `/demo`: 200 response, title, `lang=en`, one h1, one main landmark, image-alt and unlabeled-button checks, and no console errors. The desktop/phone captures and JSON are in `home/` and `demo/` evidence folders.
- Keyboard, dialog, route focus, 44 px phone targets, text at 200%, touch, and reduced-motion behavior passed in the live suite.
- On desktop and 390 px phone, **Reset demo** and **Start for real** each have an ivory solid 3 px focus ring on the dark banner. Measured contrast is 15.25:1.
- Demo actions made no action requests and set no cookies. No tracking, account, payment, advertising, or third-party runtime request was present.
- `/`, `/demo`, `/privacy`, `/terms`, `robots.txt`, and `sitemap.xml` returned 200. `/not-a-page` deliberately returned HTTP 404 and rendered the styled return path; this is expected behavior.
- Routes set their own titles and canonical URLs. The live headers include CSP with `frame-ancestors 'none'`, HSTS, Referrer-Policy, X-Content-Type-Options, and Permissions-Policy. Hashed assets return one-year immutable caching.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Initial asset requests were caught by the 404 rule | Resolved: the live hashed JS and CSS return 200 with immutable caching; JS matches the clean build byte for byte. |
| Verification 1 lacked touch, path step-back, Undo, and leave-demo claim checks | Resolved: each is now a manifest entry with one outcome test, and its individual command passed. |
| Verification 2 lacked sound and saved-data deletion checks; footer targets were too small | Resolved: both claims passed individually; live phone accessibility checks pass the 44 px targets. |
| Verification 3 had four missing and three incomplete claim checks | Resolved: all 22 manifest commands passed and the exact-tag audit found one test tag per ID. |
| Verification 4 found a 2.22:1 demo-banner focus outline | Resolved: live rendered ring is 3 px and 15.25:1 for both banner actions at desktop and phone widths. |

## Evidence

- `/work/.evidence/relay-logic-verify-5/first-screen-desktop.png`
- `/work/.evidence/relay-logic-verify-5/first-screen-phone.png`
- `/work/.evidence/relay-logic-verify-5/demo-populated-desktop.png`
- `/work/.evidence/relay-logic-verify-5/daily-win-current-desktop.png`
- `/work/.evidence/relay-logic-verify-5/loss-end-phone.png`
- `/work/.evidence/relay-logic-verify-5/home/verify.json`
- `/work/.evidence/relay-logic-verify-5/demo/verify.json`
