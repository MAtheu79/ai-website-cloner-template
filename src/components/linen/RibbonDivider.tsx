import type { LandingTheme } from "@/types/linen";

/** Gold linen ribbon (WebGL) dividing the team band from the reviews. */
export function RibbonDivider({ theme }: { theme: LandingTheme }) {
  return (
    <div aria-hidden="true" className="linen-ribbon pointer-events-none relative self-stretch">
      <diffui-landing-lit-ribbon className="absolute inset-0" base="/landing/assets/ribbon/" data-theme={theme} />
    </div>
  );
}
