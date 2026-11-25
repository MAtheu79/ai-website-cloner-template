"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { LandingTheme } from "@/types/linen";

/**
 * The fabric, river, canvas demo and team demos are linen.ai's own WebGL / canvas
 * custom elements, served from public/landing and public/app. They are loaded as
 * native ES modules at runtime (never bundled), exactly as the original page does.
 */
const pending = new Map<string, Promise<void>>();

export function loadLinenModule(src: string): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  let p = pending.get(src);
  if (!p) {
    p = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.type = "module";
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
    pending.set(src, p);
  }
  return p;
}

/** Loads the given modules once on mount. */
export function useLinenModules(...srcs: string[]) {
  const key = srcs.join("|");
  useEffect(() => {
    key.split("|").forEach((src) => {
      loadLinenModule(src).catch((err: unknown) => console.error(err));
    });
  }, [key]);
}

function readTheme(): LandingTheme {
  return document.documentElement.dataset.landingTheme === "dark" ? "dark" : "light";
}

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-landing-theme"] });
  const media = matchMedia("(prefers-color-scheme: light)");
  const onMedia = (e: MediaQueryListEvent) => {
    let stored = "";
    try {
      stored = localStorage.getItem("diffui-landing-theme") || "";
    } catch {}
    if (stored) return;
    const next = e.matches ? "light" : "dark";
    document.documentElement.dataset.landingTheme = next;
    document.documentElement.dataset.theme = next;
  };
  media.addEventListener("change", onMedia);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onMedia);
  };
}

/** Current landing theme; vendored elements read it from their data-theme attribute. */
export function useLandingTheme(): LandingTheme {
  return useSyncExternalStore(subscribeTheme, readTheme, () => "light");
}
