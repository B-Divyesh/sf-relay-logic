# Route colored signals through a circuit — review 1

## Verdict

**PASS — zero findings and zero untested public claims.**

## Reviewed release

- Live URL: https://relay-logic.sociobot.in
- Implementation candidate: `727e7d6ceb8c69e2b7024eac76ef10c0d4442fd8` (`Fix demo banner focus contrast`)
- Previous documentation report: `9d4daa2db10252e17f8b129e1a48a736d4629fd2`
- Clean checkout reviewed: `d990735a6dc5e28f0035c14c6f807455fa6295da`
- Live footer build label: `803b5efb`

The diff from `727e7d6` to `d990735` contains only the handoff, verification 5, and Graphify output. It contains no product source, public asset, package, or host configuration change. The live CSS is byte-identical to the clean build. The live JavaScript is byte-identical after normalizing only the footer build label and generated source-map filename. The live runtime therefore matches implementation candidate `727e7d6`.

The existing dirty files in `graphify-out/` were present before this review and were left untouched.

## First screen before scrolling

Fresh browsers opened at scroll position zero with empty storage.

- Job: **Route colored signals through a circuit.**
- Audience: solo puzzle players who want one fresh board without reading a long rule sheet.
- First action: **Try it with sample data**. The next line says three short boards teach the rule.
- Facts: free to play, no account or ads, and progress stays in this browser.

At 1440 × 1000, the playable board began at y=253.1 px. At 390 × 844, it began at y=592.6 px. The job, audience, action, facts, and game were visible before scrolling in both. Neither view had horizontal overflow.

## Demo and complete game runs

The home action opened `/demo` in one click. The sample was ready with a realistic 4 × 4 board, an active signal, a placed relay, the “Sample board 1 of 3” label, and the persistent “Demo — sample data, nothing is saved” banner.

Before entering the demo, I seeded real progress and sound values. Demo play created both demo keys. **Reset demo** deleted both demo keys, restored sample board 1, and preserved both real values exactly. The live suite also proved that **Start for real** deletes demo data without copying it or changing real data.

The deterministic sample run completed all three sample boards and reached their solved end screens before the daily handoff. I separately solved the current daily board, `2026-09-06 · 4033961918`. Its solver found one solution. The run filled all 36 sockets in 31 moves and showed **Every signal is connected**.

On a fresh phone, three failed board tests showed **This run ended**. **Try the same board** kept the seed, cleared every relay, and restored all three fuses.

Normal, invalid, boundary, and recovery paths passed. These included valid pointer and touch moves, Tab/Space/arrows/Enter, a left-edge arrow boundary, disconnected placement followed by a valid move, Undo, path step-back, rule hint, reset confirmation, sound on/off, reload persistence, corrupt saved JSON, and blocked storage writes. When writes were blocked, play continued and the page explained that progress would last only for the visit.

## Clean checkout and claims

A detached clean worktree at `d990735` used the documented Node 22 and npm setup.

```sh
npm ci
npm test
npm run build
```

- `npm ci`: 60 packages, zero audit vulnerabilities.
- `npm test`: 8 unit tests and 29 Chromium browser tests passed.
- `npm run build`: passed and produced `dist/`.
- JavaScript: 25.70 KB raw, 9.15 KB gzip.
- CSS: 13.48 KB raw, 4.05 KB gzip.

All 22 commands in `.factory/claims.json` were then run separately from that clean checkout. Every command passed. The manifest has 22 unique IDs, and each ID occurs exactly once in a shipped test title:

`daily-seed`, `fresh-daily`, `complete-run`, `free-no-account`, `ad-free`, `loss-end`, `invalid-recovery`, `rule-hint`, `reset-scope`, `local-save`, `move-sound`, `demo-isolation`, `privacy-local`, `keyboard-play`, `signal-redundancy`, `count-up-timer`, `demo-banner`, `touch-play`, `step-back`, `undo-action`, `leave-demo`, and `clear-saved-data`.

The live landing page, demo, privacy page, terms page, README, and demo documentation were cross-checked against the manifest. No public promise is missing a complete outcome test. The 3–8 minute text is explicitly an intended session length, not a measured completion promise.

## Accessibility, privacy, routes, and performance

- The full 29-test browser suite passed against live HTTPS.
- Playwright Axe found no serious or critical issue on `/`, `/demo`, `/privacy`, `/terms`, or the designed missing-page route.
- `verify-url.sh` passed `/` and `/demo`: HTTPS 200, correct title, `lang=en`, one h1, one main landmark, image alt and button-label checks, and no console errors.
- Every application route has its own title and canonical URL. Each has one h1, one main landmark, and `lang=en`.
- Keyboard focus reached all controls. End and reset dialogs moved focus inside after opening. Route navigation moved focus to the new h1.
- At desktop and phone widths, the demo-banner actions showed a 3 px ivory keyboard ring against charcoal. The measured contrast was 15.25:1.
- Phone controls and footer links met the 44 px target. Text at 200% remained within 390 px with the heading and board available. Reduced motion removed visible transition duration.
- Signal colors are repeated with visible letters and shapes. There is no flashing animation.
- Demo actions made no network request after the static page load and set no cookie. The full demo run used only the product origin. No analytics, tracking, ads, account, payment, or third-party runtime service was present.
- `/`, `/demo`, `/privacy`, `/terms`, `robots.txt`, and `sitemap.xml` returned 200. `/not-a-page` deliberately returned HTTP 404 and rendered the designed return path. All page links returned 200.
- Live headers include CSP with `frame-ancestors 'none'`, HSTS, Referrer-Policy, X-Content-Type-Options, and Permissions-Policy. The live JavaScript returns one-year immutable caching.
- Fresh Lighthouse mobile scores were 100 performance, 100 accessibility, 100 best practices, and 100 SEO. LCP was 1.0 s, CLS was 0, total blocking time was 50 ms, and transferred bytes were 15 KiB.
- A 120-frame live sample measured 60.0 FPS.

Offline play and update handling are not promised. There is no service worker. There is no backend, account, payment, multiplayer, or AI feature, so tenant isolation, server restart persistence, health, 429/Retry-After, independent multiplayer clients, and AI gateway checks do not apply. The researched puzzle job does not imply a missing AI-assisted step.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Initial static assets were caught by the 404 rule | Resolved. Live hashed JS and CSS return 200; JS has immutable caching and matches the clean build after build-label normalization. |
| Verification 1 lacked touch, path step-back, Undo, and leave-demo claim checks | Resolved. Each has one manifest entry and one outcome tag; every exact command passed locally and the full suite passed live. |
| Verification 2 lacked sound and saved-data deletion checks | Resolved. Both declared commands passed separately and live. |
| Verification 2 footer targets were below 44 px | Resolved. The live phone target check passed for all footer links. |
| Verification 3 had four missing and three incomplete claim checks | Resolved. The manifest and exact-tag audit cover all seven behaviors; all commands passed. |
| Verification 4 found a 2.22:1 demo-banner focus outline | Resolved. Actual keyboard focus renders a 3 px ivory ring at 15.25:1 on desktop and phone. |

No earlier finding remains open.

## Evidence

- `/work/.evidence/relay-logic-review-1/first-screen-desktop.png`
- `/work/.evidence/relay-logic-review-1/first-screen-phone.png`
- `/work/.evidence/relay-logic-review-1/demo-populated-desktop.png`
- `/work/.evidence/relay-logic-review-1/daily-win-desktop.png`
- `/work/.evidence/relay-logic-review-1/loss-end-phone.png`
- `/work/.evidence/relay-logic-review-1/home/verify.json`
- `/work/.evidence/relay-logic-review-1/demo/verify.json`
- `/work/.evidence/relay-logic-review-1/lighthouse.json`

## Result counts

- Findings: 0
- Untested public claims: 0
- Verdict: **PASS**
