# Relay Logic handoff

## Release

- Public URL: https://relay-logic.sociobot.in
- Demo URL: https://relay-logic.sociobot.in/demo
- Product type: static Vite and TypeScript browser game
- Deployed implementation SHA: `b280c937ca3bee7a9bb9117709e7102095538281`
- Runtime behavior source ancestor: `2baa0eab3319529988826a02a402e67fc2b8a428`
- Deployment: existing Azure Static Web App `sf-relay-logic`, Central US, production environment
- Deployed: 2026-09-05 UTC

The deployed JavaScript reports build `b280c937`. Its SHA-256 matches the clean build exactly. Repair 3 changes the claim manifest and browser regression tests; the working runtime source from `2baa0ea` did not need a behavior change. Handoff and later report commits are not deployed implementation commits.

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
- Browser tests: 28 passed in Chromium 1.58.2.
- Claims: all 22 commands in `.factory/claims.json` passed individually.
- Build: `dist/` produced successfully.
- JavaScript: 25.70 KB raw, 9.15 KB gzip.
- CSS: 13.41 KB raw, 4.04 KB gzip.

## Live verification

- The full 28-test browser suite passed against the HTTPS origin.
- Axe found no serious or critical issues on `/`, `/demo`, `/privacy`, `/terms`, or the designed 404.
- `verify-url.sh` passed `/` and `/demo` with correct titles, `lang=en`, one h1, one main landmark, labeled controls, and no console errors.
- Fresh 1440 × 1000 desktop and 412 × 839 phone contexts showed the job, solo-puzzle audience, sample action, three facts, and board before scrolling. The board began at 253 px and 575 px respectively.
- Each fresh context opened the sample in one click, placed a relay, kept “Demo — sample data, nothing is saved” and “Sample board 1 of 3” visible, then reset both demo keys without changing seeded real keys.
- The deterministic live run completed all three sample boards, showed the solved end screen, reached the three-failed-tests loss screen, and restarted the same seed.
- The shipped suite covers normal, invalid, boundary, and reset paths. Recorded live checks also cover corrupt and blocked storage recovery.
- Keyboard focus, dialog focus, route focus, 44 px phone targets, 200% text, reduced motion, touch input, and phone overflow checks pass.
- `/`, `/demo`, `/privacy`, `/terms`, `robots.txt`, and `sitemap.xml` return 200. An unknown route deliberately returns HTTP 404 with a designed route home.
- Security headers include CSP with `frame-ancestors 'none'`, Referrer-Policy, and X-Content-Type-Options. The hashed JavaScript returns one-year immutable caching.
- Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices, 100 SEO. LCP 1,024 ms, CLS 0, total blocking time 12 ms, transfer size 15,426 bytes.
- Request-animation-frame sampling over 120 frames measured 60.0 fps on fresh desktop and phone contexts.

Evidence is in `/work/.evidence/relay-logic-repair-3/`. The verb-first, 69-character catalog description is copied to `/work/.evidence/catalog-description.txt`.

## Earlier findings

- Initial static assets blocked by the 404 rule: resolved. The live hashed assets return 200; JavaScript has immutable caching and matches the deployed clean build byte for byte.
- Verification 1 missing touch, path step-back, Undo, and leave-demo claims: resolved; all four dedicated commands pass locally and live.
- Verification 2 missing sound and saved-data deletion claims: resolved; both dedicated commands pass locally and live.
- Verification 2 footer targets below 44 px: resolved; live phone measurements are 56.1 × 44, 46.4 × 44, and 166.2 × 44 CSS px.
- Verification 3’s four absent and three incomplete claims: resolved by the seven outcomes listed above.

## Known limits

- The 3–8 minute round length is a design target, not a measured human-study result.
- The brief’s 75% learn completion and 30% daily attempt goals are not measured because the game has no analytics.
- Offline play is not promised. A connection is required for the initial static load.
- Accounts, multiplayer, leaderboards, a puzzle editor, and paid features remain outside the researched scope.
