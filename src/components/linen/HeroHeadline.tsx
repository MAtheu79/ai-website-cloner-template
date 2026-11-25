import type { Ref } from "react";

export function HeroHeadline({ ref }: { ref?: Ref<HTMLElement> }) {
  return (
    <section ref={ref} className="mx-auto my-10 max-w-[960px] text-center">
      <h1 className="m-0 mb-[18px] font-serif text-[clamp(40px,6vw,68px)] leading-[1.05] font-medium tracking-[-0.5px]">
        Design fabric
        <br />
        for the AI era.
      </h1>
      <p className="m-0 text-[16px] leading-[1.5] text-linen-muted">
        AI-driven design generation that&apos;s{" "}
        <span className="font-semibold text-linen-gold">fast, brand-compliant,</span> and{" "}
        <span className="font-semibold text-linen-gold">built for creativity.</span>
      </p>
    </section>
  );
}
