# linen.ai — Page Topology

Source: `<diffui-landing-page>` (vanilla web component, shadow DOM). Page height ≈ 5146px @1440, ≈ 5773px @390.
Theme: follows `prefers-color-scheme` (localStorage `diffui-landing-theme` overrides). Headless/default = light (cream #f8f6f2).

| # | Section | Layer | Interaction model | Clone implementation |
|---|---------|-------|-------------------|----------------------|
| 0 | Page shell `.page` — flex column, dot grid bg (radial 1px, 16px) | flow | static | `LinenLanding` (React) |
| 1 | Hero fabric `<diffui-hero-linen>` — green linen, WebGL lit (albedo/normal/height/roughness maps), absolute, z -1, width 109% | absolute bg | pointer-lit + time | vendored element, sized by `useHeroLayout` |
| 2 | Header — logo, Pricing/Learn/Blog/Use cases ▾, "Sign in / up" | flow (not sticky) | click (menu), hover | `LandingHeader` (React) |
| 3 | Hero headline + sub | flow | static | `HeroHeadline` (React) |
| 4 | Canvas hero `<diffui-landing-canvas-hero>` — prompt node typing, generates design stack | flow | time-driven (auto-plays when visible) | vendored element |
| 5 | Rise section — `<diffui-landing-river mode=rise>` designs rise as code glyphs → pages, behind fabric, masked by linen-below.png; multicolor band at bottom | absolute, z -2 | time-driven + pointer light | vendored element + `useHeroLayout` mask glue |
| 5b | "From prompt to page in 39 seconds*" glass plate | absolute over river | static (positioned from river decode line) | `RiseCard` (React) |
| 6 | Team / agent / brand `<diffui-landing-team-agent>` — 3 rows with animated demos, band bg #f1ede5 | flow, full bleed | time-driven when visible | vendored element |
| 7 | Ribbon divider `<diffui-landing-lit-ribbon>` gold ribbon, WebGL | flow, full bleed | pointer-lit | vendored element in `RibbonDivider` |
| 8 | Reviews — "Trusted by creators", 4 cards, CTA buttons | flow, max 1400px | hover on buttons | `ReviewsSection` + `ReviewCard` (React) |
| 9 | Footer — © Diffui Inc., contact + legal links | flow | hover | `LandingFooter` (React) |

Out of scope: cookie/privacy banner (tracking), GTM/Meta pixel, sign-in modal/OAuth, logo right-click brand menu.
