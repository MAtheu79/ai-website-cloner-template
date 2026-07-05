# RepoSidebar Specification

## Overview
- **Target file:** `src/components/RepoSidebar.tsx`
- **Screenshot:** none attached — rely on the description below.
- **Interaction model:** static; all links `hover:underline`.

This is the right-column sidebar that sits beside `FileTree`/`ReadmeSection` in the two-column
page grid. Five stacked sections, each separated by `border-bottom: 1px solid #3d444d`, padding
`16px 0` per section (no side padding — the parent grid column handles that).

## Section 1 — About
- Heading `About` (`fontSize: 16px`, `fontWeight: 600`)
- Description paragraph: `SOTA Open Source TTS` (`fontSize: 16px`, `color: #f0f6fc`, margin
  `8px 0`)
- Website link row: `LinkExternalIcon` (or a simple link icon) + link text `speech.fish.audio`
  (href `https://speech.fish.audio`), `color: #4493f8`
- Topic pills (flex-wrap, gap `8px`, margin-top `8px`): `tts`, `transformer`, `llama`, `valle`,
  `vqvae`, `vits`, `vqgan` — each pill: `backgroundColor: rgba(56,139,253,0.1)`, `color:
  #4493f8`, `borderRadius: 24px`, `padding: 0 10px`, `height: 24px`, `fontSize: 12px`,
  `fontWeight: 500`
- Link list (each row: icon + label, `fontSize: 14px`, `color: #f0f6fc`, `gap: 8px`, vertical
  stack, margin-top `12px`): `BookIcon` "Readme", `ShieldIcon` "View license", `PulseIcon`
  "Activity", `ListUnorderedIcon` "Custom properties"
- Stat rows below the link list (each: icon + number + label, same 14px/8px-gap style):
  `StarIcon` "31.1k stars", `EyeIcon` "160 watching", `RepoForkedIcon` "2.7k forks"
- Plain muted link (no icon) below: `Report repository`

## Section 2 — Releases
- Heading `Releases` + muted count badge `14` next to it (same pill style as nav count badges)
- Latest release row: small `TagIcon` (color `#3fb950`), version `V1.5.1`, a "Latest" pill badge
  (`backgroundColor: rgba(63,185,80,0.1)`, `color: #3fb950`, `borderRadius: 9999px`, `fontSize:
  12px`, `padding: 0 8px`), then on the next line, muted text `on May 31, 2025`
- Link below: `+ 13 releases`

## Section 3 — Deployments
- Heading `Deployments` + muted count badge `307`
- Row: green filled circle/check icon (reuse `InfoIcon` recolored `#3fb950`, or a simple 8px
  green dot) + `github-pages` (bold-ish, `color: #f0f6fc`) + muted ` last month`
- Link below: `+ 306 deployments`

## Section 4 — Contributors
- Heading `Contributors` + muted count badge `98`
- Avatar grid: circular avatars, `28px`, `gap: 4px`, wraps at ~7 per row, using the real
  downloaded avatars in this exact order: `leng-yue`, `AnyaCoder`, `PoTaTo-Mika`,
  `Stardust-minus`, `Whale-Dolphin`, `pre-commit-ci`, `wishhyt`, `Enucatl`, `Tps-F`, `v3ucn`,
  `PriesiaMioShirakana`, `Picus303`, `OedoSoldier`, `eltociear` (files at
  `/images/avatars/<Name>.png`, matching these exact filenames — case-sensitive).
- Link below: `+ 84 contributors`

## Section 5 — Languages (no bottom border, last section)
- Heading `Languages`
- Segmented horizontal bar: `height: 8px`, `borderRadius: 9999px`, `overflow: hidden`, `display:
  flex`, each segment `width: <percent>%`, no gap between segments. Segments in order with exact
  colors and percentages:
  `Python #3572A5 80.8%`, `TypeScript #3178c6 14.3%`, `Dockerfile #384d54 3.0%`,
  `Jupyter Notebook #DA5B0B 1.2%`, `CSS #563d7c 0.5%`, `JavaScript #f1e05a 0.1%`,
  `Other (HTML+Shell) #8256d0 0.1%`
- Legend below the bar: two-column flex-wrap grid, each entry = colored dot (8px circle, matching
  segment color) + language name + percent, `fontSize: 12px`. Order: `Python 80.8%`, `TypeScript
  14.3%`, `Dockerfile 3.0%`, `Jupyter Notebook 1.2%`, `CSS 0.5%`, `JavaScript 0.1%`, `Other 0.1%`.

Define the language data as a typed array using `LanguageStat` from `@/types/github` and `.map()`
over it for both the bar and the legend — do not duplicate the list by hand.

## Responsive Behavior
- **Desktop (1440px) / Tablet (768px):** sidebar is a right column, ~300–340px wide, as described.
- **Mobile (390px):** sidebar becomes a full-width block that stacks BELOW the main content
  column (this is handled by the parent grid in `page.tsx` via `lg:` breakpoint — this component
  itself just needs to be a normal block-level flex column with `w-full`, no fixed width baked in;
  let the parent control column width).
- **Breakpoint:** parent switches from stacked to side-by-side at `lg:` (1024px).

## Assets / Imports
- Icons from `@/components/icons`: `LinkExternalIcon`, `BookIcon`, `ShieldIcon`, `PulseIcon`,
  `ListUnorderedIcon`, `StarIcon`, `EyeIcon`, `RepoForkedIcon`, `TagIcon`.
- Types from `@/types/github`: `TopicTag`, `LanguageStat`, `Contributor`.
- Avatars: `/images/avatars/*.png` (all already downloaded).
- Export a default React component `RepoSidebar` with no required props; hardcode the real data
  as typed consts inside the file.
- Verify `npx tsc --noEmit` passes before finishing.
