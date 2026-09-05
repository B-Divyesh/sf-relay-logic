# Relay Logic visual system

## Direction

Relay Logic looks like a compact 1960s enamel telephone switchboard, not a generic game grid. The board is the dominant object on the first screen. An ivory metal faceplate, charcoal ink, recessed sockets, thin copper traces, and saturated signal inserts explain the rules before decoration does. Chamfered panels and small machine labels give the controls a physical order without using invented lore.

This is an explicit single-mode treatment. A second dark theme would turn the physical faceplate into a software skin and weaken recognition. The ivory surface is painted explicitly on every route.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| enamel | `#ede5d5` | page and board field |
| paper | `#fffaf0` | raised controls |
| charcoal | `#202321` | primary text and traces |
| muted | `#5c625c` | secondary text |
| copper | `#826542` | inactive channels and outlines |
| red | `#c52e3d` | circle / A signal |
| blue | `#1769aa` | triangle / B signal |
| green | `#237a52` | diamond / C signal |
| violet | `#7650a8` | square / D signal |
| orange | `#a95313` | star / E signal |
| danger | `#9b252d` | invalid move and failed test |

Signal identity is always repeated with a letter and shape. Color is never the only distinction. All text combinations meet WCAG AA; signal colors are used for large fills and outlines rather than body text on ivory.

## Type and spacing

The display face uses the local system slab stack (`Rockwell`, `Roboto Slab`, Georgia) and the body uses the local system humanist stack (`Avenir Next`, `Segoe UI`, sans-serif). No font leaves the device. Uppercase machine labels use 0.08em tracking. Spacing follows an 8 px rhythm with 4 px for small optical gaps. Body text is at least 16 px and controls are at least 44 px.

## Interaction grammar

- Select a labeled source, then place one relay at a time along an etched channel.
- A pressed socket settles by 1 px, like a switch. Valid relays fill immediately; invalid input leaves the board unchanged and explains the rule.
- Source and receiver caps are larger than relays. Filled traces connect socket centers so the chosen route reads as one circuit.
- Three fuse lamps show remaining board tests. A failed third test opens a real loss screen; a complete circuit opens the solved screen.
- Undo and reset are adjacent but reset requires confirmation once work exists.

## Motion policy

Board state uses 160–220 ms opacity and transform transitions. The completion plate rises from the board. There is no looping animation and no flashing. Under `prefers-reduced-motion`, all transitions and smooth scrolling are removed. The timer uses a clamped fixed-step loop and pauses while the tab is hidden.

## Difficulty curve

The three learn boards use 4 × 4 boards, three signals, and two to four safe decoy channels. The daily board uses 6 × 6 sockets, five signals, and ten solver-approved decoy channels. Daily topology, endpoint positions, labels, and paths derive from the shown UTC date seed. A solver rejects any added channel that would introduce a second solution.

## Asset plan and provenance

The board, traces, relay shapes, wordmark, favicon, and social preview are original code-native SVG/CSS made for this product on 2026-09-05. No stock art, third-party image, generated raster, external font, or icon library is used. The image-generation guidance was reviewed; raster generation was intentionally not used because the product needs deterministic, code-native circuit geometry and tiny assets. The 1200 × 630 social image is composed from the same switchboard geometry.
