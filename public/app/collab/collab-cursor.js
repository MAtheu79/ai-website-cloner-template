import { DIFFUI_COLLAB_COLORS, resolveCollabColor } from "./collab-colors.js";

/** Hotspot in 1x display pixels (assets are 2x at 64×64, drawn at 32×32). */
export const COLLAB_CURSOR_HOTSPOT = { x: 9.7028, y: 10.7728 };
export const COLLAB_CURSOR_DISPLAY_SIZE = 32;

const imageCache = new Map();
const textLayoutCache = new Map();
const TEXT_LAYOUT_CACHE_LIMIT = 256;
const CURSOR_FONT = '400 12px "Geist Mono", "JetBrains Mono", monospace';

// Measurements taken with a fallback font must not survive the web font loading.
if (typeof document !== "undefined") {
  document.fonts?.addEventListener("loadingdone", () => textLayoutCache.clear());
}

function textLayout(ctx, text, chat = false, maxWidth = 240) {
  const key = JSON.stringify([chat, maxWidth, text]);
  const cached = textLayoutCache.get(key);
  if (cached) {
    textLayoutCache.delete(key);
    textLayoutCache.set(key, cached);
    return cached;
  }
  const previousFont = ctx.font;
  ctx.font = CURSOR_FONT;
  const lines = chat ? wrapChatLines(ctx, text, maxWidth - 16) : [text];
  let innerWidth = 0;
  for (const line of lines) innerWidth = Math.max(innerWidth, ctx.measureText(line).width);
  ctx.font = previousFont;
  const layout = {
    lines,
    width: chat ? Math.min(maxWidth, innerWidth + 16) : innerWidth + 12,
    height: chat ? 4 + lines.length * 16 : 16,
  };
  textLayoutCache.set(key, layout);
  if (textLayoutCache.size > TEXT_LAYOUT_CACHE_LIMIT) textLayoutCache.delete(textLayoutCache.keys().next().value);
  return layout;
}

/** Include both the arrow and bubble, so labels crossing a viewport edge stay visible. */
export function isCollabCursorVisible(ctx, x, y, text, chat, width, height) {
  if (x - COLLAB_CURSOR_HOTSPOT.x > width + 4 || y - COLLAB_CURSOR_HOTSPOT.y > height + 4) return false;
  const layout = textLayout(ctx, String(text || "").trim(), chat);
  const right = x + Math.max(COLLAB_CURSOR_DISPLAY_SIZE - COLLAB_CURSOR_HOTSPOT.x, 14 + layout.width) + 4;
  const bottom = y + Math.max(COLLAB_CURSOR_DISPLAY_SIZE - COLLAB_CURSOR_HOTSPOT.y, 12 + layout.height) + 6;
  return right >= 0 && bottom >= 0;
}

function cursorHexKey(color) {
  const resolved = resolveCollabColor(color, "cursor");
  return String(resolved || "#236B42")
    .replace(/^#/, "")
    .toUpperCase();
}

function cursorAssetUrl(color) {
  const hex = cursorHexKey(color);
  if (!DIFFUI_COLLAB_COLORS.some((entry) => entry.replace(/^#/, "").toUpperCase() === hex)) {
    return `/app/assets/collab-cursors/236B42.png`;
  }
  return `/app/assets/collab-cursors/${hex}.png`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function getCursorImageEntry(color, onReady) {
  const key = cursorHexKey(color);
  let entry = imageCache.get(key);
  if (!entry) {
    const img = new Image();
    entry = { img, loaded: false, failed: false, waiters: new Set() };
    if (onReady) entry.waiters.add(onReady);
    img.onload = () => {
      entry.loaded = true;
      const waiters = [...entry.waiters];
      entry.waiters.clear();
      for (const fn of waiters) fn();
    };
    img.onerror = () => {
      entry.loaded = false;
      entry.failed = true;
      entry.waiters.clear();
    };
    img.src = cursorAssetUrl(color);
    imageCache.set(key, entry);
  } else if (!entry.loaded && !entry.failed && onReady) {
    entry.waiters.add(onReady);
  }
  return entry;
}

export function drawCollabCursor(ctx, screenX, screenY, color, onReady) {
  const entry = getCursorImageEntry(color, onReady);
  if (!entry.loaded || !entry.img.naturalWidth) return false;
  const size = COLLAB_CURSOR_DISPLAY_SIZE;
  ctx.drawImage(
    entry.img,
    screenX - COLLAB_CURSOR_HOTSPOT.x,
    screenY - COLLAB_CURSOR_HOTSPOT.y,
    size,
    size,
  );
  return true;
}

export function drawCollabCursorLabel(ctx, screenX, screenY, label, color) {
  const text = String(label || "").trim();
  if (!text) return;
  const padX = 6;
  const radius = 2;
  const offsetX = 14;
  const offsetY = 12;

  ctx.save();
  ctx.font = CURSOR_FONT;
  const { width: w, height: h } = textLayout(ctx, text);
  const lx = screenX + offsetX;
  const ly = screenY + offsetY;

  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 2;
  ctx.fillStyle = resolveCollabColor(color, "label");
  roundRect(ctx, lx, ly, w, h, radius);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  ctx.fillText(text, lx + padX, ly + h / 2);
  ctx.restore();
}

function wrapChatLines(ctx, text, maxInnerWidth) {
  const paragraphs = String(text || "").split("\n");
  const lines = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) {
      if (paragraph === "") lines.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxInnerWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      let chunk = "";
      for (const ch of word) {
        const next = `${chunk}${ch}`;
        if (ctx.measureText(next).width > maxInnerWidth && chunk) {
          lines.push(chunk);
          chunk = ch;
        } else {
          chunk = next;
        }
      }
      line = chunk;
    }
    if (line) lines.push(line);
  }
  return lines.length ? lines : [""];
}

export function drawCollabChatBubble(ctx, screenX, screenY, text, color, options = {}) {
  const raw = String(text || "").trim();
  if (!raw) return;
  const maxWidth = Number(options.maxWidth) > 0 ? Number(options.maxWidth) : 240;
  const opacity = Number.isFinite(options.opacity) ? Math.max(0, Math.min(1, options.opacity)) : 1;
  if (opacity <= 0) return;
  const padX = 8;
  const padY = 4;
  const fontSize = 12;
  const lineHeight = fontSize + 4;
  const radius = 4;
  const offsetX = 14;
  const offsetY = 12;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.font = CURSOR_FONT;
  const { lines, width: w, height: h } = textLayout(ctx, raw, true, maxWidth);
  const lx = screenX + offsetX;
  const ly = screenY + offsetY;

  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 2;
  ctx.fillStyle = resolveCollabColor(color, "label");
  roundRect(ctx, lx, ly, w, h, radius);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#fff";
  ctx.textBaseline = "top";
  lines.forEach((line, index) => {
    ctx.fillText(line, lx + padX, ly + padY + index * lineHeight);
  });
  ctx.restore();
}
