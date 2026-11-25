import type { LandingTheme } from "@/types/linen";

/**
 * Team / agent / brand rows — linen.ai's animated demos (vendored element).
 * The host padding is restated here: Tailwind's preflight reset on `*` outranks
 * the element's own `:host { padding }` rule.
 */
export function TeamAgentSection({ theme }: { theme: LandingTheme }) {
  return (
    <diffui-landing-team-agent
      className="-mx-6 box-border block w-auto self-stretch px-[max(48px,calc((100%-1600px)/2+24px))] pt-12 pb-16"
      aria-label="Teams and agents"
      data-theme={theme}
    />
  );
}
