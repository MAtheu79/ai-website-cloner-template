// Linen's downloadable brand files and the colour tokens the /brand page documents. The logo
// right-click menu, /brand, and /partnerships all read from here so they offer the same files.

export const BRAND_PAGE_PATH = "/brand";

export const LIGHT_LOGO_URL = "/landing/assets/partnerships/linen-wordmark-light.png";
export const DARK_LOGO_URL = "/landing/assets/partnerships/linen-wordmark-dark.png";

const BRAND_DIR = "/landing/assets/brand";

export const BRAND_ASSETS_ZIP = {
  id: "brand-assets",
  label: "brand assets",
  url: `${BRAND_DIR}/linen-brand-assets.zip`,
  filename: "linen-brand-assets.zip",
  bytes: 37675158,
};

export const LOGO_ASSETS = [
  {
    id: "light",
    label: "light logo",
    title: "Light wordmark",
    usage: "For dark backgrounds",
    url: LIGHT_LOGO_URL,
    filename: "linen-logo-light.png",
    previewBackground: "dark",
  },
  {
    id: "dark",
    label: "dark logo",
    title: "Dark wordmark",
    usage: "For light backgrounds",
    url: DARK_LOGO_URL,
    filename: "linen-logo-dark.png",
    previewBackground: "light",
  },
];

function creativeAsset(kind, n, title, width, height, bytes) {
  const base = `${BRAND_DIR}/linen-${kind}-${n}`;
  return {
    id: `${kind}-${n}`,
    title,
    url: `${base}.png`,
    previewUrl: `${base}_preview.webp`,
    filename: `linen-${kind}-${n}.png`,
    width,
    height,
    bytes,
  };
}

export const FABRIC_LOGOS = [
  creativeAsset("fabric-logo", 1, "Fabric logo 1", 1152, 2048, 5806940),
  creativeAsset("fabric-logo", 2, "Fabric logo 2", 1808, 1440, 5871103),
  creativeAsset("fabric-logo", 3, "Fabric logo 3", 1152, 2048, 5618690),
  creativeAsset("fabric-logo", 4, "Fabric logo 4", 1152, 2048, 5370041),
  creativeAsset("fabric-logo", 5, "Fabric logo 5", 1152, 2048, 5542696),
];

export const BLOBS = [
  creativeAsset("blob", 1, "Blob 1", 1120, 1248, 2775981),
  creativeAsset("blob", 2, "Blob 2", 1936, 1456, 4931620),
  creativeAsset("blob", 3, "Blob 3", 1120, 1248, 2422361),
];

/**
 * The colour tokens worth knowing, with their light and dark values exactly as
 * landing-theme.css declares them (`--token: light-dark(light, dark)`).
 */
export const BRAND_COLORS = [
  { name: "Linen gold", token: "--landing-gold", role: "Primary brand colour: active links, highlights, focus.", light: "#9b7130", dark: "#d4a640" },
  { name: "Signal yellow", token: "--brand-gold", role: "Brand accent for buttons and outlines.", light: "#9b7130", dark: "#ffcc00" },
  { name: "Background", token: "--landing-bg", role: "Page background.", light: "#f8f6f2", dark: "#0b0d10" },
  { name: "Surface", token: "--landing-panel", role: "Panels and cards on the background.", light: "#fcfbf8", dark: "#0f1318" },
  { name: "Text", token: "--landing-text", role: "Body text and icons.", light: "#1a1c1e", dark: "#e6edf3" },
  { name: "Muted text", token: "--landing-muted", role: "Secondary text and captions.", light: "#5c6570", dark: "#9aa6b2" },
  { name: "Link", token: "--landing-link", role: "Inline links in long-form copy.", light: "#8b6428", dark: "#f0c96e" },
  { name: "Accent blue", token: "--accent", role: "Links on the legal and changelog pages.", light: "#1f6fd0", dark: "#4aa3ff" },
];

export function formatBytes(bytes) {
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1e3))} KB`;
}
