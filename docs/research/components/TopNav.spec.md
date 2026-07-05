# TopNav Specification

## Overview
- **Target file:** `src/components/TopNav.tsx`
- **Screenshot:** none attached — rely on the DOM/CSS description below (extracted via Chrome MCP
  `getComputedStyle()` against the live page, not estimated).
- **Interaction model:** static chrome; hover-only states on nav items/icons/buttons.

## DOM Structure
`<header>` full-width bar containing, left to right:
1. Hamburger icon button (mobile-only, hidden `md:` and up)
2. GitHub mark logo (`MarkGithubIcon` from `@/components/icons`, icon ~24px inside a 32px hit area)
3. Breadcrumb: `fishaudio` (link, weight 400) `/` `fish-speech` (link, weight 600) with a small
   `ChevronDownIcon` dropdown caret button next to it
4. Primary nav links, each with a small leading octicon and (where applicable) a numeric count
   pill: **Code**, **Issues** `9`, **Pull requests** `5`, **Discussions**, **Actions**,
   **Security and quality**, **Insights**. "Code" is the active tab.
5. Right side: search box (pill-shaped button, placeholder "Type `/` to search", `SearchIcon`,
   ~320px wide on desktop, render as a `<button>` not a real `<input>`), then icon buttons:
   create-new (`PlusIcon` + `ChevronDownIcon`), notifications (`BellIcon`), and a circular avatar
   using `/images/avatars/fishaudio.png`.

Build it as two stacked flex rows inside one `<header>`: row 1 = logo + breadcrumb + search +
icons + avatar; row 2 = the nav tabs, directly below, full width.

## Computed Styles

### Header container
- `backgroundColor: #010409` (use `bg-gh-header`)
- Bottom edge: `border-bottom: 1px solid #3d444d` (`border-b border-gh-border`) — this renders
  the same visual line as GitHub's real `inset box-shadow`.
- `color: #f0f6fc`, `fontSize: 14px`, `lineHeight: 21px`
- Horizontal padding: `16px` (`px-4`), growing to `32px` (`md:px-8`)
- Row 1 height ~56px, row 2 (tabs) ~40px

### Breadcrumb text
- `fontWeight: 600` for repo name, `400` for owner name and `/`
- `color: #f0f6fc`, hover: `color: #4493f8` with underline

### Nav tab item
- `fontSize: 14px`, `fontWeight: 400`, `color: #9198a1` (inactive), `color: #f0f6fc` (active =
  "Code")
- Active tab ("Code"): `border-bottom: 2px solid #4493f8`
- Count pill next to "Issues"/"Pull requests": `fontSize: 12px`, `backgroundColor: #212830`,
  `borderRadius: 9999px`, `padding: 0 6px`, `color: #9198a1`

### Search box
- `height: 28px`, `borderRadius: 6px`, `border: 1px solid #3d444d`, `backgroundColor: #0d1117`,
  `color: #9198a1`, `fontSize: 12px`; icon + placeholder text + trailing "/" key-hint pill
  (`border: 1px solid #3d444d`, `borderRadius: 3px`, `padding: 0 4px`)

## Text Content (verbatim)
- Owner: `fishaudio`
- Repo: `fish-speech`
- Tabs: `Code`, `Issues` (badge `9`), `Pull requests` (badge `5`), `Discussions`, `Actions`,
  `Security and quality`, `Insights`
- Search placeholder: `Type / to search`

## Responsive Behavior
- **Desktop (1440px):** full row as described.
- **Tablet (768px):** search box shrinks to an icon-only button; nav tabs remain visible with a
  tighter gap.
- **Mobile (390px):** collapse breadcrumb + nav tabs behind the hamburger icon; keep logo, search
  icon, and avatar visible in one row.
- **Breakpoint:** switch to the mobile collapsed layout below `768px` (Tailwind `md:`).

## Assets / Imports
- Icons from `@/components/icons`: `MarkGithubIcon`, `ChevronDownIcon`, `SearchIcon`, `PlusIcon`,
  `BellIcon`, `ThreeBarsIcon`.
- Avatar: `/images/avatars/fishaudio.png` (already in `public/images/avatars/`). Use a plain
  `<img>` tag (not `next/image`) for simplicity — small fixed-size decorative images.
- Use `cn()` from `@/lib/utils` for conditional classes. Use plain `<a href="#">`/`<button>`
  elements (no routing needed — this is a static one-page clone).
- Export a default React component `TopNav` with no required props.
- Verify `npx tsc --noEmit` passes before finishing.
