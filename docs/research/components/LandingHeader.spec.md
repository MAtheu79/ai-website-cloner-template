# LandingHeader Specification
- **Target file:** `src/components/linen/LandingHeader.tsx`
- **Screenshot:** `docs/design-references/linen-desktop-full.png` (top 60px)
- **Interaction model:** click (Use cases menu) + hover

## Computed styles (from diffui-landing-header.js)
- `.topbar`: flex, space-between, align center, padding 18px 28px, gap 16px.
- `.topbarStart`: flex, gap 24px.
- Brand link: inline-flex gap 10px; icon 22×22 `/landing/assets/linen-brand-icon.svg`; word "linen" Georgia/Times serif 20px weight 500, letter-spacing .2px, color header-text (#1a1c1e light / #e6edf3 dark).
- `.topNav`: flex gap 12px.
- Nav link / menu button: h 30px, padding 0 10px, gap 6px, Geist Mono 13px weight 500, ls .2px, color header-muted (#5c6570 / #9aa6b2) → header-text on hover (color 120ms ease). Chevron 10×10, rotate 180° when open.
- Menu: absolute top calc(100%+6px) left 0, min-w 168px, padding 6px, radius 8px, bg #fff / #0e1113, box-shadow `0 0 0 1px rim, 0 4px 12px rgba(0,0,0,.18), 0 14px 28px rgba(0,0,0,.18)`, z 20. Items: min-h 34px, padding 8px 10px, radius 4px, mono 13px/1.35 500, hover bg rgba(26,28,30,.04).
- Sign-in: `<diffui-button subtle>` --height 34px, --padding-x 12px, --font-size 12px, --font-weight 500, bg var(--bg), radius 4px.

## Content
Pricing (/pricing), Learn (/learn), Blog (/blog), Use cases ▾ → Founders (/for/founders), Bootstrappers (/for/bootstrappers). Button "Sign in / up". Links point at https://linen.ai paths (no local pages).

## Responsive (≤760px)
Topbar block, padding 14px, bg var(--bg), relative; nav flex-1 nowrap overflow-x auto; Use cases hidden; sign-in hidden; auth area absolute top 14 right 14.
