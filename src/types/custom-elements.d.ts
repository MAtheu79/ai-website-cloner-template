import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ElementProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  "data-theme"?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "diffui-button": ElementProps & { type?: string; subtle?: boolean; outline?: boolean };
      "diffui-hero-linen": ElementProps;
      "diffui-landing-canvas-hero": ElementProps;
      "diffui-landing-river": ElementProps & { mode?: string };
      "diffui-landing-team-agent": ElementProps;
      "diffui-landing-lit-ribbon": ElementProps & { base?: string };
    }
  }
}
