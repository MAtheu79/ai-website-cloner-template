import { nodeLightRectangle } from './hero-linen-lighting.js';
import { VisibleActivity } from './visible-activity.js';
import { POINTER_LIGHT_GLSL, pointerLight } from './pointer-light.js';

// The hero nodes illuminate a transparent linen plane. Like the Tarot reference,
// normal/height/roughness maps shape diffuse light and the broad fabric sheen.
const ASSETS = '/landing/assets/linen/';
const VERTEX = `
attribute vec2 position;
varying vec2 uv;
void main() { uv = position * .5 + .5; gl_Position = vec4(position, 0., 1.); }
`;
const FRAGMENT = `
precision highp float;
varying vec2 uv;
uniform sampler2D colorMap, normalMap, heightMap, roughnessMap;
uniform vec2 size;
uniform vec4 lights[3]; // center and half extent, in canvas pixels (y up)
uniform vec3 colors[3];
uniform float ambient;
uniform vec3 pointer; // the mouse light: canvas pixels (y up), then strength
${POINTER_LIGHT_GLSL}
// A smooth shoulder preserves hue and texture instead of hard-clipping RGB.
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
  vec3 color = base.rgb * ambient;
  vec2 pixel = uv * size;
  for (int i = 0; i < 3; i++) {
    // Project node rectangles into the fixed canvas; material UVs never move.
    vec2 nearest = clamp(pixel, lights[i].xy - lights[i].zw, lights[i].xy + lights[i].zw);
    vec2 offset = (nearest - pixel) / size.x;
    float z = .09 - height * .025;
    vec3 light = normalize(vec3(offset, z));
    float falloff = exp(-length(offset) * 12.);
    float diffuse = .25 + .75 * max(dot(n, light), 0.);
    vec3 halfway = normalize(light + vec3(0., 0., 1.));
    float sheen = pow(max(dot(n, halfway), 0.), mix(42., 7., roughness));
    color += .8 * colors[i] * falloff * (base.rgb * diffuse * 1.65 + sheen * (1. - roughness * .85) * .16);
  }
  color += pointerLight((pointer.xy - pixel) / size.x, pointer.z, base.rgb, n, height, roughness);
  gl_FragColor = vec4(highlightRolloff(color) * base.a, base.a);
}
`;

export class DiffuiHeroLinen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
      :host { display: block; pointer-events: none; clip-path: inset(calc(-1 * var(--linen-lift, 0px)) 0 -50% 0); }
      /* Clipped at the sides only: on narrow pages the fabric is scaled up
         (--linen-transform) and its lower edge hangs below this box. */
      /* The fabric scrolls away with the hero, like the rest of the page. */
      .fabric {
        position: absolute;
        top: calc(-1 * var(--linen-lift, 0px));
        left: 0;
        width: 100%;
        height: var(--linen-height, 950px);
        transform: var(--linen-transform, none);
        transform-origin: top left;
      }
      img, canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
      img { display: block; }
      canvas { visibility: hidden; }
      :host([data-ready]) canvas { visibility: visible; }
      :host([data-ready]) img { visibility: hidden; }
    `;
    this._fabric = document.createElement('div');
    this._fabric.className = 'fabric';
    this._image = new Image();
    this._image.alt = '';
    this._image.loading = 'lazy';
    this._image.decoding = 'async';
    this._canvas = document.createElement('canvas');
    this._fabric.append(this._image, this._canvas);
    this.shadowRoot.append(style, this._fabric);
    this._textures = [];
    this._frame = 0;
    this._activity = new VisibleActivity(this, () => {
      if (!this._image.hasAttribute('src')) this._image.src = ASSETS + 'linen.webp';
      if (!this._program && !this._initializing) this._initialize();
      this._schedule();
    });
    this._onContextLost = (event) => {
      event.preventDefault();
      this.removeAttribute('data-ready');
      this._activity.clearTimeout(this._frame);
      this._frame = 0;
    };
    this._onContextRestored = () => {
      this._dispose();
      if (this._activity.active) this._initialize();
    };
  }

  set hero(hero) {
    this._hero = hero;
    this._schedule();
  }

  connectedCallback() {
    this.setAttribute('aria-hidden', 'true');
    this._activity.connect();
    this._canvas.addEventListener('webglcontextlost', this._onContextLost);
    this._canvas.addEventListener('webglcontextrestored', this._onContextRestored);
    this._resize = new ResizeObserver(() => {
      // Size changes only; the fabric scrolls with the page on its own.
      this._fabric.style.width = `${this.clientWidth}px`;
      this._fabric.style.height = `${this.clientHeight}px`;
      this._schedule();
    });
    this._resize.observe(this);
  }

  disconnectedCallback() {
    this._generation = (this._generation || 0) + 1;
    this._activity.disconnect();
    this._canvas.removeEventListener('webglcontextlost', this._onContextLost);
    this._canvas.removeEventListener('webglcontextrestored', this._onContextRestored);
    this._resize?.disconnect();
    this._activity.clearTimeout(this._frame);
    this._frame = 0;
    this._dispose();
  }

  _dispose() {
    const gl = this._gl;
    if (!gl) return;
    this._textures.forEach((texture) => gl.deleteTexture(texture));
    this._textures = [];
    if (this._program) gl.deleteProgram(this._program);
    if (this._buffer) gl.deleteBuffer(this._buffer);
    this._program = null;
    this._buffer = null;
    this._lastFrame = null;
    this.removeAttribute('data-ready');
  }

  async _initialize() {
    this._initializing = true;
    const generation = this._generation = (this._generation || 0) + 1;
    this._dispose();
    const gl = this._gl = this._canvas.getContext('webgl', {
      alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power',
    });
    try {
      if (!gl) return;
      const images = await Promise.all(['linen.webp', 'normal.webp', 'height.webp', 'roughness.webp'].map(async (file) => {
        const img = new Image();
        img.src = ASSETS + file;
        await img.decode();
        return img;
      }));
      await this._activity.wait(0);
      if (!this.isConnected || generation !== this._generation || gl.isContextLost()) return;
      const compile = (type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          const message = gl.getShaderInfoLog(shader);
          gl.deleteShader(shader);
          throw new Error(message);
        }
        return shader;
      };
      const program = this._program = gl.createProgram();
      const shaders = [];
      try {
        shaders.push(compile(gl.VERTEX_SHADER, VERTEX));
        shaders.push(compile(gl.FRAGMENT_SHADER, FRAGMENT));
        shaders.forEach((shader) => gl.attachShader(program, shader));
        gl.linkProgram(program);
      } finally { shaders.forEach((shader) => gl.deleteShader(shader)); }
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      this._buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      images.forEach((img, index) => {
        const texture = gl.createTexture();
        this._textures.push(texture);
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.uniform1i(gl.getUniformLocation(program, ['colorMap', 'normalMap', 'heightMap', 'roughnessMap'][index]), index);
      });
      this._uniforms = Object.fromEntries(['size', 'lights[0]', 'colors[0]', 'ambient', 'pointer'].map((name) => [name, gl.getUniformLocation(program, name)]));
      this.setAttribute('data-ready', '');
      this._schedule();
    } catch (error) {
      if (generation !== this._generation) return;
      this._dispose();
      console.warn('Linen lighting unavailable; using the static artwork.', error);
    } finally {
      this._initializing = false;
      if (generation !== this._generation && this._activity.active && !this._program) this._initialize();
    }
  }

  _schedule() {
    if (!this.isConnected) return;
    // Track geometry for the visible animation. GPU work is skipped when stable.
    if (!this._frame && this._activity.active) {
      this._frame = this._activity.requestAnimationFrame(() => this._paint());
    }
  }

  _paint() {
    this._frame = 0;
    if (!this._activity.active) return;
    const rect = this.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    this._schedule();
    const gl = this._gl;
    if (!this._program || !this.hasAttribute('data-ready') || gl.isContextLost()) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
    if (this._canvas.width !== width || this._canvas.height !== height) {
      this._canvas.width = width;
      this._canvas.height = height;
    }
    const lights = new Float32Array(12), colors = new Float32Array(9);
    // Lights are placed relative to the canvas, so scrolling moves the fabric
    // and the nodes together and nothing needs repainting.
    const surface = this._canvas.getBoundingClientRect();
    const sources = this._hero?.getNodeLightSources() || [];
    sources.slice(0, 3).forEach(({ rect: lightRect }, i) => {
      lights.set(nodeLightRectangle(lightRect, surface), i * 4);
      colors.set([.85, .78, .62], i * 3);
    });
    const ambient = (this._hero || this).getAttribute('data-theme') === 'light' ? .94 : .65;
    const light = pointerLight();
    const pointer = light.strength > 0
      ? [Math.round(light.x - surface.left), Math.round(surface.bottom - light.y), Math.round(light.strength * 1000) / 1000]
      : [0, 0, 0];
    const signature = [width, height, surface.width, surface.height, ambient, ...lights, ...colors, ...pointer].join(',');
    if (signature === this._lastFrame) return;
    this._lastFrame = signature;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(this._uniforms.size, surface.width, surface.height);
    gl.uniform4fv(this._uniforms['lights[0]'], lights);
    gl.uniform3fv(this._uniforms['colors[0]'], colors);
    gl.uniform1f(this._uniforms.ambient, ambient);
    gl.uniform3f(this._uniforms.pointer, ...pointer);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
customElements.define('diffui-hero-linen', DiffuiHeroLinen);
