# Relay Logic

Route labeled signals through a daily circuit. Relay Logic is a free solo browser game for people who want a short logic puzzle without a long rule sheet.

Select a lettered source. Place relays along etched channels to reach its matching receiver. Every socket must be used, and two signals cannot share one. Three learn boards introduce the rule before the 6 × 6 daily board. A round is intended to take 3–8 minutes, but there is no countdown.

The UTC date produces a stable daily seed. The generator adds only channels that preserve one solver-checked solution. Color is paired with a letter and shape.

## Try the sample

Open `/demo` or select **Try it with sample data** on the home page. The sample includes three complete 4 × 4 learn boards. A persistent banner identifies demo mode.

Demo play uses `demo:relay-logic:*` local-storage keys. Real play uses `relay-logic:*` keys. Leaving demo mode deletes the demo keys and does not copy sample progress.

## Controls

- Pointer or touch: select a labeled source, then select one linked socket at a time.
- Keyboard: Tab to a socket, Enter or Space to select, and Arrow keys to move between sockets.
- Select an earlier relay on the active path to step back.
- Undo restores the last valid action.
- Reset clears paths, moves, timer, and failed tests. It keeps the puzzle seed and sound setting.
- Explain one rule gives a rule reminder. It does not place a relay or name a cell.

Three failed board tests end the run. The loss screen restarts the same seed. A solved board shows its completed end screen and next action.

## Local development

Prerequisites: Node.js 22 or newer and npm.

```sh
npm ci
npm run dev
```

Open `http://localhost:5173/`. The direct sample URL is `http://localhost:5173/demo`.

## Test and build

```sh
npm test
npm run build
```

`npm test` runs deterministic solver tests, a full scripted game, recovery tests, keyboard checks, route checks, and axe accessibility scans. Public claims and their exact commands are listed in [`.factory/claims.json`](.factory/claims.json).

The production build is written to `dist/`. Preview it with:

```sh
npm run preview
```

## Privacy and deployment

There is no backend, account, analytics script, advertisement, or third-party runtime request. Progress and sound stay in local storage. The Privacy page can erase real and demo keys.

Deploy the contents of `dist/` to the product static host. `staticwebapp.config.json` supplies routes, the styled 404 response, and security headers. The canonical public URL is <https://relay-logic.sociobot.in>.

## Project records

- [Research brief](.factory/brief.json)
- [Visual system and difficulty](.factory/design.md)
- [Demo contract](.factory/demo.md)
- [Claims and checks](.factory/claims.json)
- [Handoff](.factory/handoff.md)

Relay Logic is available under the [MIT License](LICENSE).
