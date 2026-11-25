# RiseCard Specification
- **Target file:** `src/components/linen/RiseCard.tsx`
- **Interaction model:** static, positioned from river `decodeLineY` / `bandTopY`

## Section `.riseSection`
relative, w 100%, height clamp(400px, 64vw − 300px, 850px), margin-top calc(128px + 200px). River absolute top/bottom 0, left calc(50% − 50vw), w 100vw, z −2, --river-floor #f1ede5 / #121519.

## Card wrapper
absolute left/right 0, top var(--decode-line, 28%), translateY(-50%), z 1, w 100%, max-w 1600px, margin 0 auto, padding 0 24px, pointer-events none.

## Plate
margin-left auto, w min(440px, 100%), padding 36px 36px 30px, radius 11px, border 1px color-mix(text 9%), bg color-mix(bg 86%), backdrop-filter blur(18px) saturate(1.1), shadow `0 30px 80px rgba(16,12,6,.24), 0 4px 14px rgba(16,12,6,.1)`, text-align left.
- h2 serif clamp(32px, 3.1vw, 42px)/1.08, weight 500, ls -0.5px, mb 18px: "From prompt to page in <gold>39 seconds</gold><sup gold 0.55em 600 ml 2px>*</sup>"
- p: clamp(16px, 1.35vw, 19px)/1.55 muted: "Linen generates at the speed of exploration. Don't derail your train of thought, test and explore directions live."
- note: mt 26px, pt 20px, border-top 1px color-mix(text 14%), 13px/1.5 muted: "*Average time from prompt to finished design across every Linen generation in the last 30 days."

## ≤760px
wrapper top calc(var(--band-top) + 28px), translateY(-100%), padding 0 16px. Plate w min(340px,100%), centered, padding 22px 22px 18px; h2 28px mb 12px; p 15px/1.5; note mt 16px pt 14px 11.5px.
