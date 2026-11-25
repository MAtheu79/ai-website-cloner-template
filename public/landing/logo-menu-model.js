// The logo right-click menu: which brand files it offers and how each item acts on them.

import { BRAND_ASSETS_ZIP, BRAND_PAGE_PATH, LOGO_ASSETS } from "./brand-assets.js";

/** Menu entries in display order; a `separator: true` entry starts a new group. */
export function logoMenuItems() {
  return [
    ...LOGO_ASSETS.map((asset) => ({ action: "copy", asset, label: `Copy ${asset.label}`, icon: "copy" })),
    ...LOGO_ASSETS.map((asset) => ({ action: "download", asset, label: `Download ${asset.label}`, icon: "download" })),
    { action: "download", asset: BRAND_ASSETS_ZIP, label: "Download brand assets", icon: "archive" },
    { separator: true },
    { action: "link", href: BRAND_PAGE_PATH, label: "Brand guidelines", icon: "book" },
  ];
}

export function isSvgAsset(asset) {
  return /\.svg(?:$|[?#])/i.test(asset.url);
}

/**
 * Copies a logo: SVG markup as text, a raster as an image/png ClipboardItem. The PNG blob is
 * handed to ClipboardItem as a promise so the write starts inside the click's user activation
 * (Safari rejects a clipboard write that only begins after an awaited fetch).
 */
export async function copyLogoToClipboard(asset, {
  fetchImpl = globalThis.fetch,
  clipboard = globalThis.navigator?.clipboard,
  ClipboardItemImpl = globalThis.ClipboardItem,
} = {}) {
  if (!clipboard) throw new Error("clipboard unavailable");
  if (isSvgAsset(asset)) {
    const markup = await fetchOk(fetchImpl, asset.url).then((res) => res.text());
    await clipboard.writeText(markup);
    return "text/plain";
  }
  if (!ClipboardItemImpl || !clipboard.write) throw new Error("image clipboard unavailable");
  const png = fetchOk(fetchImpl, asset.url)
    .then((res) => res.blob())
    .then((blob) => (blob.type === "image/png" ? blob : new Blob([blob], { type: "image/png" })));
  await clipboard.write([new ClipboardItemImpl({ "image/png": png })]);
  return "image/png";
}

async function fetchOk(fetchImpl, url) {
  const res = await fetchImpl(url, { credentials: "same-origin" });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res;
}

/** Roving focus for the menu's keyboard handling; returns -1 for keys it does not handle. */
export function nextMenuIndex(current, key, count) {
  if (count <= 0) return -1;
  switch (key) {
    case "ArrowDown":
      return current < 0 ? 0 : (current + 1) % count;
    case "ArrowUp":
      return current < 0 ? count - 1 : (current - 1 + count) % count;
    case "Home":
    case "PageUp":
      return 0;
    case "End":
    case "PageDown":
      return count - 1;
    default:
      return -1;
  }
}

/** Places the menu under the anchor's left edge, kept inside the viewport. */
export function menuPosition(anchorRect, menuSize, viewport, gap = 6, margin = 8) {
  let left = anchorRect.left;
  let top = anchorRect.bottom + gap;
  left = Math.min(left, viewport.width - menuSize.width - margin);
  left = Math.max(margin, left);
  if (top + menuSize.height > viewport.height - margin && anchorRect.top - gap - menuSize.height >= margin) {
    top = anchorRect.top - gap - menuSize.height;
  }
  return { left: Math.round(left), top: Math.round(top) };
}
