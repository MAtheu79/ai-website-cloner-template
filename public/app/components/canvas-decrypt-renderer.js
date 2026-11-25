// One shared WebGL2 context draws every decrypt reveal on the page, so any
// number of sections can decrypt without running into the browser's limit on
// live WebGL contexts. The context lives on an OffscreenCanvas of a stable
// size: each reveal renders into its top-left corner and the whole frame is
// handed to the reveal's own <canvas> as an ImageBitmap (no copy, no GPU
// sync), which the reveal clips to its section. Copying a WebGL canvas into
// a 2D canvas instead made the browser wait on the GPU every frame and could
// halve the page's frame rate; that path remains only as a fallback.
//
// Section images become textures from a background decode at no more than
// MAX_TEXTURE_WIDTH, so a new image never blocks the page while it uploads.
// The section image itself is the source texture, so no HTML-in-canvas
// capture is needed.
import { DECRYPT_BACKDROP, DECRYPT_CHARSET, DECRYPT_OPTIONS, hexToRgb } from "./canvas-decrypt-options.js";

const VERT = `#version 300 es
layout(location = 0) in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform sampler2D uImage;
uniform sampler2D uAtlas;
uniform vec2 uRes;
uniform float uFlipY;
uniform vec4 uImgRect;
uniform vec2 uCell;
uniform vec2 uAtlasGrid;
uniform float uGlyphCount;
uniform float uFront;
uniform float uEdge;
uniform float uJag;
uniform float uScatter;
uniform float uTime;
uniform float uSeed;
uniform float uScramble;
uniform float uScrambleSpeed;
uniform float uFlicker;
uniform float uGlow;
uniform float uTint;
uniform float uColored;
uniform vec3 uColor;
uniform vec3 uBgColor;
uniform float uPassthrough;
uniform float uAberration;
uniform float uBrightness;
uniform float uLegibility;
uniform float uThreshold;
uniform sampler2D uPrev;
uniform vec4 uPrevRect;
uniform float uMorph;
uniform float uMorphGrain;
uniform float uMorphNoise;
uniform int uMorphWipe;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21) + uSeed);
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

// Each cell shows either the previous source or the new one while a morph
// runs, so a change of image or framing resolves glyph by glyph.
bool useNew = true;
vec4 fromRect(sampler2D tex, vec4 rect, vec2 px, float lod) {
  vec2 uv = (px - rect.xy) / rect.zw;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return vec4(0.0);
  return textureLod(tex, uv, lod);
}
vec4 img(vec2 px, float lod) {
  return useNew ? fromRect(uImage, uImgRect, px, lod) : fromRect(uPrev, uPrevRect, px, lod);
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uFlipY - gl_FragCoord.y);
  vec2 cell = floor(px / uCell);
  vec2 local = fract(px / uCell);
  vec2 center = (cell + 0.5) * uCell;
  vec2 n = center / uRes;

  // The wipe runs left to right.
  float s = n.x;
  float lane = cell.y;
  // A ragged front: each row (column for top-down) runs a little ahead or behind.
  float wobble = (hash(vec2(lane, 1.7)) - 0.5) * 0.5 + (hash(vec2(floor(lane / 5.0), 3.1)) - 0.5);
  s += wobble * uJag * 0.12;
  float b = clamp((uFront - s) / max(uEdge, 1e-4), 0.0, 1.0);
  if (b >= 1.0) { outColor = vec4(0.0); return; }

  float noisy = 0.0;
  if (uMorph < 1.0) {
    vec2 group = floor(cell / max(uMorphGrain, 1.0));
    float window = 0.08 + 0.3 * uMorphNoise;
    // A wipe settles cells along the reveal direction; otherwise at random.
    float at = (uMorphWipe == 1 ? clamp(s, 0.0, 1.0) : hash(group + 11.0)) * (1.0 - window);
    useNew = uMorph >= at + window;
    noisy = (uMorph >= at && !useNew) ? uMorphNoise : 0.0;
    if (uMorph >= at + window * 0.5) useNew = true;
  }
  vec2 texSize = useNew ? vec2(textureSize(uImage, 0)) : vec2(textureSize(uPrev, 0));
  float maxLod = floor(log2(max(texSize.x, texSize.y)));
  vec3 avg = useNew ? textureLod(uImage, vec2(0.5), maxLod).rgb : textureLod(uPrev, vec2(0.5), maxLod).rgb;
  float texPerPx = texSize.x / max((useNew ? uImgRect.z : uPrevRect.z), 1.0);
  vec4 cellSample = img(center, log2(max(uCell.x * texPerPx, 1.0)));
  vec3 cellCol = cellSample.rgb;
  float level = clamp(luma(abs(cellCol - avg)) * 2.2 * uBrightness, 0.0, 1.0);

  float idx = floor(level * (uGlyphCount - 1.0) + 0.5);
  float tick = floor(uTime * uScrambleSpeed + hash(cell) * 7.0);
  if (hash(cell + tick * 0.137) < uScramble) idx = 1.0 + floor(hash(cell + tick * 1.31 + 9.0) * (uGlyphCount - 1.0));
  float shape = sin(b * 3.14159265);
  if (b > 0.0) {
    float fast = floor(uTime * 36.0 + hash(cell) * 3.0);
    if (hash(cell + fast * 0.71) < uFlicker) idx = 1.0 + floor(hash(cell + fast * 2.17) * (uGlyphCount - 1.0));
  }
  if (level < uThreshold && b <= 0.0 && cellSample.a > 0.0) idx = 0.0;
  if (noisy > 0.0) {
    float fast = floor(uTime * 30.0 + hash(cell + 2.0) * 5.0);
    if (hash(cell + fast * 0.53) < noisy) idx = 1.0 + floor(hash(cell + fast * 1.91) * (uGlyphCount - 1.0));
  }
  idx = clamp(idx, 0.0, uGlyphCount - 1.0);
  vec2 slot = vec2(mod(idx, uAtlasGrid.x), floor(idx / uAtlasGrid.x));
  float glyph = texture(uAtlas, (slot + local) / uAtlasGrid).a;

  vec3 bg = uBgColor;
  vec3 g = mix(uColor, cellCol * uBrightness, uColored);
  // Keep glyphs readable against the backdrop: push them away from its brightness.
  float gap = luma(g) - luma(bg);
  float need = 0.4 * uLegibility;
  if (abs(gap) < need) g = mix(g, vec3(luma(bg) > 0.5 ? 0.0 : 1.0), (need - abs(gap)) / max(need, 1e-4));
  g = mix(g, uColor * 1.4, uTint * shape);
  g *= 1.0 + uGlow * shape;

  vec3 under = img(px, 0.0).rgb;
  vec3 cipher = mix(mix(bg, under, uPassthrough), g, glyph);

  // Cells decode at scattered moments inside the band, with a colour split
  // that relaxes to the true image as they land.
  float ab = uAberration * shape;
  vec3 plain = vec3(img(px + vec2(ab, 0.0), 0.0).r, under.g, img(px - vec2(ab, 0.0), 0.0).b);
  float when = mix(0.5, hash(cell + 5.0) * 0.8 + 0.1, uScatter);
  float decoded = step(when, b);
  float alpha = 1.0 - smoothstep(0.85, 1.0, b);
  vec3 color = mix(cipher, plain, decoded);
  outColor = vec4(color * alpha, alpha);
}`;

const ATLAS_CELL_H = 64;
// Cells sample a heavily filtered image; full resolution only shows in the
// brief decode band, where this is plenty.
export const MAX_TEXTURE_WIDTH = 1024;
const BUFFER_STEP = 256;
const BUFFER_SHRINK_AFTER_MS = 3000;
// An image that will not load as a texture is asked for this many times, a
// little further apart each time, and then left alone.
const TEXTURE_ATTEMPTS = 3;
const TEXTURE_RETRY_MS = 400;

/** Round a buffer dimension up so small size changes never reallocate it. */
export function decryptBufferSize(need, current = 0) {
  return Math.max(current, Math.ceil(Math.max(1, need) / BUFFER_STEP) * BUFFER_STEP);
}

/** Texture size for an image: never wider than MAX_TEXTURE_WIDTH, aspect kept. */
export function decryptTextureSize(width, height) {
  const scale = Math.min(1, MAX_TEXTURE_WIDTH / Math.max(1, width));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

class DecryptRenderer {
  constructor() {
    // An OffscreenCanvas lets frames move to each reveal without a copy.
    this.offscreen = typeof OffscreenCanvas === "function" && typeof ImageBitmapRenderingContext === "function";
    this.canvas = this.offscreen ? new OffscreenCanvas(BUFFER_STEP, BUFFER_STEP) : document.createElement("canvas");
    this.canvas.width = BUFFER_STEP;
    this.canvas.height = BUFFER_STEP;
    this.need = { width: 1, height: 1 };
    this.oversizedSince = 0;
    const gl = this.canvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false, alpha: true });
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;
    this.textures = new Map();
    this.atlas = null;
    this.canvas.addEventListener("webglcontextlost", event => {
      event.preventDefault();
      this.lost = true;
    });
    this._program();
  }

  _program() {
    const { gl } = this;
    const compile = (type, src) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "shader failed");
      return shader;
    };
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "link failed");
    this.program = program;
    this.uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const { name } = gl.getActiveUniform(program, i);
      this.uniforms[name] = gl.getUniformLocation(program, name);
    }
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  }

  /**
   * Whether the image behind key is on the GPU yet. The first ask starts a
   * background decode, downscaled to MAX_TEXTURE_WIDTH; the upload happens
   * once it lands, so the frame that first sees an image never stalls.
   */
  textureReady(key, image) {
    const now = performance.now();
    let entry = this.textures.get(key);
    if (!entry) {
      entry = { texture: null, used: now, loading: false, failures: 0, retryAt: 0 };
      this.textures.set(key, entry);
    }
    entry.used = now;
    if (!entry.texture && !entry.loading && entry.failures < TEXTURE_ATTEMPTS && now >= entry.retryAt) {
      this._loadTexture(key, entry, decryptTextureSize(image.naturalWidth, image.naturalHeight));
    }
    return !!entry.texture;
  }

  /** Whether every attempt at the image behind key has failed, so no glyphs of it will come. */
  textureFailed(key) {
    return (this.textures.get(key)?.failures || 0) >= TEXTURE_ATTEMPTS;
  }

  _loadTexture(key, entry, size) {
    entry.loading = true;
    // Decode from the (already cached) file, not the <img>: a bitmap made
    // from an element is snapshotted on the main thread, one from a blob is not.
    fetch(key, { cache: "force-cache" })
      .then(response => {
        if (!response.ok) throw new Error(`decrypt texture ${response.status}`);
        return response.blob();
      })
      .then(blob => createImageBitmap(blob, { resizeWidth: size.width, resizeHeight: size.height, resizeQuality: "medium", premultiplyAlpha: "none" }))
      .then(bitmap => {
        entry.loading = false;
        try {
          if (!this.lost && this.textures.get(key) === entry) entry.texture = this._uploadTexture(bitmap);
        } finally {
          bitmap.close();
        }
      })
      .catch(() => {
        entry.loading = false;
        entry.failures += 1;
        entry.retryAt = performance.now() + TEXTURE_RETRY_MS * 2 ** entry.failures;
      });
  }

  _uploadTexture(source) {
    const { gl } = this;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  }

  _texture(key) {
    const entry = this.textures.get(key);
    if (entry) entry.used = performance.now();
    return entry?.texture || null;
  }

  /** Grow the shared buffer to fit; it only shrinks between frames, see endFrame. */
  _fitBuffer(width, height) {
    this.need.width = Math.max(this.need.width, width);
    this.need.height = Math.max(this.need.height, height);
    if (this.canvas.width >= width && this.canvas.height >= height) return;
    this.canvas.width = decryptBufferSize(width, this.canvas.width);
    this.canvas.height = decryptBufferSize(height, this.canvas.height);
  }

  beginFrame() {
    this.need = { width: 1, height: 1 };
  }

  /** Shrink the buffer once nothing has needed its size for a while. */
  endFrame(now) {
    const fits = { width: decryptBufferSize(this.need.width), height: decryptBufferSize(this.need.height) };
    if (fits.width >= this.canvas.width && fits.height >= this.canvas.height) {
      this.oversizedSince = 0;
      return;
    }
    this.oversizedSince ||= now;
    if (now - this.oversizedSince < BUFFER_SHRINK_AFTER_MS) return;
    this.canvas.width = fits.width;
    this.canvas.height = fits.height;
    this.oversizedSince = 0;
  }

  _atlasTexture(options) {
    if (this.atlas) return this.atlas;
    const { canvas, cols, rows, count } = buildDecryptAtlas(options);
    const { gl } = this;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    this.atlas = { texture, cols, rows, count };
    return this.atlas;
  }

  /**
   * Render one reveal width×height device px into the top-left of the shared
   * buffer and hand it to target: an ImageBitmapRenderingContext (the whole
   * buffer moves over, and the reveal clips it) or, as a fallback, a 2D
   * context sized width×height. Returns the buffer size the frame was drawn in.
   */
  render(target, width, height, { textureKey, imageRect, prev = null, morph = 1, morphWipe = false, dark = false, front, time, seed, pixelRatio }) {
    const options = DECRYPT_OPTIONS;
    if (this.lost) return null;
    const imageTexture = this._texture(textureKey);
    if (!imageTexture) return null;
    const { gl, uniforms: u } = this;
    this._fitBuffer(width, height);
    const bufferWidth = this.canvas.width;
    const bufferHeight = this.canvas.height;
    const atlas = this._atlasTexture(options);
    // GL's origin is bottom-left: the image's top-left corner is the
    // viewport placed against the buffer's top edge.
    gl.viewport(0, bufferHeight - height, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, atlas.texture);
    const prevTexture = prev && morph < 1 ? this._texture(prev.key) : null;
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, prevTexture || imageTexture);
    gl.uniform1i(u.uPrev, 2);
    gl.uniform1f(u.uMorph, prevTexture ? morph : 1);
    const prevRect = prevTexture ? prev.rect : imageRect;
    gl.uniform4f(u.uPrevRect, prevRect.x, prevRect.y, prevRect.width, prevRect.height);
    gl.uniform1f(u.uMorphGrain, options.morphGrain);
    gl.uniform1f(u.uMorphNoise, options.morphNoise);
    gl.uniform1i(u.uMorphWipe, morphWipe ? 1 : 0);
    gl.uniform1i(u.uImage, 0);
    gl.uniform1i(u.uAtlas, 1);
    gl.uniform2f(u.uRes, width, height);
    gl.uniform1f(u.uFlipY, bufferHeight);
    gl.uniform4f(u.uImgRect, imageRect.x, imageRect.y, imageRect.width, imageRect.height);
    const cellH = Math.max(3, options.cell * pixelRatio);
    gl.uniform2f(u.uCell, cellH * options.aspect, cellH);
    gl.uniform2f(u.uAtlasGrid, atlas.cols, atlas.rows);
    gl.uniform1f(u.uGlyphCount, atlas.count);
    gl.uniform1f(u.uFront, front);
    gl.uniform1f(u.uEdge, options.edge);
    gl.uniform1f(u.uJag, options.jag);
    gl.uniform1f(u.uScatter, options.scatter);
    gl.uniform1f(u.uTime, time);
    gl.uniform1f(u.uSeed, seed);
    gl.uniform1f(u.uScramble, options.scramble);
    gl.uniform1f(u.uScrambleSpeed, options.scrambleSpeed);
    gl.uniform1f(u.uFlicker, options.flicker);
    gl.uniform1f(u.uGlow, options.glow);
    gl.uniform1f(u.uTint, options.tint);
    gl.uniform1f(u.uColored, options.colored);
    gl.uniform3f(u.uColor, ...hexToRgb(options.color));
    // The backdrop follows the canvas theme.
    gl.uniform3f(u.uBgColor, ...hexToRgb(dark ? DECRYPT_BACKDROP.dark : DECRYPT_BACKDROP.light));
    gl.uniform1f(u.uPassthrough, options.passthrough);
    gl.uniform1f(u.uAberration, options.aberration * pixelRatio);
    gl.uniform1f(u.uBrightness, options.brightness);
    gl.uniform1f(u.uLegibility, options.legibility);
    gl.uniform1f(u.uThreshold, options.threshold);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (this.offscreen) {
      target.transferFromImageBitmap(this.canvas.transferToImageBitmap());
    } else {
      target.clearRect(0, 0, width, height);
      target.drawImage(this.canvas, 0, 0, width, height, 0, 0, width, height);
    }
    return { bufferWidth, bufferHeight };
  }

  /** Free textures no reveal has drawn for a while. */
  sweep(now = performance.now()) {
    for (const [key, entry] of this.textures) {
      if (now - entry.used > 4000) {
        if (entry.texture) this.gl.deleteTexture(entry.texture);
        this.textures.delete(key);
      }
    }
  }
}

/**
 * The glyph sheet every decrypt effect draws from: the charset ordered by ink,
 * white on transparent, in a grid of cols x rows cells. Shared so the landing
 * river's glyphs match the canvas reveal's exactly.
 */
export function buildDecryptAtlas(options = DECRYPT_OPTIONS) {
  const glyphs = orderGlyphsByInk(Array.from(new Set(DECRYPT_CHARSET)), options);
  const cols = Math.min(16, glyphs.length);
  const rows = Math.ceil(glyphs.length / cols);
  const cellW = Math.round(ATLAS_CELL_H * options.aspect);
  const canvas = document.createElement("canvas");
  canvas.width = cols * cellW;
  canvas.height = rows * ATLAS_CELL_H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = glyphFont(options);
  glyphs.forEach((glyph, i) => {
    ctx.fillText(glyph, (i % cols + 0.5) * cellW, (Math.floor(i / cols) + 0.54) * ATLAS_CELL_H);
  });
  return { canvas, cols, rows, count: glyphs.length };
}

function glyphFont(options) {
  return `${options.weight} ${Math.round(ATLAS_CELL_H * 0.78)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
}

/** Sort glyphs from least to most ink so a cell's contrast picks its density. Space stays first. */
export function orderGlyphsByInk(glyphs, options) {
  const size = 24;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.font = glyphFont(options).replace(/\d+px/, `${Math.round(size * 0.78)}px`);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const ink = glyph => {
    ctx.clearRect(0, 0, size, size);
    ctx.fillText(glyph, size / 2, size / 2);
    const data = ctx.getImageData(0, 0, size, size).data;
    let sum = 0;
    for (let i = 3; i < data.length; i += 4) sum += data[i];
    return sum;
  };
  const rest = glyphs.filter(glyph => glyph !== " ").map(glyph => ({ glyph, ink: ink(glyph) })).filter(entry => entry.ink > 0);
  rest.sort((a, b) => a.ink - b.ink);
  return [" ", ...rest.map(entry => entry.glyph)];
}

let shared = null;
let failed = false;
export function decryptRenderer() {
  if (failed) return null;
  if (shared?.lost) shared = null;
  try {
    shared ||= new DecryptRenderer();
  } catch (error) {
    failed = true;
    console.warn("Decrypt reveal unavailable", error);
  }
  return shared;
}

// One animation loop for every running reveal. A frame's drawing is kept to a
// budget: when more reveals are due than fit in it (many designs loading at
// once, or a GPU that draws slowly) they take turns, the longest-waiting
// first, so the ciphers update less often and the page keeps its frame rate.
const FRAME_BUDGET_MS = 6;
const active = new Set();
let frame = 0;
let lastSweep = 0;
export function runDecryptLoop(reveal) {
  active.add(reveal);
  if (!frame) frame = requestAnimationFrame(tick);
}
export function stopDecryptLoop(reveal) {
  active.delete(reveal);
}
function tick(now) {
  frame = 0;
  shared?.beginFrame();
  const budget = { left: FRAME_BUDGET_MS };
  const order = active.size > 1 ? [...active].sort((a, b) => a.drawnAt - b.drawnAt) : active;
  for (const reveal of order) reveal.drawFrame(now, budget);
  shared?.endFrame(now);
  if (shared && now - lastSweep > 2000) {
    lastSweep = now;
    shared.sweep(now);
  }
  if (active.size) frame = requestAnimationFrame(tick);
}
