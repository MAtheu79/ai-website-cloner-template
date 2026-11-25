import { buildDecryptAtlas } from "../../app/components/canvas-decrypt-renderer.js";
import { DECRYPT_OPTIONS, hexToRgb } from "../../app/components/canvas-decrypt-options.js";
import { VisibleActivity } from "./visible-activity.js";
import { POINTER_LIGHT_GLSL, pointerLight } from "./pointer-light.js";
import { flowK, flowQ, flowRate, flowScale, flowX } from "./river-flow.js";

// A river of designs made in Linen, single file in a straight line along a
// woven band from left to right, growing to RIVER_GROWTH times their size as
// they go (river-flow.js). Each screen floats in as the canvas's decrypt glyphs
// and decodes into the design a set time after its center crosses the left
// edge: Linen's average generation time (the headline's "in N seconds"). The
// wipe crosses a screen RIVER_WIPE_PACE times faster than the screen travels,
// and while it runs the wipe's edge casts a bar of light on the band beneath.
// Screens are drawn as meshes that bend like paper carried on water, settling
// flatter as they grow toward the right.
const DEFAULT_LATENCY_SECONDS = 30;
// Where the decode line sits, as a fraction of the band's visible width.
const RIVER_DECODE_X = 0.58;
const RIVER_WIPE_PACE = 2;
const RIVER_GROWTH = 2;
// How much of the paper's wave remains at the right edge.
const RIVER_CALM = 0.2;
// mode="rise": a masonry grid of designs moving down the section, flat (no
// paper wave), from code at the top to finished designs that slip behind the
// band at the bottom. Each decodes bottom-up at its own height between
// RISE_DECODE_HIGH and RISE_DECODE_LOW of the section.
const RISE_DECODE_HIGH = -0.16;
const RISE_DECODE_LOW = -0.05;
// Travel speed, as a fraction of the section width per second.
const RISE_SPEED = 0.014;
const BAND_ASSETS = "/landing/assets/band/";
// The band's color differs by theme (a darker weave on dark pages); both
// share one shape, so one set of normal, height and roughness maps lights either.
const BAND_SRC = { light: BAND_ASSETS + "band.webp", dark: BAND_ASSETS + "band-dark.webp" };
const BAND_MAPS = ["normal.webp", "height.webp", "roughness.webp"];
const BAND_SIZE = Object.freeze({ width: 2048, height: 1328 });
// The middle of the band, in artwork pixels: the river's line.
const BAND_MIDDLE = 669;
// The lowest row of the band's cloth, in artwork pixels.
const BAND_BOTTOM = 918;
// The highest row of the band's cloth, in artwork pixels.
const BAND_TOP = 423;
// Each decoding screen lights the band, with the hero's fabric shading.
const MAX_LIGHTS = 16;
const WARM_LIGHT = [0.85, 0.78, 0.62];
// How opaque the page-colored sheet behind a screen's glyphs is before it decodes.
const RIVER_SHEET_ALPHA = 0.72;
const MANIFEST_URL = "/landing/assets/river/manifest.json";
const MESH_X = 24;
const MESH_Y = 14;

const VERT = `#version 300 es
layout(location = 0) in vec2 aUV;
uniform vec2 uRes;      // canvas size, device px
uniform vec4 uCard;     // left, top, width, height, device px
uniform float uWarp;    // 1 at the left edge, RIVER_CALM at the right
uniform float uTime;
uniform float uPhase;
uniform float uShadow;  // device px of shadow margin; 0 draws the sheet itself
out vec2 vUV;
out vec2 vPx;
out float vShade;
void main() {
  vec2 size = uCard.zw;
  float t = uTime;
  // Two slow travelling waves lift and bend the sheet; their slope shades it.
  float w1 = sin(6.2831 * (aUV.x * 0.85 - t * 0.055 + uPhase));
  float w2 = sin(6.2831 * (aUV.y * 0.6 + aUV.x * 0.3 + t * 0.04 + uPhase * 1.7));
  vec2 offset = vec2(w2 * size.x * 0.008, w1 * size.y * 0.035 + w2 * size.y * 0.012) * uWarp;
  float slope = cos(6.2831 * (aUV.x * 0.85 - t * 0.055 + uPhase)) * 0.85 + cos(6.2831 * (aUV.y * 0.6 + aUV.x * 0.3 + t * 0.04 + uPhase * 1.7)) * 0.35;
  vShade = 1.0 + slope * 0.06 * uWarp;
  vec2 local = (aUV - 0.5) * (size + uShadow * 2.0) + offset + vec2(0.0, uShadow * 0.45);
  vec2 px = uCard.xy + size * 0.5 + local;
  vUV = aUV;
  vPx = px;
  vec2 clip = px / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`;

// The glyph cipher and decode front follow the canvas decrypt reveal
// (canvas-decrypt-renderer.js), in card space so the glyphs ride the paper.
const FRAG = `#version 300 es
precision highp float;
in vec2 vUV;
in vec2 vPx;
in float vShade;
out vec4 outColor;
uniform sampler2D uImage;
uniform sampler2D uAtlas;
uniform vec2 uAtlasGrid;
uniform float uGlyphCount;
uniform vec2 uCardSize;  // device px
uniform vec2 uCell;      // device px
uniform vec2 uFrontP;    // a point on the decode line, device px
uniform vec2 uFrontDir;  // direction of travel across it (unit)
uniform float uEdge;     // band width, device px
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
uniform float uBrightness;
uniform float uLegibility;
uniform float uThreshold;
uniform float uAberration;
uniform float uShadow;
uniform float uShadowAlpha;
uniform float uInkAlpha;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21) + uSeed);
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

void main() {
  // A soft shadow under the decoded part of the sheet; glyphs cast none.
  if (uShadow > 0.0) {
    vec2 full = uCardSize + uShadow * 2.0;
    vec2 p = vUV * full - uShadow;
    vec2 d = max(max(-p, p - uCardSize), 0.0);
    float fall = 1.0 - smoothstep(0.0, uShadow, length(d));
    float decodedSide = smoothstep(-uEdge * 0.5, uEdge * 0.5, dot(vPx - uFrontP, uFrontDir));
    float a = uShadowAlpha * fall * fall * fall * decodedSide;
    outColor = vec4(0.0, 0.0, 0.0, a);
    return;
  }
  vec2 local = vUV * uCardSize;
  vec2 cell = floor(local / uCell);
  vec2 inCell = fract(local / uCell);
  vec2 cellUV = (cell + 0.5) * uCell / uCardSize;

  // Rows run a little ahead or behind, like the canvas reveal's ragged front.
  float lane = cell.y;
  float wobble = (hash(vec2(lane, 1.7)) - 0.5) * 0.5 + (hash(vec2(floor(lane / 5.0), 3.1)) - 0.5);
  float b = clamp(dot(vPx - uFrontP, uFrontDir) / max(uEdge, 1.0) + wobble * uJag * 0.35, 0.0, 1.0);

  vec3 plain = texture(uImage, vUV).rgb;
  if (b >= 1.0) {
    outColor = vec4(plain * vShade, 1.0);
    return;
  }

  vec2 texSize = vec2(textureSize(uImage, 0));
  float maxLod = floor(log2(max(texSize.x, texSize.y)));
  vec3 avg = textureLod(uImage, vec2(0.5), maxLod).rgb;
  vec3 cellCol = textureLod(uImage, cellUV, log2(max(uCell.x * texSize.x / uCardSize.x, 1.0))).rgb;
  float level = clamp(luma(abs(cellCol - avg)) * 2.2 * uBrightness, 0.0, 1.0);
  float idx = floor(level * (uGlyphCount - 1.0) + 0.5);
  float tick = floor(uTime * uScrambleSpeed + hash(cell) * 7.0);
  if (hash(cell + tick * 0.137) < uScramble) idx = 1.0 + floor(hash(cell + tick * 1.31 + 9.0) * (uGlyphCount - 1.0));
  float shape = sin(b * 3.14159265);
  if (b > 0.0) {
    float fast = floor(uTime * 36.0 + hash(cell) * 3.0);
    if (hash(cell + fast * 0.71) < uFlicker) idx = 1.0 + floor(hash(cell + fast * 2.17) * (uGlyphCount - 1.0));
  }
  if (level < uThreshold && b <= 0.0) idx = 0.0;
  idx = clamp(idx, 0.0, uGlyphCount - 1.0);
  vec2 slot = vec2(mod(idx, uAtlasGrid.x), floor(idx / uAtlasGrid.x));
  // Sample the glyph with gradients from the continuous cell coordinate (not
  // the fract that jumps at every cell edge, which would pick a blurry mip
  // there), and keep inside the slot so neighbours never bleed in. Without
  // this, a seam flickers along each cell edge as it crosses pixel boundaries.
  vec2 cellCoord = local / uCell;
  vec2 grad = 1.0 / uAtlasGrid;
  vec2 inSlot = clamp(inCell, vec2(0.04), vec2(0.96));
  float glyph = textureGrad(uAtlas, (slot + inSlot) / uAtlasGrid, dFdx(cellCoord) * grad, dFdy(cellCoord) * grad).a;

  vec3 g = mix(uColor, cellCol * uBrightness, uColored);
  float gap = luma(g) - luma(uBgColor);
  float need = 0.4 * uLegibility;
  if (abs(gap) < need) g = mix(g, vec3(luma(uBgColor) > 0.5 ? 0.0 : 1.0), (need - abs(gap)) / max(need, 1e-4));
  g = mix(g, uColor * 1.4, uTint * shape);
  g *= 1.0 + uGlow * shape;

  // No node chrome: before decoding the screen is glyphs on a translucent sheet
  // of the page's own background (light or dark with the theme), so they read
  // over every stripe of the band.
  float ink = uInkAlpha;
  vec4 cipher = vec4(g * glyph + uBgColor * ink * (1.0 - glyph), glyph + ink * (1.0 - glyph));
  float ab = uAberration * shape / uCardSize.x;
  vec3 split = vec3(texture(uImage, vUV + vec2(ab, 0.0)).r, plain.g, texture(uImage, vUV - vec2(ab, 0.0)).b) * vShade;
  float when = mix(0.5, hash(cell + 5.0) * 0.8 + 0.1, uScatter);
  float decoded = step(when, b);
  outColor = mix(cipher, vec4(split, 1.0), decoded);
}`;

// The hero's fabric lighting (diffui-hero-linen.js) on the band. Each light is
// a thin bar, the edge of a screen's decode wipe, with a tight falloff.
const FABRIC_VERT = `#version 300 es
layout(location = 0) in vec2 aUV;
uniform vec2 uRes;    // canvas size, device px
uniform vec4 uRect;   // band left, top, width, height, section px
uniform float uDpr;
out vec2 vUV;
out vec2 vPx;
void main() {
  vec2 px = uRect.xy + aUV * uRect.zw;
  vUV = aUV;
  vPx = px;
  vec2 clip = px * uDpr / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`;

const FABRIC_FRAG = `#version 300 es
precision highp float;
in vec2 vUV;
in vec2 vPx;
out vec4 outColor;
uniform sampler2D uColorMap, uNormalMap, uHeightMap, uRoughnessMap;
uniform float uWidth;   // section width, section px: the falloff's scale
uniform float uAmbient;
uniform int uCount;
uniform vec4 uLights[${MAX_LIGHTS}];  // center and half extent, section px (y down)
uniform vec3 uColors[${MAX_LIGHTS}];
uniform vec3 uPointer;  // the mouse light: section px (y down), then strength
${POINTER_LIGHT_GLSL}
vec3 highlightRolloff(vec3 color) {
  float peak = max(color.r, max(color.g, color.b));
  const float knee = .68;
  if (peak <= knee) return color;
  float mapped = knee + (1. - knee) * (1. - exp(-(peak - knee) / (1. - knee)));
  return color * (mapped / peak);
}
void main() {
  vec4 base = texture(uColorMap, vUV);
  if (base.a < .004) { outColor = vec4(0.); return; }
  vec3 n = texture(uNormalMap, vUV).rgb * 2. - 1.;
  n.xy *= .85;
  n = normalize(vec3(n.xy, max(n.z, .15)));
  float height = texture(uHeightMap, vUV).r;
  float roughness = clamp(texture(uRoughnessMap, vUV).r, .5, 1.);
  vec3 color = base.rgb * uAmbient;
  for (int i = 0; i < ${MAX_LIGHTS}; i++) {
    if (i >= uCount) break;
    vec2 nearest = clamp(vPx, uLights[i].xy - uLights[i].zw, uLights[i].xy + uLights[i].zw);
    vec2 offset = (nearest - vPx) / uWidth;
    offset.y = -offset.y; // the maps' normals point y up
    float z = .09 - height * .025;
    vec3 light = normalize(vec3(offset, z));
    // Much tighter than the hero's node lights: a targeted strip of light.
    float falloff = exp(-length(offset) * 34.);
    float diffuse = .25 + .75 * max(dot(n, light), 0.);
    vec3 halfway = normalize(light + vec3(0., 0., 1.));
    float sheen = pow(max(dot(n, halfway), 0.), mix(42., 7., roughness));
    color += 1.8 * uColors[i] * falloff * (base.rgb * diffuse * 1.65 + sheen * (1. - roughness * .85) * .16);
  }
  vec2 toPointer = (uPointer.xy - vPx) / uWidth;
  toPointer.y = -toPointer.y;
  color += pointerLight(toPointer, uPointer.z, base.rgb, n, height, roughness);
  outColor = vec4(highlightRolloff(color) * base.a, base.a);
}`;

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: block; position: relative; width: 100%; height: 100%; overflow: hidden; }
    .linen { position: absolute; left: 0; top: 0; display: block; max-width: none; pointer-events: none; user-select: none; }
    /* Once the lit fabric draws in the canvas, the plain artwork steps aside. */
    :host([data-lit]) .linen { visibility: hidden; }
    canvas { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
    /* Rise mode: the page's next section color, from the band's middle down,
       so the band reads as the edge between this section and the next. */
    .floor { position: absolute; left: 0; right: 0; bottom: 0; background: var(--river-floor, transparent); }
  </style>
  <div class="floor"></div>
  <img class="linen" alt="" aria-hidden="true" decoding="async">
  <canvas aria-hidden="true"></canvas>
  <span class="bgProbe" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden;background:var(--bg, #0e1113)"></span>
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "shader compile failed");
  return shader;
}

function link(gl, vert, frag) {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "link failed");
  const uniforms = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const name = gl.getActiveUniform(program, i).name;
    uniforms[name] = gl.getUniformLocation(program, name);
    // Arrays report as "name[0]"; keep the bare name too.
    if (name.endsWith("[0]")) uniforms[name.slice(0, -3)] = uniforms[name];
  }
  return { program, uniforms };
}

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function loadImage(src) {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  return img.decode().then(() => img);
}

function bandTexture(gl, img) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

export class DiffuiLandingRiver extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(template.content.cloneNode(true));
    this._canvas = this.shadowRoot.querySelector("canvas");
    this._linen = this.shadowRoot.querySelector(".linen");
    this._latency = DEFAULT_LATENCY_SECONDS;
    this._activity = new VisibleActivity(this, () => this._tick());
    this._cards = [];
    this._textures = new Map();
    this._images = [];
    this._next = 0;
    this._frame = null;
    // A new order on every page load.
    this._random = seeded(Math.floor(Math.random() * 4294967296));
    this._reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }

  /** Seconds from the left edge to the decode line: the average generation time. */
  // Rise mode: how much of the top of this element is hidden behind other
  // artwork. Decode heights are measured within the visible part below it.
  set riseInset(px) {
    this._riseInset = Math.max(0, Number(px) || 0);
    this._announceDecodeLine();
  }

  // Rise mode: where designs are, on average, halfway through turning from
  // code into a design, in this element's px from its top. The wipe starts as
  // a card's center reaches its decode height and is halfway a quarter of the
  // card's height later. Null until the grid is laid out.
  get decodeLineY() {
    if (!this._rise || !this._colW || !this._h) return null;
    const inset = this._riseInset || 0;
    const decodeAt = (RISE_DECODE_HIGH + RISE_DECODE_LOW) / 2;
    return inset + (this._h - inset) * decodeAt + this._cardH / 4;
  }

  // The top edge of the band's cloth, in this element's px from its top.
  get bandTopY() {
    if (!this._linenRect || !this._w) return null;
    return this._linenRect[1] + BAND_TOP * (this._w / BAND_SIZE.width);
  }

  _announceDecodeLine() {
    if (this.decodeLineY == null) return;
    this.dispatchEvent(new CustomEvent("river-decode-line"));
  }

  set latency(seconds) {
    const next = Number(seconds) > 0 ? Number(seconds) : DEFAULT_LATENCY_SECONDS;
    if (next === this._latency) return;
    this._latency = next;
    if (!this._rate || this._rise) return;
    // Change pace without moving any screen: rebase each one to the new rate.
    const t = this._activity.now() / 1000;
    const old = this._rate;
    this._setRate();
    for (const card of this._cards) card.q0 += (old - this._rate) * t;
  }

  get latency() {
    return this._latency;
  }

  connectedCallback() {
    this._rise = this.getAttribute("mode") === "rise";
    this._resize = new ResizeObserver(() => this._layout());
    this._resize.observe(this);
    this._activity.connect();
    // Nothing downloads until the river is about to scroll into view: not the
    // list of designs, not a single image.
    if (!this._manifest && !this._near) {
      this._nearObserver = new IntersectionObserver((entries) => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        this._nearObserver?.disconnect();
        this._nearObserver = null;
        this._near = true;
        this._loadManifest();
      }, { rootMargin: "400px 0px" });
      this._nearObserver.observe(this);
    }
  }

  _loadManifest() {
    this._near = true;
    this._showBand(this._isLightPage());
    if (!this._manifest) {
      this._manifest = fetch(MANIFEST_URL, { cache: "no-cache" }).then(r => r.json()).then((list) => {
        this._images = (Array.isArray(list) ? list : []).filter(item => item?.src && item.w > 0 && item.h > 0);
        for (let i = this._images.length - 1; i > 0; i--) {
          const j = Math.floor(this._random() * (i + 1));
          [this._images[i], this._images[j]] = [this._images[j], this._images[i]];
        }
        this._layout();
      }).catch(() => {});
    }
  }

  disconnectedCallback() {
    this._nearObserver?.disconnect();
    this._nearObserver = null;
    this._resize?.disconnect();
    this._activity.disconnect();
    this._activity.clearTimeout(this._frame);
    this._frame = null;
  }

  // ---- layout -----------------------------------------------------------

  _layout() {
    const rect = this.getBoundingClientRect();
    if (!rect.width || !rect.height || !this._images.length) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this._dpr = dpr;
    this._w = rect.width;
    this._h = rect.height;
    this._activity.refresh();
    this._canvas.width = Math.round(rect.width * dpr);
    this._canvas.height = Math.round(rect.height * dpr);
    // The band spans the section edge to edge: through the middle for the
    // river, along the bottom edge when designs rise out from behind it.
    const scale = this._w / BAND_SIZE.width;
    const top = this._rise
      ? this._h - BAND_BOTTOM * scale - 6
      : this._h / 2 - BAND_MIDDLE * scale;
    Object.assign(this._linen.style, {
      width: `${BAND_SIZE.width * scale}px`, height: `${BAND_SIZE.height * scale}px`,
      transform: `translate(0px, ${top}px)`,
    });
    this._linenRect = [0, top, BAND_SIZE.width * scale, BAND_SIZE.height * scale];
    this.shadowRoot.querySelector(".floor").style.top = `${top + BAND_MIDDLE * scale}px`;
    if (this._rise) {
      this._layoutRise(top + BAND_MIDDLE * scale);
      this._announceDecodeLine();
      if (!this._gl && !this._fallback) this._initGL();
      this._draw(this._activity.now() / 1000);
      return;
    }
    // Screen height at the left edge; it doubles by the right.
    this._cardH = Math.max(44, this._w * 0.072);
    this._decodeX = this._w * RIVER_DECODE_X;
    this._setRate();
    if (!this._cards.length) this._seed();
    if (!this._gl && !this._fallback) this._initGL();
    this._draw(this._activity.now() / 1000);
  }

  // Screens cross from the left edge to the decode line in latency seconds.
  _setRate() {
    this._rate = flowRate(this._decodeX, this._w, RIVER_GROWTH, this._latency);
  }

  _qAt(x) {
    return flowQ(x, this._w, RIVER_GROWTH);
  }

  _cardFor(q0) {
    const image = this._images[this._next++ % this._images.length];
    return {
      image, aspect: image.w / image.h,
      q0, // flow position at time 0 (river-flow.js)
      bob: this._random() * Math.PI * 2,
      phase: this._random(),
      seed: this._random() * 100,
    };
  }

  // The band starts already full, so the river is flowing when it scrolls in.
  _seed() {
    const shift = this._rate * (this._activity.now() / 1000);
    let q = this._qAt(this._w + this._cardH * 3) + this._random() * this._gap(null) - shift;
    const end = this._qAt(-this._cardH * 3) - shift;
    while (q > end) {
      const card = this._cardFor(q);
      this._cards.push(card);
      q -= this._gap(card);
    }
  }

  // The flow distance one screen needs before the next: its width plus a gap,
  // both at left-edge size (the flow scales them up together).
  _gap(card) {
    const w = this._cardH * (card ? card.aspect : 1.6);
    return flowK(this._w, RIVER_GROWTH) * (w + this._cardH * (0.9 + this._random() * 0.8));
  }

  // Screens past the right edge leave; new ones queue past the left.
  _recycle(t) {
    const shift = this._rate * t;
    const exit = this._qAt(this._w + this._cardH * RIVER_GROWTH * 2);
    this._cards = this._cards.filter(card => card.q0 + shift < exit);
    let first = null;
    for (const card of this._cards) if (!first || card.q0 < first.q0) first = card;
    let q = first ? first.q0 - this._gap(first) : this._qAt(-this._cardH * 2) - shift;
    while (q + shift > this._qAt(-this._cardH * 3)) {
      const card = this._cardFor(q);
      this._cards.push(card);
      q -= this._gap(card);
    }
  }

  // Where a screen is at time t: its center and size, in section px.
  _place(card, t) {
    const x = flowX(card.q0 + this._rate * t, this._w, RIVER_GROWTH);
    const grow = flowScale(x, this._w, RIVER_GROWTH);
    const along = Math.max(0, Math.min(1, x / this._w));
    // The paper settles flatter as it grows toward the right.
    const warp = 1 - (1 - RIVER_CALM) * along;
    const h = this._cardH * grow;
    const w = h * card.aspect;
    // The wipe runs left to right across the screen. wipe is how far the
    // screen's center is past the decode line: it starts as the center reaches
    // the line, the leading edge first, and moves RIVER_WIPE_PACE times faster
    // than the screen does. reach is how far it goes from first glyph to last.
    const wipe = (x - this._decodeX) * RIVER_WIPE_PACE - w / 2;
    const edge = DECRYPT_OPTIONS.edge * w * 1.6;
    const reach = w / 2 + edge;
    return {
      cx: x, cy: this._h / 2 + Math.sin(t * 0.6 + card.bob) * 3 * warp,
      w, h, x, warp, wipe, edge, reach, dir: [1, 0], scale: h / this._cardH,
    };
  }

  // ---- rise mode ----------------------------------------------------------

  // Columns across the full width; designs emerge from behind the band's
  // middle (spawnY) and rise off the top of the section.
  _layoutRise(spawnY) {
    const n = Math.max(3, Math.min(9, Math.round(this._w / 230)));
    const gap = Math.max(12, this._w * 0.011);
    const old = this._columns;
    this._spawnY = spawnY;
    this._colGap = gap;
    this._colW = (this._w - gap * (n + 1)) / n;
    this._cardH = this._colW / 1.6;
    this._riseSpeed = this._w * RISE_SPEED;
    // A new column count means a new grid: start it over.
    if (!old || old.length !== n) {
      this._columns = Array.from({ length: n }, (_, i) => ({ x: gap + this._colW / 2 + i * (this._colW + gap), cards: [] }));
      this._cards = [];
      this._seedRise();
    } else {
      this._columns.forEach((col, i) => { col.x = gap + this._colW / 2 + i * (this._colW + gap); });
    }
  }

  // Rise mode, which now runs downward: designs come out from behind the
  // hero fabric as code, fall, decode, and slip behind the band. Each card
  // keeps y0, its center's height at time 0; it sits at y0 + speed * t.
  _riseCard() {
    const card = this._cardFor(0);
    card.y0 = 0;
    card.decodeAt = RISE_DECODE_HIGH + this._random() * (RISE_DECODE_LOW - RISE_DECODE_HIGH);
    return card;
  }

  _seedRise() {
    const shift = this._riseSpeed * (this._activity.now() / 1000);
    for (const col of this._columns) {
      // Each column starts at its own offset, so the grid reads as masonry.
      let cy = this._spawnY + this._random() * this._colW * 0.5;
      let prev = null;
      while (cy > -this._colW) {
        const card = this._riseCard();
        if (prev) cy -= this._riseStep(prev, card);
        card.y0 = cy - shift;
        col.cards.push(card);
        prev = card;
      }
    }
    this._cards = this._columns.flatMap(col => col.cards);
  }

  // Center-to-center distance between two neighbouring cards in a column.
  _riseStep(card, next) {
    return (this._colW / card.aspect) / 2 + this._colGap + (this._colW / next.aspect) / 2;
  }

  _recycleRise(t) {
    const shift = this._riseSpeed * t;
    for (const col of this._columns) {
      // Gone once wholly behind the band.
      col.cards = col.cards.filter(card => card.y0 + shift - this._colW / card.aspect / 2 < this._spawnY + 20);
      let top = col.cards[col.cards.length - 1];
      // Queue the next design above the topmost once that one has come down
      // far enough to leave a gap.
      while (!top || top.y0 + shift - this._colW / top.aspect / 2 > -this._colW) {
        const card = this._riseCard();
        card.y0 = top ? top.y0 - this._riseStep(top, card) : -this._colW - shift;
        col.cards.push(card);
        top = card;
      }
    }
    this._cards = this._columns.flatMap(col => col.cards);
  }

  _placeRise(card, col, t) {
    const w = this._colW;
    const h = w / card.aspect;
    const cy = card.y0 + this._riseSpeed * t;
    // The wipe runs bottom to top: it starts as the center comes down to this
    // card's decode height and moves RIVER_WIPE_PACE times faster than the card.
    const inset = this._riseInset || 0;
    const decodeY = inset + (this._h - inset) * card.decodeAt;
    const wipe = (cy - decodeY) * RIVER_WIPE_PACE - h / 2;
    const edge = DECRYPT_OPTIONS.edge * h * 1.6;
    return {
      cx: col.x, cy, w, h, x: col.x, warp: 0, wipe, edge, reach: h / 2 + edge,
      dir: [0, 1], scale: w / (this._cardH * 1.6),
    };
  }

  // ---- rendering --------------------------------------------------------

  _initGL() {
    const gl = this._canvas.getContext("webgl2", { premultipliedAlpha: true, alpha: true, antialias: true });
    if (!gl) {
      this._fallback = this._canvas.getContext("2d");
      return;
    }
    try {
      const cards = link(gl, VERT, FRAG);
      this._program = cards.program;
      this._uniforms = cards.uniforms;
    } catch (error) {
      console.warn("River unavailable", error);
      this._fallback = this._canvas.getContext("2d");
      return;
    }
    this._gl = gl;
    const verts = [];
    for (let y = 0; y < MESH_Y; y++) {
      for (let x = 0; x < MESH_X; x++) {
        const u0 = x / MESH_X, u1 = (x + 1) / MESH_X, v0 = y / MESH_Y, v1 = (y + 1) / MESH_Y;
        verts.push(u0, v0, u1, v0, u0, v1, u1, v0, u1, v1, u0, v1);
      }
    }
    this._vertexCount = verts.length / 2;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this._vao = vao;
    this._quad = gl.createVertexArray();
    gl.bindVertexArray(this._quad);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const atlas = buildDecryptAtlas(DECRYPT_OPTIONS);
    const atlasTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    this._atlas = { texture: atlasTexture, cols: atlas.cols, rows: atlas.rows, count: atlas.count };
    this._initFabric();
  }

  // The lit band: its color, normal, height and roughness maps. Until
  // they arrive (or if they fail) the plain artwork shows instead.
  async _initFabric() {
    const gl = this._gl;
    try {
      this._fabric = link(gl, FABRIC_VERT, FABRIC_FRAG);
      this._fabric.colors = {};
      const theme = this._isLightPage() ? "light" : "dark";
      const [maps] = await Promise.all([
        Promise.all(BAND_MAPS.map(file => loadImage(BAND_ASSETS + file))),
        this._loadBandColor(theme),
      ]);
      if (this._gl !== gl || gl.isContextLost() || !this._fabric) return;
      this._fabric.textures = maps.map(img => bandTexture(gl, img));
      this.setAttribute("data-lit", "");
    } catch (error) {
      console.warn("River fabric lighting unavailable; using the plain artwork.", error);
      this._fabric = null;
    }
  }

  // The band's color map for a theme, loaded the first time that theme shows.
  _loadBandColor(theme) {
    const fabric = this._fabric;
    const gl = this._gl;
    if (!fabric || fabric.colors[theme]) return fabric?.colors[theme];
    fabric.colors[theme] = loadImage(BAND_SRC[theme]).then((img) => {
      if (this._gl !== gl || gl.isContextLost()) return null;
      fabric.colors[theme] = bandTexture(gl, img);
      return fabric.colors[theme];
    }, (error) => {
      delete fabric.colors[theme];
      throw error;
    });
    return fabric.colors[theme];
  }

  _isLightPage() {
    const bg = this._bg || this._bgColor();
    return 0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2] > 0.5;
  }

  // Show the band for the page's theme: the plain artwork, and the lit band's
  // color map (kept on the previous theme's until the new one has loaded).
  _showBand(light) {
    const theme = light ? "light" : "dark";
    const src = BAND_SRC[theme];
    if (this._linen.getAttribute("src") !== src) this._linen.src = src;
    if (this._fabric?.colors) this._loadBandColor(theme)?.catch?.(() => {});
  }

  _drawFabric(placed, lightPage) {
    const fabric = this._fabric;
    if (!fabric?.textures) return;
    const want = fabric.colors[lightPage ? "light" : "dark"];
    const other = fabric.colors[lightPage ? "dark" : "light"];
    const color = want instanceof WebGLTexture ? want : other instanceof WebGLTexture ? other : null;
    if (!color) return;
    const gl = this._gl;
    const u = fabric.uniforms;
    gl.useProgram(fabric.program);
    gl.bindVertexArray(this._quad);
    [color, ...fabric.textures].forEach((texture, i) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, texture);
    });
    gl.uniform1i(u.uColorMap, 0);
    gl.uniform1i(u.uNormalMap, 1);
    gl.uniform1i(u.uHeightMap, 2);
    gl.uniform1i(u.uRoughnessMap, 3);
    gl.uniform2f(u.uRes, this._canvas.width, this._canvas.height);
    gl.uniform1f(u.uDpr, this._dpr);
    gl.uniform4f(u.uRect, ...this._linenRect);
    gl.uniform1f(u.uWidth, this._w);
    gl.uniform1f(u.uAmbient, lightPage ? 0.94 : 1);
    const pointer = pointerLight();
    const box = pointer.strength > 0 ? this._canvas.getBoundingClientRect() : null;
    gl.uniform3f(u.uPointer, box ? pointer.x - box.left : 0, box ? pointer.y - box.top : 0, pointer.strength);
    // A screen lights the band only while it decodes: a bar along the wipe's
    // edge, fading in as the wipe starts and out once it is done.
    const lights = new Float32Array(MAX_LIGHTS * 4);
    const colors = new Float32Array(MAX_LIGHTS * 3);
    let count = 0;
    for (let i = placed.length - 1; i >= 0 && count < MAX_LIGHTS; i--) {
      const { card, at } = placed[i];
      if (!this._textures.get(card.image.src)?.texture) continue;
      const through = (at.wipe + at.reach) / (2 * at.reach);
      if (through <= 0 || through >= 1) continue;
      const strength = Math.sin(Math.PI * through) ** 2;
      const tint = card.image.tint || WARM_LIGHT;
      // The bar lies along the decode line, across the screen.
      const [dx, dy] = at.dir;
      const lx = Math.max(at.cx - at.w / 2, Math.min(at.cx + at.w / 2, at.cx - dx * at.wipe));
      const ly = Math.max(at.cy - at.h / 2, Math.min(at.cy + at.h / 2, at.cy - dy * at.wipe));
      const thin = Math.max(1.5, Math.max(at.w, at.h) * 0.012);
      lights.set([lx, ly, dx ? thin : at.w / 2, dx ? at.h / 2 : thin], count * 4);
      colors.set([0, 1, 2].map(k => (WARM_LIGHT[k] * 0.5 + tint[k] * 0.5) * strength), count * 3);
      count++;
    }
    gl.uniform1i(u.uCount, count);
    gl.uniform4fv(u.uLights, lights);
    gl.uniform3fv(u.uColors, colors);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  // Images load as their cards come up, never all 200 at once.
  _texture(image) {
    const known = this._textures.get(image.src);
    if (known) return known.texture;
    const entry = { texture: null, used: performance.now() };
    this._textures.set(image.src, entry);
    const img = new Image();
    img.decoding = "async";
    img.src = image.src;
    img.decode().then(() => {
      // The screen's average color tints the light it casts.
      try {
        const probe = document.createElement("canvas");
        probe.width = probe.height = 1;
        const ctx = probe.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        image.tint = [r / 255, g / 255, b / 255];
      } catch { /* keep the warm light */ }
      if (this._gl) {
        const gl = this._gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        entry.texture = texture;
      } else {
        entry.texture = img;
      }
    }).catch(() => {});
    return null;
  }

  // Drop textures no card has shown for a while.
  _sweep(now) {
    const live = new Set(this._cards.map(card => card.image.src));
    for (const [src, entry] of this._textures) {
      if (live.has(src)) entry.used = now;
      else if (now - entry.used > 20000) {
        if (this._gl && entry.texture) this._gl.deleteTexture(entry.texture);
        this._textures.delete(src);
      }
    }
  }

  _tick() {
    if (this._frame || !this._activity.active) return;
    this._frame = this._activity.requestAnimationFrame(() => {
      this._frame = null;
      const t = this._activity.now() / 1000;
      this._draw(t);
      if (!this._reduced) this._tick();
    });
  }

  // The page background as the browser resolved it (the landing theme's --bg
  // is a light-dark() pair, so the variable's text is not a color).
  _bgColor() {
    const probe = this.shadowRoot.querySelector(".bgProbe");
    const match = getComputedStyle(probe).backgroundColor.match(/[\d.]+/g);
    if (!match || match.length < 3) return hexToRgb("#0e1113");
    return match.slice(0, 3).map(n => Number(n) / 255);
  }

  _draw(t) {
    if (!this._w || !this._images.length) return;
    if (this._rise) this._recycleRise(t);
    else this._recycle(t);
    const now = performance.now();
    if (!this._lastSweep || now - this._lastSweep > 3000) {
      this._lastSweep = now;
      this._sweep(now);
    }
    // Follow theme changes promptly: the glyph sheet takes the page's color.
    if (!this._lastBg || now - this._lastBg > 250) {
      this._lastBg = now;
      this._bg = this._bgColor();
      // Light pages dim the band slightly, as the hero does; dark pages have
      // their own darker weave and show it at full brightness.
      const light = 0.299 * this._bg[0] + 0.587 * this._bg[1] + 0.114 * this._bg[2] > 0.5;
      const filter = light ? "brightness(0.94)" : "none";
      if (this._linen.style.filter !== filter) this._linen.style.filter = filter;
      if (this._near) this._showBand(light);
    }
    // Upstream screens are farther away: draw them first so nearer ones overlap.
    const placed = (this._rise
      ? this._columns.flatMap(col => col.cards.map(card => ({ card, at: this._placeRise(card, col, t) })))
      : this._cards.map(card => ({ card, at: this._place(card, t) })))
      .filter(({ at }) => at.cx + at.w > -40 && at.cx - at.w < this._w + 40 && at.cy + at.h > -40 && at.cy - at.h < this._h + 40)
      .sort((a, b) => a.at.x - b.at.x);
    if (this._fallback) {
      const ctx = this._fallback;
      const dpr = this._dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, this._w, this._h);
      ctx.save();
      if (this._rise) {
        ctx.beginPath();
        ctx.rect(0, 0, this._w, this._spawnY);
        ctx.clip();
      }
      for (const { card, at } of placed) {
        const img = this._texture(card.image);
        if (!img) continue;
        const past = at.wipe > 0;
        ctx.save();
        ctx.translate(at.cx, at.cy);
        ctx.globalAlpha = past ? 1 : 0.35;
        ctx.drawImage(img, -at.w / 2, -at.h / 2, at.w, at.h);
        ctx.restore();
      }
      ctx.restore();
      return;
    }
    const gl = this._gl;
    if (!gl) return;
    const dpr = this._dpr;
    const u = this._uniforms;
    const o = DECRYPT_OPTIONS;
    gl.viewport(0, 0, this._canvas.width, this._canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const bg = this._bg || [0.05, 0.07, 0.08];
    const lightPage = 0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2] > 0.5;
    // Designs rise from behind the band, so it is drawn over them.
    if (!this._rise) this._drawFabric(placed, lightPage);
    gl.useProgram(this._program);
    gl.bindVertexArray(this._vao);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this._atlas.texture);
    gl.uniform1i(u.uAtlas, 1);
    gl.uniform1i(u.uImage, 0);
    gl.uniform2f(u.uRes, this._canvas.width, this._canvas.height);
    gl.uniform2f(u.uAtlasGrid, this._atlas.cols, this._atlas.rows);
    gl.uniform1f(u.uGlyphCount, this._atlas.count);
    gl.uniform1f(u.uTime, t);
    gl.uniform1f(u.uJag, o.jag);
    gl.uniform1f(u.uScatter, o.scatter);
    gl.uniform1f(u.uScramble, o.scramble);
    gl.uniform1f(u.uScrambleSpeed, o.scrambleSpeed);
    gl.uniform1f(u.uFlicker, o.flicker);
    gl.uniform1f(u.uGlow, o.glow);
    gl.uniform1f(u.uTint, o.tint);
    gl.uniform1f(u.uColored, o.colored);
    gl.uniform3fv(u.uColor, hexToRgb(o.color));
    // Glyphs sit on a sheet of the page's background color.
    gl.uniform3fv(u.uBgColor, bg);
    gl.uniform1f(u.uInkAlpha, RIVER_SHEET_ALPHA);
    gl.uniform1f(u.uBrightness, o.brightness);
    // Glyphs need more contrast on a light page than on the dark canvas.
    gl.uniform1f(u.uLegibility, lightPage ? Math.min(1, o.legibility * 2) : o.legibility);
    // Screens rest on the band, not the page, so the shadow is the same in both themes.
    gl.uniform1f(u.uShadowAlpha, 0.3);
    gl.uniform1f(u.uThreshold, o.threshold);
    gl.uniform1f(u.uAberration, o.aberration * dpr);
    gl.activeTexture(gl.TEXTURE0);
    // Rising designs show only above the band's middle line, which the cloth
    // covers along its whole length, so nothing peeks out beneath it.
    if (this._rise) {
      gl.enable(gl.SCISSOR_TEST);
      const keep = Math.round(this._spawnY * dpr);
      gl.scissor(0, this._canvas.height - keep, this._canvas.width, keep);
    }
    for (const { card, at } of placed) {
      const texture = this._texture(card.image);
      if (!texture) continue;
      const scale = at.scale;
      const cellH = o.cell * Math.max(0.7, scale) * dpr;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform4f(u.uCard, (at.cx - at.w / 2) * dpr, (at.cy - at.h / 2) * dpr, at.w * dpr, at.h * dpr);
      gl.uniform2f(u.uCardSize, at.w * dpr, at.h * dpr);
      gl.uniform2f(u.uCell, cellH * o.aspect, cellH);
      gl.uniform1f(u.uEdge, at.edge * dpr);
      gl.uniform1f(u.uWarp, at.warp);
      // The decode line sits wipe behind the screen's center.
      const [dx, dy] = at.dir;
      gl.uniform2f(u.uFrontDir, dx, dy);
      gl.uniform2f(u.uFrontP, (at.cx - dx * at.wipe) * dpr, (at.cy - dy * at.wipe) * dpr);
      gl.uniform1f(u.uPhase, card.phase);
      gl.uniform1f(u.uSeed, card.seed);
      gl.uniform1f(u.uShadow, 26 * scale * dpr);
      gl.drawArrays(gl.TRIANGLES, 0, this._vertexCount);
      gl.uniform1f(u.uShadow, 0);
      gl.drawArrays(gl.TRIANGLES, 0, this._vertexCount);
    }
    if (this._rise) {
      gl.disable(gl.SCISSOR_TEST);
      this._drawFabric(placed, lightPage);
    }
  }
}

if (!customElements.get("diffui-landing-river")) customElements.define("diffui-landing-river", DiffuiLandingRiver);
