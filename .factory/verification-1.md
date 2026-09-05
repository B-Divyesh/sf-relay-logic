# Verify Relay Logic game

## Verdict: FAIL

The game works in the reviewed local and live runs, but this verification cannot pass because four public behavior claims are missing from `.factory/claims.json` and have no tagged regression test. The claims contract requires an entry and exactly one `@claim:<id>` test for every public claim.

## Reviewed release

- Live URL: https://relay-logic.sociobot.in
- Implementation candidate: `3ef2ff40b732ced3745ee0fd3122a39f6af0ad6e`
- Documentation and test SHA: `dd0b80d5657b0fa6d725e70b4b44adb74e5c3174`
- Live footer build label: `7046d18c`

The live footer is from the later repository head. Comparing `3ef2ff40..7046d18` found changes only to the handoff, tests, and excluded Graphify output; no product source, public asset, package, or host configuration changed. The deployed behavior is therefore reviewed against implementation candidate `3ef2ff40`.

## Finding

### F-1 — Medium — public behavior claims have no claim entries or tagged tests

The README and demo documentation make these observable promises, but none appears in `.factory/claims.json` or has a corresponding `@claim:` test:

- “Pointer or touch: select a labeled source, then select one linked socket at a time.”
- “Select an earlier relay on the active path to step back.”
- “Undo restores the last valid action.”
- “Leaving demo mode deletes the demo keys and does not copy sample progress.”

The last promise is also the behavior of the visible **Start for real** action. A mobile manual run confirmed touch placement, Undo, and Start for real today: it removed populated demo progress and created no real progress. That is not enough for the claims contract: each promise needs a separate claim entry and an isolated automated test so it cannot regress unnoticed.

Recommended repair: add four entries to `.factory/claims.json` and four tagged tests. The touch test should use a fresh mobile touch context; the step-back and Undo tests should assert the exact restored path; the leave-demo test should assert deletion of both demo keys while preserving an existing real marker.

## Checks that passed

### Clean checkout and declared claims

A new clean clone at `7046d18` passed `npm ci` (60 packages, 0 audit vulnerabilities), `npm run build`, and `npm test`. The build created `dist/` with 25.70 kB JavaScript (9.15 kB gzip) and 13.28 kB CSS (4.01 kB gzip). The complete suite passed: 8 unit tests and 20 Chromium browser tests.

Every command declared in `.factory/claims.json` passed individually from that clean clone:

- `daily-seed`, `fresh-daily`
- `complete-run`, `free-no-account`, `loss-end`, `invalid-recovery`, `rule-hint`, `reset-scope`
- `local-save`, `demo-isolation`, `privacy-local`, `keyboard-play`

This finding is about the four public promises omitted from that list, not a failed declared command.

### Live browser checks

Fresh Chromium desktop (1440 × 1000) and phone (390 × 844, touch enabled) sessions loaded without console errors. Before scrolling, both stated the job (“Route colored signals through a circuit”), audience (“For solo puzzle players who want one fresh board without reading a long rule sheet”), and first action (“Try it with sample data”); the board began at y=253 on desktop and y=593 on phone. Screenshots are in `/work/.evidence/relay-logic-verify-1/`.

The home action entered `/demo` in one click. The persistent “Demo — sample data, nothing is saved” banner and “Sample board 1 of 3” label remained visible. The live suite completed all three sample boards through the daily-board handoff, captured a solved end screen, reached the three-failed-tests loss screen, and restarted the same seed. It also checked invalid move recovery, reset scope, reload persistence, demo isolation, local-only requests, and keyboard placement. A direct mobile touch run additionally placed a relay, undid it, and left demo without changing real progress.

Both fresh contexts measured 60.0 request-animation-frame callbacks per second over 120 intervals. This is a QA observation, not a replacement for missing claim tests.

### Accessibility, routes, privacy, and earlier finding

- The worker `verify-url.sh` passed `/` and `/demo`: title, `lang=en`, one `h1`, one `main`, image alt state, labeled buttons, and no console errors.
- The live 20-test suite passed axe serious/critical checks on `/`, `/demo`, `/privacy`, `/terms`, and the designed 404; it also passed phone layout, visible reduced-motion behavior, focus after route navigation, and privacy-data deletion checks.
- `/`, `/demo`, `/privacy`, `/terms`, `robots.txt`, and `sitemap.xml` return 200. `/not-a-page` deliberately returns a designed HTTP 404 with a return link; this is expected, not a defect. The Param Factory external link returns 200.
- Live security headers include CSP with `frame-ancestors 'none'`, `Referrer-Policy`, and `X-Content-Type-Options`. The deployed hashed JavaScript asset returns 200 with `Cache-Control: public, max-age=31536000, immutable`.
- The earlier minor deployment finding was static assets blocked by the initial 404 rule. It is resolved: the live hashed JavaScript asset `/assets/index-CN6CTcHj.js` returns 200 and loads during every live browser run.

## Evidence

- `/work/.evidence/relay-logic-verify-1/desktop-home.png`
- `/work/.evidence/relay-logic-verify-1/phone-home.png`
- `/work/.evidence/relay-logic-verify-1/desktop-demo.png`
- `/work/.evidence/relay-logic-verify-1/phone-demo.png`
- `/work/.evidence/relay-logic-verify-1/solved-end.png`
- `/work/.evidence/relay-logic-verify-1/loss-end.png`
- `/work/.evidence/relay-logic-verify-1/verify-home/verify.json`
- `/work/.evidence/relay-logic-verify-1/verify-demo/verify.json`

## Result counts

- Findings: 1
- Untested public claims: 4
- Verdict: FAIL
