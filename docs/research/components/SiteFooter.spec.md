# SiteFooter Specification

## Overview
- **Target file:** `src/components/SiteFooter.tsx`
- **Screenshot:** none attached — rely on the description below.
- **Interaction model:** static; links `hover:underline`.

## DOM Structure
A centered footer row, `padding: 40px 16px`, `borderTop: 1px solid #3d444d` (implicit via
spacing/margin above rather than a visible rule, matching the live page which has generous
whitespace above the footer with no separator line — use margin-top `48px` instead of a border).

Content, centered horizontally, two lines wrapping into one row on wide screens:
1. `MarkGithubIcon` (16px, muted `#9198a1`) + `© 2026 GitHub, Inc.`
2. A row of links, `gap: 16px`, `fontSize: 12px`, `color: #9198a1`: `Terms`, `Privacy`,
   `Security`, `Status`, `Community`, `Docs`, `Contact`, `Manage cookies`,
   `Do not share my personal information`

## Computed Styles
- `fontSize: 12px`, `color: #9198a1`
- Links: `hover:text-foreground hover:underline` (color shifts to `#f0f6fc` on hover, matches
  GitHub's link hover behavior in the footer)
- Layout: `flex flex-col items-center gap-3` centered, or `flex-wrap justify-center` for the link
  row so it wraps gracefully at narrow widths.

## Text Content (verbatim)
`© 2026 GitHub, Inc.` — `Terms` `Privacy` `Security` `Status` `Community` `Docs` `Contact`
`Manage cookies` `Do not share my personal information`

## Responsive Behavior
- **Desktop/Tablet:** single wrapped row of links, centered.
- **Mobile (390px):** links wrap onto multiple centered lines naturally via `flex-wrap` — no
  special mobile-only markup needed.

## Assets / Imports
- Icon from `@/components/icons`: `MarkGithubIcon`.
- Export a default React component `SiteFooter` with no required props. Use `<a href="#">` for
  all footer links (no real destinations needed for this static clone).
- Verify `npx tsc --noEmit` passes before finishing.
