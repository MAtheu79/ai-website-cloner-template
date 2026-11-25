const THEME_KEY = "diffui-landing-theme";
const THEME_EVENT = "diffui-landing-theme-change";
const media = window.matchMedia("(prefers-color-scheme: light)");

function storedTheme() {
  let value = "";
  try {
    value = localStorage.getItem(THEME_KEY);
  } catch {
    return "";
  }
  return value === "light" || value === "dark" ? value : "";
}

export function currentLandingTheme() {
  return storedTheme() || (media.matches ? "light" : "dark");
}

export function setLandingTheme(theme, { persist = true } = {}) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.landingTheme = next;
  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // The document theme still applies when storage is unavailable.
    }
  }
  document.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme: next } }));
  return next;
}

export function toggleLandingTheme() {
  return setLandingTheme(currentLandingTheme() === "light" ? "dark" : "light");
}

function syncThemeTargets(host, theme) {
  host.dataset.theme = theme;
  host.shadowRoot?.querySelectorAll("*").forEach((element) => {
    if (element.localName.includes("-")) element.setAttribute("data-theme", theme);
  });
}

export function connectLandingTheme(host) {
  const sync = (event) => syncThemeTargets(host, event?.detail?.theme || currentLandingTheme());
  document.addEventListener(THEME_EVENT, sync);
  sync();
  return () => document.removeEventListener(THEME_EVENT, sync);
}

document.documentElement.dataset.landingTheme = currentLandingTheme();
document.addEventListener("diffui-landing-theme-toggle", (event) => {
  event.stopPropagation();
  toggleLandingTheme();
});
media.addEventListener("change", (event) => {
  if (storedTheme()) return;
  // App/browse views own theme via data-app-theme; don't reintroduce landing theme there.
  if (!document.documentElement.dataset.landingTheme) return;
  setLandingTheme(event.matches ? "light" : "dark", { persist: false });
});
