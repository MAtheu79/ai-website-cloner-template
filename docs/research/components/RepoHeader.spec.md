# RepoHeader Specification

## Overview
- **Target file:** `src/components/RepoHeader.tsx`
- **Screenshot:** none attached — rely on the description below (from live `getComputedStyle()`
  extraction).
- **Interaction model:** static; buttons are visual split-buttons with a caret (no dropdown
  content was captured/opened this pass — render the caret but it does not need to open anything).

This component renders THREE stacked rows that sit directly below `TopNav` and above the two-
column content grid:

## Row 1 — Repo title bar
- Left: a small `BookIcon`-style repo icon (use `FileIcon` from `@/components/icons` sized 16px,
  muted color `#9198a1`), then `fish-speech` in bold (`fontWeight: 600`, `fontSize: 20px`,
  `color: #f0f6fc`), then a "Public" badge: pill, `border: 1px solid #3d444d`, `borderRadius:
  9999px`, `padding: 0 6px`, `fontSize: 12px`, `fontWeight: 500`, `color: #9198a1`, transparent
  background.
- Right: three split-buttons, each `height: 28px`, `borderRadius: 6px`, `border: 1px solid
  #3d444d`, `backgroundColor: #212830`, `color: #f0f6fc`, `fontSize: 12px`, `fontWeight: 500`,
  icon + label + `ChevronDownIcon` caret, then a separated numeric counter badge (same button
  group, `border-left: 1px solid #3d444d`, same bg):
  - `EyeIcon` "Watch" `160` (watchers)
  - `RepoForkedIcon` "Fork" `2.7k`
  - `StarIcon` "Star" `31.1k`

## Row 2 — Sub nav
- Left cluster: branch selector button (`GitBranchIcon` + "main" + `ChevronDownIcon`, same button
  styling as above), then muted text link "6 Branches" (with small branch icon) and "14 Tags"
  (with `TagIcon`), separated by a thin vertical divider `border-left: 1px solid #3d444d`.
- Right cluster: "Go to file" search-style button (pill, `SearchIcon`, placeholder text, border
  `#3d444d`), "Add file" button with `ChevronDownIcon` caret, and a primary green "Code" button
  (`backgroundColor: #238636`, `color: #f0f6fc`, `borderRadius: 6px`, icon `</>` + "Code" label +
  caret) — this is the one non-neutral button on the page.

## Row 3 — Latest commit bar
- A bordered box (`border: 1px solid #3d444d`, `borderRadius: 6px 6px 0 0`, no bottom border
  since the file tree table sits directly below it and shares the same box) containing:
  - Circular avatar 20px (`/images/avatars/fishaudio.png` as a stand-in for the commit author
    since we don't have a real photo for "Kaihui-AMD")
  - Bold author name `Kaihui-AMD`
  - Commit message `Add AMD ROCm Docker support (RDNA3/RDNA4)` as plain text, followed by a link
    styled span `(#1292)` in accent color `#4493f8`
  - Short SHA link `e5e2926` in accent color, monospace font
  - Muted separator `·`
  - Muted relative date `last month`
  - Right-aligned: `HistoryIcon` + link "732 Commits" in default text color with hover underline

All text is real content — do not paraphrase.

## Computed Styles
- Row 1/2 background: transparent (page background `#0d1117` shows through)
- Row 3 background: `#151b23` (slightly lighter than canvas, matches GitHub's commit-bar tint) —
  if unsure, `#161b22` is an acceptable close match
- Border color throughout: `#3d444d`
- Font: inherit the page's system-font stack (already set as `--font-sans` in `globals.css`)
- Padding: `16px` horizontal on the page container, `12px 16px` inside the commit bar row

## Text Content (verbatim)
- `fish-speech`, `Public`
- `Watch` `160`, `Fork` `2.7k`, `Star` `31.1k`
- `main`, `6 Branches`, `14 Tags`
- `Go to file`, `Add file`, `Code`
- `Kaihui-AMD`, `Add AMD ROCm Docker support (RDNA3/RDNA4)`, `(#1292)`, `e5e2926`, `last month`,
  `732 Commits`

## Responsive Behavior
- **Desktop (1440px):** as described, single row each.
- **Tablet (768px):** Row 1 buttons shrink to icon+count only (labels "Watch"/"Fork"/"Star"
  hidden, keep icon + number). Row 2 clusters may wrap to two lines if needed.
- **Mobile (390px):** Row 1 title and buttons stack (title row, then a full-width button row below
  it). Row 2 becomes two stacked rows (branch cluster, then file/code cluster). Row 3 commit bar
  keeps author + message on one truncating line, date moves below on very small widths if needed.
- **Breakpoint:** `md:` (768px) for button label collapse, `sm:`/`md:` stacking for row 1/2.

## Assets / Imports
- Icons from `@/components/icons`: `FileIcon`, `ChevronDownIcon`, `EyeIcon`, `RepoForkedIcon`,
  `StarIcon`, `GitBranchIcon`, `TagIcon`, `SearchIcon`, `HistoryIcon`.
- Avatar: `/images/avatars/fishaudio.png`.
- Export a default React component `RepoHeader` with no required props (all data is static/real,
  hardcode it — do not over-engineer with a generic props API for a one-page clone).
- Verify `npx tsc --noEmit` passes before finishing.
