# ReviewsSection + ReviewCard Specification
- **Target files:** `src/components/linen/ReviewsSection.tsx`, `src/components/linen/ReviewCard.tsx`
- **Interaction model:** static; buttons hover (vendored diffui-button)

## Section
block, w 100%, max-w 1400px, margin max(-36px, -2.6vw) auto 200px, padding 0 24px.
- h2: serif clamp(42px, 5.6vw, 84px)/1.02, weight 500, ls -0.02em, mb 18px, color text: "Trusted by creators"
- lede: max-w 640px, clamp(17px, 1.55vw, 22px)/1.45 muted: "From independent creators to nonprofits to global brands, people are using Linen to bring their ideas to life. Here’s what they have to say."
- cards grid: mt 48px, 4 cols gap 22px; ≤1200 2 cols; ≤700 1 col.
- community: mt 56px centered clamp(16px, 1.45vw, 20px) muted: "Join a growing community of creators, organizations, and businesses building a brighter internet with Linen."
- actions: mt 56px, flex wrap center gap 14px: `<diffui-button outline>See pricing</diffui-button>` and `<diffui-button>Launch Linen</diffui-button>`, both --height 52px --padding-x 56px --font-size 18px --font-weight 500.

## ReviewCard
flex col, justify between, gap 16px, padding 20px 24px, border 1px var(--border), radius 12px, bg var(--surface-highlight).
- quote: serif clamp(17px, 1.4vw, 20px)/1.35, text, text-indent -0.42em, wrapped in “ ”.
- who: flex center gap 12px. Avatar 40px round, bg gold-muted, color bg, serif 17px initials (or image cover). Name 15px 500. Role mt 4px mono 11px ls .22em uppercase muted. Stars mt 10px flex gap 4px gold, 15px.

## Data
1. "Linen is the only SaaS tool I need" — Kane Narraway, avatar kane-narraway.webp, 5 stars
2. "I love Linen and I've been using it internally here at Rhombus to really improve many of our designs." — John Anderson, Rhombus
3. "Linen really is the missing piece to my projects; I know what I want the app/site to do functionally, but I struggle with design, so Linen solves that for me!" — @buck
4. "I've been using Linen for several months and the way that it jumpstarts my ideas is unmatched" — Jesse James Clark, Lead UI Developer, Design Systems at Cisco, avatar jesse-james-clark.webp
