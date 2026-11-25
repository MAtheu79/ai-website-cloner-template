// The decrypt reveal's look, locked in after tuning. Every design generated
// while the canvas is open arrives as glyphs and decodes left to right; a
// section waits for its crop first.
export const DECRYPT_CHARSET = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join("");

// What the glyphs sit on, per canvas theme. The reveal's waiting field uses the
// same colour, so the handover from field to glyphs happens on one surface.
export const DECRYPT_BACKDROP = Object.freeze({ dark: "#0b0d10", light: "#f7f5ef" });

/**
 * What a frame's cipher should be doing for where its image is in its life.
 *   "hold":   the image is unfinished (still generating, or a section waiting
 *             for its crop), so it stays covered, whether or not it is selected.
 *   "reveal": the image is finished and either was generated while this canvas
 *             was open (live) or is still wearing its cipher (covered): wipe it
 *             in, once.
 *   "none":   a finished image with neither. Saved designs, and options that
 *             finished out of sight, show plainly.
 */
export function decryptPhase({ loading, cropPending, live, covered }) {
  if (loading || cropPending) return "hold";
  return live || covered ? "reveal" : "none";
}

export const DECRYPT_OPTIONS = Object.freeze({
  duration: 1400, // ms for the wipe
  cell: 9, // glyph cell height, CSS px
  aspect: 0.62, // cell width / height
  weight: 500,
  colored: 0.85, // how much glyphs keep the image's colour
  color: "#d4a94a", // cipher tint
  brightness: 1.15,
  legibility: 0.45,
  threshold: 0.04, // contrast under which a cell stays blank
  scramble: 0.12,
  scrambleSpeed: 8,
  edge: 0.18, // wipe band width, fraction of the width
  flicker: 0.85,
  glow: 1.2,
  tint: 0.45,
  aberration: 6, // px
  jag: 0.5, // ragged wipe front
  scatter: 0.75, // how unevenly cells decode inside the band
  passthrough: 0.1, // image showing through the cipher
  morph: 1500, // ms between in-progress versions (partials, uncropped final)
  finalMorph: 750, // ms wipe onto the final cropped version
  morphGrain: 1,
  morphNoise: 0.6,
});

/** Ease-in-out wipe progress 0..1 for elapsed/duration. */
export function decryptEase(t) {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/** Where an image's pixels land inside its box for an object-fit value. */
export function fitContentRect(box, naturalWidth, naturalHeight, fit) {
  if (!(naturalWidth > 0 && naturalHeight > 0) || (fit !== "cover" && fit !== "contain")) return { ...box };
  const scale = fit === "cover"
    ? Math.max(box.width / naturalWidth, box.height / naturalHeight)
    : Math.min(box.width / naturalWidth, box.height / naturalHeight);
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  return { x: box.x + (box.width - width) / 2, y: box.y + (box.height - height) / 2, width, height };
}

/** Parse "#rgb" / "#rrggbb" to 0..1 floats; falls back to black. */
export function hexToRgb(hex) {
  let value = String(hex || "").trim().replace(/^#/, "");
  if (value.length === 3) value = value.split("").map(c => c + c).join("");
  const n = /^[0-9a-f]{6}$/i.test(value) ? parseInt(value, 16) : 0;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * Whether the reveal's source moved on enough to morph: a new image always
 * does; a reframing does only when no morph is running, so a height tween that
 * moves the image every frame starts one morph instead of restarting it.
 */
export function decryptSourceChanged(last, next, morphing) {
  if (!last) return false;
  if (last.key !== next.key) return true;
  if (morphing) return false;
  const a = last.rect;
  const b = next.rect;
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.width - b.width), Math.abs(a.height - b.height)) > 0.004;
}
