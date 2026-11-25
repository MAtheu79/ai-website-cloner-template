# TeamAgentSection + RibbonDivider Specification
- **Target files:** `src/components/linen/TeamAgentSection.tsx`, `src/components/linen/RibbonDivider.tsx`
- **Interaction model:** time-driven demos (vendored `<diffui-landing-team-agent>`), pointer-lit ribbon (vendored `<diffui-landing-lit-ribbon base=/landing/assets/ribbon/>`)

Team section: block, align-self stretch, margin 0 -24px (full bleed); host styles internal (padding 48px max(48px, (100%−1600px)/2+24px) 64px, bg #f1ede5/#121519). Content (verbatim, rendered by element): "Works with your team.", "Works with your agent.", "Works with your brand." + demos.
Ribbon: relative, stretch, margin max(-140px, -10.1vw) -24px 0, aspect 2048/1000, pointer-events none; ::before z −1 band color clipped by centerline polygon (see globals.css). Ribbon element absolute inset 0. Both receive `data-theme`.
