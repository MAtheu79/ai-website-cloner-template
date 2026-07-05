# Design Tokens — github.com/fishaudio/fish-speech (dark theme)

Extracted via `getComputedStyle()` through Chrome MCP on the live page.

## Colors

| Token | Value | Used for |
|---|---|---|
| canvas / body bg | `rgb(13,17,23)` `#0d1117` | page background |
| header bg | `rgb(1,4,9)` `#010409` | TopNav background |
| fg default | `rgb(240,246,252)` `#f0f6fc` | primary text |
| fg muted | `rgb(145,152,161)` `#9198a1` | secondary text, logo mark, icons |
| border default | `rgb(61,68,77)` `#3d444d` | dividers, button borders, header inset shadow |
| accent (link/topic) | `rgb(68,147,248)` `#4493f8` | links, topic pill text |
| topic pill bg | `rgba(56,139,253,0.1)` | topic pill background |
| btn bg | `rgb(33,40,48)` `#212830` | Watch/Fork/Star button background |
| badge border (Public) | `rgb(61,68,77)` | pill border, transparent fill |

## Typography

- Font stack: `"Mona Sans VF", -apple-system, "system-ui", "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`.
  Mona Sans VF is a GitHub-proprietary variable font not publicly distributed via Google Fonts —
  implemented as the system-font fallback chain only (matches ~95% of rendering since Mona Sans
  is metrics-close to the system stack).
- Base body: `14px / 21px`, weight 400.
- README body: `16px` base.
- Nav/buttons: `12–14px`, weight 400–500.

## Shape & Elevation

- Button / input radius: `6px`.
- Pill radius (Public badge, contributor "+N" link): `9999px` (full).
- Topic tag radius: `24px`.
- Header bottom border: `inset 0 -1px 0 #3d444d` (box-shadow, not border).
- Card/border box border: `1px solid #3d444d`, radius `6px`.

## Spacing

- Button horizontal padding: `8px`; button height `28px`.
- Badge/pill horizontal padding: `6–10px`; height `20–24px`.
- Sidebar section vertical rhythm: ~`16px` between blocks.

## Assets

- Avatars: circular, contributor grid avatars ~`20px`, commit-bar avatar ~`20px`.
- Languages bar: horizontal segmented bar, ~`8px` tall, rounded ends, segment colors follow
  GitHub's standard per-language colors (Python `#3572A5`, TypeScript `#3178c6`, Dockerfile
  `#384d54`, Jupyter Notebook `#DA5B0B`, CSS `#563d7c`, JavaScript `#f1e05a`, HTML `#e34c26`,
  Shell `#89e051`).
