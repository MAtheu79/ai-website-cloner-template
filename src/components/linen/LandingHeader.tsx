"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { LandingTheme, NavItem } from "@/types/linen";

const SITE = "https://linen.ai";

const NAV_LINKS: NavItem[] = [
  { label: "Pricing", href: `${SITE}/pricing` },
  { label: "Learn", href: `${SITE}/learn` },
  { label: "Blog", href: `${SITE}/blog` },
];

const USE_CASES: NavItem[] = [
  { label: "Founders", href: `${SITE}/for/founders` },
  { label: "Bootstrappers", href: `${SITE}/for/bootstrappers` },
];

const navItemClass =
  "inline-flex h-[30px] flex-none cursor-pointer items-center gap-1.5 border-0 bg-transparent px-2.5 font-mono text-[13px] font-medium tracking-[0.2px] text-linen-muted no-underline transition-colors duration-[120ms] ease-in-out hover:text-linen-text";

export function LandingHeader({ theme }: { theme: LandingTheme }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="relative block gap-4 bg-linen-bg p-3.5 min-[761px]:flex min-[761px]:items-center min-[761px]:justify-between min-[761px]:bg-transparent min-[761px]:px-7 min-[761px]:py-[18px]">
      <div className="flex w-full min-w-0 items-start gap-6 min-[761px]:w-auto min-[761px]:items-center">
        <Link
          href="/"
          aria-label="Linen home"
          className="inline-flex min-h-[34px] flex-none items-center gap-2.5 font-[Georgia,'Times_New_Roman',serif] text-[17px] font-medium tracking-[0.2px] text-inherit no-underline min-[761px]:min-h-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/landing/assets/linen-brand-icon.svg" alt="" className="block size-[22px]" />
          <span className="text-[20px] text-linen-text">linen</span>
        </Link>
        <nav
          aria-label="Primary"
          className="flex min-w-0 flex-1 flex-nowrap items-center gap-3 overflow-x-auto min-[761px]:flex-none min-[761px]:flex-wrap min-[761px]:overflow-visible"
        >
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className={navItemClass}>
              {link.label}
            </a>
          ))}
          <div ref={wrapRef} className="relative hidden min-[761px]:block">
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className={cn(navItemClass, open && "text-linen-text")}
            >
              Use cases
              <ChevronDownIcon
                className={cn("size-2.5 transition-transform duration-[120ms] ease-in-out", open && "rotate-180")}
              />
            </button>
            {open && (
              <div className="absolute top-[calc(100%+6px)] left-0 z-20 min-w-[168px] rounded-[8px] bg-linen-menu p-1.5 shadow-[0_0_0_1px_var(--header-menu-rim),0_4px_12px_rgba(0,0,0,0.18),0_14px_28px_rgba(0,0,0,0.18)]">
                {USE_CASES.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex min-h-[34px] items-center rounded-[4px] px-2.5 py-2 font-mono text-[13px] leading-[1.35] font-medium text-linen-muted no-underline transition-[color,background] duration-[120ms] ease-in-out hover:bg-linen-menu-hover hover:text-linen-text"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
      <div className="absolute top-3.5 right-3.5 flex items-center gap-2.5 min-[761px]:static">
        <diffui-button className="linen-btn-header" subtle
          type="button"
          data-theme={theme}
          onClick={() => window.location.assign("https://linen.ai/app")}
        >
          Sign in / up
        </diffui-button>
      </div>
    </header>
  );
}
