# ReadmeSection Specification

## Overview
- **Target file:** `src/components/ReadmeSection.tsx`
- **Screenshot:** none attached — rely on the description below.
- **Interaction model:** click-driven tab switch between "README" and "License" (License tab can
  just show a simple placeholder paragraph — the real focus is the README tab, which is active
  by default and does not need real click-driven JS if a simple `"use client"` two-tab toggle is
  more than the task warrants; a minimal working click toggle is expected since GitHub's tabs ARE
  click-driven, not scroll-driven).

## DOM Structure
1. Tab bar row: `BookIcon` + "README" tab (active: `border-bottom: 2px solid #f0f6fc`, `color:
   #f0f6fc`), `ShieldIcon` + "License" tab (inactive: `color: #9198a1`), right-aligned
   `PencilIcon` (edit) and `ListUnorderedIcon` (outline) icon buttons. This row has
   `border-bottom: 1px solid #3d444d`.
2. Below the tab bar, a padded container (`padding: 32px`) rendering the real README markdown
   using `react-markdown` + `remark-gfm` (both already installed in `package.json`).

## Content Source
Read the raw markdown file at `src/content/fish-speech-readme.md` using Node's `fs` module in a
**Server Component** (do not mark this file `"use client"` for the read — only the tab-switch
interactivity needs a small client boundary; split into `ReadmeSection.tsx` (server, reads the
file, renders tab bar + a client `ReadmeTabs` wrapper) if needed, or simplest: keep the whole
file a client component and `fetch('/content-not-available')`... — **do it the simple correct
way**: keep `ReadmeSection.tsx` as an `async` Server Component that reads the file with
`fs.readFileSync(path.join(process.cwd(), "src/content/fish-speech-readme.md"), "utf-8")`, passes
the raw string as a prop into a small client child component (e.g. `ReadmeTabs.tsx`, `"use
client"`) that owns the active-tab `useState` and renders `<ReactMarkdown>` when the README tab
is active.

Image paths inside the markdown already point to `/images/readme/*.png` and
`/images/badges/*.svg` (already downloaded to `public/`) — do not rewrite them again.

## GitHub Alert Callouts
The markdown contains GitHub-flavored alert blockquotes:
```
> [!IMPORTANT]
> **License Notice**
> ...

> [!WARNING]
> **Legal Disclaimer**
> ...
```
`remark-gfm` does NOT convert these automatically. Implement a custom `blockquote` component
override for `react-markdown` that inspects its children: if the first text node matches
`[!IMPORTANT]` or `[!WARNING]`, strip that marker line and render a styled callout box instead of
a plain blockquote:
- `[!IMPORTANT]`: left border `4px solid #8957e5` (purple), icon `InfoIcon` colored `#8957e5`,
  label "Important" in the same purple, `backgroundColor: rgba(137,87,229,0.1)`, `borderRadius:
  6px`, `padding: 8px 16px`
- `[!WARNING]`: left border `4px solid #d29922` (amber), icon `AlertIcon` colored `#d29922`,
  label "Warning" in the same amber, `backgroundColor: rgba(210,153,34,0.1)`

Both icons come from `@/components/icons`.

## Computed Styles
- Container border: `1px solid #3d444d`, `border-radius: 0 0 6px 6px` (top corners square since
  the tab bar sits flush above it, matching the FileTree/CommitBar box above in the page layout).
- Apply the `.markdown-body` class (already defined in `globals.css`) to the rendered markdown
  wrapper — it provides GitHub-accurate heading, table, code-block, and link styling. Do not
  redefine those styles again in this component.
- Tab bar height: `~48px`, `padding: 0 16px`.

## Responsive Behavior
- **Desktop/Tablet:** as described, `padding: 32px` on the markdown container.
- **Mobile (390px):** reduce container padding to `16px`; tables inside `.markdown-body` already
  scroll horizontally via the existing CSS (`overflow-x: auto`) — no extra work needed.
- **Breakpoint:** `sm:` (640px) for the padding reduction.

## Assets / Imports
- `react-markdown` (default export `ReactMarkdown`) and `remark-gfm` (default export `remarkGfm`)
  — both already in `package.json`.
- Icons from `@/components/icons`: `BookIcon`, `ShieldIcon`, `PencilIcon`, `ListUnorderedIcon`,
  `InfoIcon`, `AlertIcon`.
- Content file: `src/content/fish-speech-readme.md` (already present, real content, do not
  regenerate or paraphrase it).
- Export a default React component `ReadmeSection` with no required props.
- Verify `npx tsc --noEmit` passes before finishing. If `react-markdown` type resolution needs
  `remark-gfm` passed as `remarkPlugins={[remarkGfm]}`, follow the library's current API (v10) —
  check `node_modules/react-markdown/readme.md` if unsure rather than guessing at an older API.
