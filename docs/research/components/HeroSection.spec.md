# HeroSection Specification
- **Target files:** `src/components/linen/HeroHeadline.tsx`, `src/components/linen/LinenLanding.tsx` (layout glue `useHeroLayout`)
- **Interaction model:** static text; fabric + canvas demo are vendored time/pointer-driven engines

## main
flex column, align center, min-h calc(100vh - 130px), padding 32px 24px 72px.

## Headline `.heroBlock`
max-w 960px, centered text, margin 40px auto.
- h1: serif, font-size clamp(40px, 6vw, 68px), line-height 1.05, weight 500, letter-spacing -0.5px, margin 0 0 18px. Text: "Design fabric<br/>for the AI era."
- p: 16px/1.5, color muted. "AI-driven design generation that's **fast, brand-compliant,** and **built for creativity.**" — accents color gold (#9b7130 light), weight 600.

## Canvas wrapper `.heroCanvas`
width calc(100% + 48px), margin 0 -24px 8px, margin-top -60px, relative, top clamp(-40px, (1100px - 100vw)*.2, 0px), padding 0 20px. Child: `<diffui-landing-canvas-hero class=linen-canvas-hero>` with --node-emission-shadow `0 0 22px rgba(255,225,166,.176), 0 0 60px rgba(255,222,160,.096)`; stage aspect 2/1. ≤760: margin-top -32px, padding-top 8px, mb 0, top 0; child width 200%, scale(.6) origin top-left, mb -35%, ml -10%.

## Fabric `<diffui-hero-linen>`
absolute, inset var(--linen-top) 0 auto, height var(--linen-height), width 109%, z -1, overflow clip. `.hero` = canvas-hero element.
Layout (ResizeObserver on page, canvas section, headline): top = ≤760 ? headline.bottom − page.top + 8 : 0; height = riseSection.top − page.top − top − 20 − river-gap(200).
Then river: lift = riseSection.top − fabric.top; river.top = −lift, height calc(100% + lift), riseInset = lift; mask = `url(/landing/assets/linen/linen-below.png) {fabric.left−river.left}px 0 / {w}px {h}px no-repeat, linear-gradient(transparent {h}px, #000 {h}px) 0 0/100% 100% no-repeat`.
