// Shared pre-image loading treatment. The light-DOM text remains the accessible
// label; noise is decorative and pauses while hidden or offscreen.
export class DiffuiGeneratingField extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display:grid; place-items:center; position:relative; overflow:hidden; isolation:isolate; }
        canvas { position:absolute; inset:0; width:100%; height:100%; pointer-events:none;
          mask-image:radial-gradient(ellipse at center, transparent 0%, transparent 18%, #0002 38%, #0008 65%, #000 100%); }
        .label { position:relative; z-index:1; }
      </style>
      <canvas aria-hidden="true"></canvas><span class="label"><slot></slot></span>`;
    this._canvas = this.shadowRoot.querySelector("canvas");
    this._cells = [];
  }

  connectedCallback() {
    this._motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this._onMotion = () => this._restart();
    this._motion.addEventListener("change", this._onMotion);
    this._onVisibility = () => this._restart();
    document.addEventListener("visibilitychange", this._onVisibility);
    this._resize = new ResizeObserver(() => { this._cells = []; this._restart(); });
    this._resize.observe(this);
    this._intersection = new IntersectionObserver(entries => {
      this._visible = entries.some(entry => entry.isIntersecting);
      this._restart();
    });
    this._intersection.observe(this);
  }

  disconnectedCallback() {
    clearTimeout(this._timer);
    this._resize?.disconnect();
    this._intersection?.disconnect();
    this._motion?.removeEventListener("change", this._onMotion);
    document.removeEventListener("visibilitychange", this._onVisibility);
  }

  _restart() {
    clearTimeout(this._timer);
    if (!this.isConnected || !this._visible || document.hidden) return;
    this._paint();
  }

  _paint() {
    const width = Math.min(1600, this.clientWidth), height = Math.min(1200, this.clientHeight);
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const canvas = this._canvas;
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      this._cells = [];
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = getComputedStyle(this).color;
    const glyphs = '.:+*=/|01';
    let index = 0;
    for (let y = 10; y < height; y += 13) {
      for (let x = 4; x < width; x += 10) {
        let cell = this._cells[index];
        if (!cell || Math.random() < 0.08) {
          cell = this._cells[index] = { glyph: glyphs[Math.floor(Math.random() * glyphs.length)], alpha: Math.random() < 0.52 ? 0 : 0.18 + Math.random() * 0.52 };
        }
        ctx.globalAlpha = cell.alpha;
        ctx.fillText(cell.glyph, x, y);
        index++;
      }
    }
    if (!this._motion.matches) this._timer = setTimeout(() => this._paint(), 150);
  }
}

if (!customElements.get("diffui-generating-field")) customElements.define("diffui-generating-field", DiffuiGeneratingField);
