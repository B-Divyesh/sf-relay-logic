# Demo sandbox

## Entry point

- Public: `https://relay-logic.sociobot.in/demo`
- Local: `http://localhost:5173/demo`
- Home action: **Try it with sample data**

The first sample board is ready without setup. It is a complete 4 × 4 circuit with three labeled signal pairs. Solving it opens two more sample boards, followed by the current daily board.

## Sandbox boundary

Demo progress is stored only under `demo:relay-logic:progress`. Its sound setting uses `demo:relay-logic:settings`. Demo code does not read or write the real `relay-logic:*` keys.

The persistent banner says **Demo — sample data, nothing is saved**. This means sample actions are not copied into real progress. Browser-local demo state may remain until the visitor resets or leaves demo mode.

## Reset and exit

- **Reset demo** deletes both demo keys and restores sample board 1.
- **Start for real** deletes both demo keys before opening the real game.
- **Reset board** clears only the current board's paths, moves, timer, and failed tests. It preserves the demo seed and demo sound setting.

No demo action sends play data to a backend or touches an account.
