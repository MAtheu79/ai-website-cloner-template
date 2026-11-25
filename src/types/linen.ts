export type LandingTheme = "light" | "dark";

export interface NavItem {
  label: string;
  href: string;
}

export interface Review {
  quote: string;
  name: string;
  role?: string;
  avatar?: string;
  rating?: number;
}

/** Imperative surface of the vendored <diffui-landing-river> element. */
export interface RiverElement extends HTMLElement {
  riseInset: number;
  latency: number;
  readonly decodeLineY: number | null;
  readonly bandTopY: number | null;
}

/** Imperative surface of the vendored <diffui-hero-linen> element. */
export interface HeroLinenElement extends HTMLElement {
  hero: HTMLElement | null;
}
