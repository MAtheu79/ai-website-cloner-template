# LandingFooter Specification
- **Target file:** `src/components/linen/LandingFooter.tsx`
- **Interaction model:** hover

grid `minmax(max-content,1fr) auto minmax(max-content,1fr)`, align center, gap 16px 40px, padding 22px 28px, border-top 1px var(--card-border), mono 12px, color muted.
- Brand: flex gap 8px; icon 16px opacity .85; "© {year} Diffui Inc."
- Center nav (gap 10px 22px, nowrap): Contact (mailto:j@linen.ai), Book a demo (https://calendar.app.google/RFwkM1NN4u4g1NQ87), Discord (https://discord.gg/XdXuJSe4Nu), X (https://x.com/heylinen) — external open new tab.
- Legal nav (justify end): Support, Terms of Service, Privacy Policy, Security, Brand, Changelog → linen.ai /support /tos /privacy /security /brand /changelog.
- Link hover: color → gold, 120ms.
- ≤1140: 2 cols `1fr auto`, center justify end, legal full row start. ≤560: 1 col gap 20px, padding 28px 24px 32px, all start, link gap 14px 22px.
