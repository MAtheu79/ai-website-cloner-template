import { VisibleActivity } from "./visible-activity.js";
import { POINTER_LIGHT_GLSL, pointerLight } from "./pointer-light.js";

// A linen ribbon lit like the page's other fabrics: its color, normal,
// height and roughness maps (from `base`, a folder holding ribbon.webp,
// normal.webp, height.webp and roughness.webp) shaded by the mouse light.
// The plain artwork shows until the maps load, or if WebGL is unavailable.
const VERTEX = `
attribute vec2 position;
varying vec2 uv;
void main() { uv = position * .5 + .5; gl_Position = vec4(position, 0., 1.); }
`;

const FRAGMENT = `
precision highp float;
varying vec2 uv;
uniform sampler2D colorMap, normalMap, heightMap, roughnessMap;
uniform vec2 size;    // canvas, css px
uniform float ambient;
uniform vec3 pointer; // the mouse light: canvas px (y up), then strength
${POINTER_LIGHT_GLSL}
vec3 highlightRolloff(vec3 color) {
  float peak = max(color.r, max(color.g, color.b));
  const float knee = .68;
  if (peak <= knee) return color;
  float mapped = knee + (1. - knee) * (1. - exp(-(peak - knee) / (1. - knee)));
  return color * (mapped / peak);
}
void main() {
  vec4 base = texture2D(colorMap, uv);
  if (base.a < .004) { gl_FragColor = vec4(0.); return; }
  vec3 n = texture2D(normalMap, uv).rgb * 2. - 1.;
  n.xy *= .85;
  n = normalize(vec3(n.xy, max(n.z, .15)));
  float height = texture2D(heightMap, uv).r;
  float roughness = clamp(texture2D(roughnessMap, uv).r, .5, 1.);
  vec2 pixel = uv * size;
  vec3 color = base.rgb * ambient;
  vec3 lit = color + pointerLight((pointer.xy - pixel) / size.x, pointer.z, base.rgb, n, height, roughness);
  // Soften only the added light's highlights; the artwork's own bright
  // yellow never comes out darker than it is.
  gl_FragColor = vec4(max(color, highlightRolloff(lit)) * base.a, base.a);
}
`;

const MAPS = ["ribbon.webp", "normal.webp", "height.webp", "roughness.webp"];

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: block; position: relative; pointer-events: none; }
    img, canvas { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
    canvas { visibility: hidden; }
    :host([data-lit]) canvas { visibility: visible; }
    :host([data-lit]) img { visibility: hidden; }
  </style>
  <img alt="" decoding="async">
  <canvas aria-hidden="true"></canvas>
`;

export class DiffuiLandingLitRibbon extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(template.content.cloneNode(true));
    this._img = this.shadowRoot.querySelector("img");
    this._canvas = this.shadowRoot.querySelector("canvas");
    this._frame = null;
    this._activity = new VisibleActivity(this, () => {
      if (!this._img.getAttribute("src")) this._img.src = this._base() + MAPS[0];
      if (!this._gl && !this._initializing) this._initialize();
      this._schedule();
    });
  }

  connectedCallback() {
    this.setAttribute("aria-hidden", "true");
    this._activity.connect();
  }

  disconnectedCallback() {
    this._activity.disconnect();
    this._activity.clearTimeout(this._frame);
    this._frame = null;
  }

  _base() {
    const base = this.getAttribute("base") || "/landing/assets/ribbon/";
    return base.endsWith("/") ? base : `${base}/`;
  }

  async _initialize() {
    this._initializing = true;
    try {
      const gl = this._canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "low-power" });
      if (!gl) return;
      const images = await Promise.all(MAPS.map(async (file) => {
        const img = new Image();
        img.src = this._base() + file;
        await img.decode();
        return img;
      }));
      if (!this.isConnected || gl.isContextLost()) return;
      const compile = (type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
        return shader;
      };
      const program = gl.createProgram();
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      images.forEach((img, index) => {
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.uniform1i(gl.getUniformLocation(program, ["colorMap", "normalMap", "heightMap", "roughnessMap"][index]), index);
      });
      this._uniforms = Object.fromEntries(["size", "ambient", "pointer"].map(name => [name, gl.getUniformLocation(program, name)]));
      this._gl = gl;
      this.setAttribute("data-lit", "");
      this._schedule();
    } catch (error) {
      console.warn("Ribbon lighting unavailable; using the plain artwork.", error);
    } finally {
      this._initializing = false;
    }
  }

  // Runs while on screen; the GPU only redraws when something changed.
  _schedule() {
    if (this._frame || !this._activity.active) return;
    this._frame = this._activity.requestAnimationFrame(() => {
      this._frame = null;
      this._paint();
      this._schedule();
    });
  }

  _paint() {
    const gl = this._gl;
    if (!gl || gl.isContextLost()) return;
    const rect = this._canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
    if (this._canvas.width !== width || this._canvas.height !== height) {
      this._canvas.width = width;
      this._canvas.height = height;
    }
    // Lit a touch lower on light pages, as the hero and band are.
    const ambient = document.documentElement.dataset.landingTheme === "light" ? 0.94 : 1;
    const light = pointerLight();
    const pointer = light.strength > 0
      ? [Math.round(light.x - rect.left), Math.round(rect.bottom - light.y), Math.round(light.strength * 1000) / 1000]
      : [0, 0, 0];
    const signature = [width, height, rect.width, rect.height, ambient, ...pointer].join(",");
    if (signature === this._lastFrame) return;
    this._lastFrame = signature;
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(this._uniforms.size, rect.width, rect.height);
    gl.uniform1f(this._uniforms.ambient, ambient);
    gl.uniform3f(this._uniforms.pointer, ...pointer);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

if (!customElements.get("diffui-landing-lit-ribbon")) customElements.define("diffui-landing-lit-ribbon", DiffuiLandingLitRibbon);
