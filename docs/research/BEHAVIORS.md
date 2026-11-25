# linen.ai — Behaviors

- **Smooth scroll library:** none (native scrolling).
- **Header:** not sticky, no scroll change. Nav links color `--header-muted` → `--header-text` on hover, `transition: color 120ms ease`. "Use cases" click toggles dropdown (chevron rotates 180°, 120ms). Menu closes on outside click / Escape. Hidden < 760px.
- **Hero fabric:** WebGL; light follows pointer (`pointer-light.js`), lit region includes the canvas-hero node rect (`.hero` property). Pauses when off-screen (`VisibleActivity`). Falls back to `<img>` until `data-ready`.
- **Canvas hero:** time-driven. Prompt types "Create a website for a c…", Generate button, then a design stack/dock animates. Auto-plays when visible.
- **River (rise):** time-driven conveyor. Thumbnails rise from the band, rendered as decrypt glyphs (Geist Mono) below a "decode line", turn into page images above it, then pass behind the hero fabric (mask = `linen-below.png` + gradient). Speed paced by `latency` (39s from `/api/landing/stats`). Emits `river-decode-line`; exposes `decodeLineY`, `bandTopY`.
- **Rise card:** vertically centered on `decodeLineY` (desktop); < 760px seated on band top (`bandTopY + 28px`, translateY(-100%)).
- **Team/agent/brand:** share demo (collab cursors, invite), agent demo ("Build this design for me in my codebase" → "Your agent is building…"), brand demo (screenshots → generated pages). Each animates only while visible.
- **Lit ribbon:** WebGL gold ribbon, pointer-lit.
- **Buttons (`diffui-button`):** hover/active states internal to vendored element.
- **Footer links:** color muted → gold on hover, 120ms.
- **Responsive:** 1440: header single row; canvas hero full width. 760px breakpoint: header nav scrolls horizontally, Sign-in hidden; fabric scale(1.25) lifted 80px and starts under the headline; canvas hero rendered at 200% width scaled 0.6; rise section 640px tall. Reviews: 4 cols → 2 cols ≤1200px → 1 col ≤700px. Footer: 3 cols → 2 ≤1140px → 1 ≤560px.
