"use client";

import { useEffect, useRef } from "react";
import { useLandingTheme, useLinenModules } from "@/lib/linen-runtime";
import type { HeroLinenElement, RiverElement } from "@/types/linen";
import { HeroHeadline } from "./HeroHeadline";
import { LandingFooter } from "./LandingFooter";
import { LandingHeader } from "./LandingHeader";
import { ReviewsSection } from "./ReviewsSection";
import { RibbonDivider } from "./RibbonDivider";
import { RiseCard } from "./RiseCard";
import { TeamAgentSection } from "./TeamAgentSection";

/** 30-day average generation time shown on linen.ai (/api/landing/stats → 39). */
const LATENCY_SECONDS = 39;
const MOBILE_MAX = 760;

const MODULES = [
  "/app/components/diffui-button.js",
  "/landing/components/diffui-hero-linen.js",
  "/landing/components/diffui-landing-canvas-hero.js",
  "/landing/components/diffui-landing-river.js",
  "/landing/components/diffui-landing-team-agent.js",
  "/landing/components/diffui-landing-lit-ribbon.js",
];

/**
 * Port of diffui-landing-page.js's layout glue: sizes the hero fabric so it ends
 * --river-gap above the rise section, lifts the river up behind the fabric and masks
 * it with linen-below.png, and seats the "prompt to page" card on the river's decode line.
 */
function useHeroLayout() {
  const pageRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLElement>(null);
  const canvasSectionRef = useRef<HTMLElement>(null);
  const riseRef = useRef<HTMLElement>(null);
  const linenRef = useRef<HTMLElement>(null);
  const canvasHeroRef = useRef<HTMLElement>(null);
  const riverRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    const headline = headlineRef.current;
    const canvasSection = canvasSectionRef.current;
    const rise = riseRef.current;
    const linen = linenRef.current as HeroLinenElement | null;
    const river = riverRef.current as RiverElement | null;
    if (!page || !headline || !canvasSection || !rise || !linen || !river) return;

    let cancelled = false;
    let frame = 0;
    let riseLift: number | null = null;

    const placeCard = () => {
      const y = river.decodeLineY;
      if (y == null || riseLift == null) return;
      rise.style.setProperty("--decode-line", `${Math.round(y - riseLift)}px`);
      const bandTop = river.bandTopY;
      if (bandTop != null) rise.style.setProperty("--band-top", `${Math.round(bandTop - riseLift)}px`);
    };

    const tuckRiseUnderLinen = () => {
      const fabric = linen.shadowRoot?.querySelector(".fabric");
      if (!fabric) return;
      const box = fabric.getBoundingClientRect();
      const lift = Math.max(0, Math.round(rise.getBoundingClientRect().top - box.top));
      river.style.top = `${-lift}px`;
      river.style.height = `calc(100% + ${lift}px)`;
      river.riseInset = lift;
      riseLift = lift;
      const riverLeft = river.getBoundingClientRect().left;
      const mask = [
        `url("/landing/assets/linen/linen-below.png") ${Math.round(box.left - riverLeft)}px 0 / ${Math.round(box.width)}px ${Math.round(box.height)}px no-repeat`,
        `linear-gradient(transparent ${Math.round(box.height)}px, #000 ${Math.round(box.height)}px) 0 0 / 100% 100% no-repeat`,
      ].join(", ");
      river.style.mask = mask;
      river.style.webkitMask = mask;
      placeCard();
    };

    const layout = () => {
      const pageRect = page.getBoundingClientRect();
      const heading = headline.getBoundingClientRect();
      const top = pageRect.width <= MOBILE_MAX ? heading.bottom - pageRect.top + 8 : 0;
      const gap = parseFloat(getComputedStyle(page).getPropertyValue("--river-gap")) || 0;
      const height = rise.getBoundingClientRect().top - pageRect.top - top - 20 - gap;
      linen.style.setProperty("--linen-top", `${Math.round(top)}px`);
      linen.style.setProperty("--linen-height", `${Math.round(height)}px`);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tuckRiseUnderLinen);
    };

    const observer = new ResizeObserver(layout);
    river.addEventListener("river-decode-line", placeCard);

    // Properties must be assigned after upgrade, or they shadow the class setters.
    Promise.all([
      customElements.whenDefined("diffui-hero-linen"),
      customElements.whenDefined("diffui-landing-river"),
    ]).then(() => {
      if (cancelled) return;
      linen.hero = canvasHeroRef.current;
      river.latency = LATENCY_SECONDS;
      [page, canvasSection, headline].forEach((el) => observer.observe(el));
      layout();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      river.removeEventListener("river-decode-line", placeCard);
    };
  }, []);

  return { pageRef, headlineRef, canvasSectionRef, riseRef, linenRef, canvasHeroRef, riverRef };
}

export function LinenLanding() {
  useLinenModules(...MODULES);
  const theme = useLandingTheme();
  const refs = useHeroLayout();

  return (
    <div className="block overflow-x-clip font-sans text-linen-text">
      <div
        ref={refs.pageRef}
        className="linen-page relative isolate flex min-h-screen flex-col"
      >
        <diffui-hero-linen ref={refs.linenRef} id="heroLinen" className="linen-hero-fabric" data-theme={theme} />
        <LandingHeader theme={theme} />

        <main className="flex min-h-[calc(100vh-130px)] flex-1 flex-col items-center px-6 pt-8 pb-[72px]">
          <HeroHeadline ref={refs.headlineRef} />

          <section
            ref={refs.canvasSectionRef}
            aria-label="Linen canvas demo"
            className="linen-hero-canvas -mx-6 mt-[-32px] mb-0 box-border w-[calc(100%+48px)] max-w-none px-5 pt-2 min-[761px]:mt-[-60px] min-[761px]:mb-2 min-[761px]:pt-0"
          >
            <diffui-landing-canvas-hero
              ref={refs.canvasHeroRef}
              id="canvasHero"
              className="linen-canvas-hero"
              data-theme={theme}
            />
          </section>

          <section
            ref={refs.riseRef}
            aria-label="Designs rising from prompt to page"
            className="linen-rise relative w-full overflow-visible"
          >
            <diffui-landing-river
              ref={refs.riverRef}
              mode="rise"
              className="linen-rise-river absolute top-0 bottom-0 z-[-2] w-screen"
              data-theme={theme}
            />
            <RiseCard latencySeconds={LATENCY_SECONDS} />
          </section>

          <TeamAgentSection theme={theme} />
          <RibbonDivider theme={theme} />
          <ReviewsSection theme={theme} />
        </main>

        <LandingFooter />
      </div>
    </div>
  );
}
