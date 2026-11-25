import type { NavItem } from "@/types/linen";

const CONTACT: NavItem[] = [
  { label: "Contact", href: "mailto:j@linen.ai" },
  { label: "Book a demo", href: "https://calendar.app.google/RFwkM1NN4u4g1NQ87" },
  { label: "Discord", href: "https://discord.gg/XdXuJSe4Nu" },
  { label: "X", href: "https://x.com/heylinen" },
];

const LEGAL: NavItem[] = [
  { label: "Support", href: "https://linen.ai/support" },
  { label: "Terms of Service", href: "https://linen.ai/tos" },
  { label: "Privacy Policy", href: "https://linen.ai/privacy" },
  { label: "Security", href: "https://linen.ai/security" },
  { label: "Brand", href: "https://linen.ai/brand" },
  { label: "Changelog", href: "https://linen.ai/changelog" },
];

const linkClass =
  "whitespace-nowrap text-linen-muted no-underline transition-colors duration-[120ms] ease-in-out hover:text-linen-gold";

function isExternal(href: string) {
  return href.startsWith("http") && !href.startsWith("https://linen.ai");
}

export function LandingFooter() {
  return (
    <footer className="grid w-full grid-cols-1 items-center gap-5 border-t border-linen-card-border px-6 pt-7 pb-8 font-mono text-[12px] text-linen-muted min-[561px]:grid-cols-[1fr_auto] min-[561px]:gap-x-10 min-[561px]:gap-y-3.5 min-[561px]:px-7 min-[561px]:py-[22px] min-[1141px]:grid-cols-[minmax(max-content,1fr)_auto_minmax(max-content,1fr)] min-[1141px]:gap-y-4">
      <div className="flex items-center gap-2 justify-self-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/landing/assets/linen-brand-icon.svg" alt="" className="block size-4 opacity-85" />
        <span>&copy; {new Date().getFullYear()} Diffui Inc.</span>
      </div>
      <nav
        aria-label="Contact"
        className="flex flex-wrap items-center gap-x-[22px] gap-y-3.5 justify-self-start min-[561px]:gap-y-2.5 min-[561px]:justify-self-end min-[1141px]:justify-self-center"
      >
        {CONTACT.map((l) => (
          <a
            key={l.label}
            href={l.href}
            className={linkClass}
            {...(isExternal(l.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {l.label}
          </a>
        ))}
      </nav>
      <nav
        aria-label="Legal"
        className="flex flex-wrap items-center gap-x-[22px] gap-y-3.5 justify-self-start min-[561px]:col-span-full min-[561px]:gap-y-2.5 min-[1141px]:col-span-1 min-[1141px]:justify-self-end"
      >
        {LEGAL.map((l) => (
          <a key={l.label} href={l.href} className={linkClass}>
            {l.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
