// <diffui-landing-canvas-stack-dock> is the marketing canvas's copy of the
// editor's option dock: one bar fixed to the bottom center of the canvas that
// shows the selected node's option thumbnails and a + button. It mirrors a
// <diffui-landing-canvas-image-stack> and patches only the thumbnail that
// changed when the stack announces a `stack-change`.
//
//   dock.attach(stack)   show this stack's options
//   dock.close()         fade out (keeps the last bar, as the editor does)
//   dock.thumb(index)    the thumbnail element, for cursor targets

const THUMB_HEIGHT = 34;
const MAX_THUMB_WIDTH = 64;

const PLUS_ICON = `
  <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" fill="none">
    <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  </svg>
`;

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      position: absolute;
      left: 50%;
      bottom: 14px;
      z-index: 40;
      display: block;
      max-width: calc(100% - 48px);
      opacity: 0;
      visibility: hidden;
      transform: translate(-50%, 8px);
      pointer-events: none;
      transition: opacity 160ms ease, transform 160ms ease, visibility 0s linear 160ms;
      --dock-panel: rgba(10, 12, 16, 0.96);
      --dock-rim: rgba(255, 255, 255, 0.12);
      --dock-rim-strong: rgba(255, 255, 255, 0.22);
      --dock-chip: rgba(255, 255, 255, 0.08);
      --dock-shadow: 0 16px 46px rgba(0, 0, 0, 0.38);
      --dock-accent: #ffc533;
      --dock-sweep: rgba(255, 255, 255, 0.16);
    }

    :host([data-theme="light"]) {
      --dock-panel: rgba(252, 251, 248, 0.98);
      --dock-rim: rgba(26, 28, 30, 0.14);
      --dock-rim-strong: rgba(26, 28, 30, 0.26);
      --dock-chip: rgba(26, 28, 30, 0.06);
      --dock-shadow: 0 16px 46px rgba(26, 28, 30, 0.16);
      --dock-accent: #b1852f;
      --dock-sweep: rgba(255, 255, 255, 0.7);
    }

    :host([data-open="true"]) {
      opacity: 1;
      visibility: visible;
      transform: translate(-50%, 0);
      transition-delay: 0s;
    }

    .bar {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 7px;
      border: 1px solid var(--dock-rim);
      border-radius: 11px;
      background: var(--dock-panel);
      box-shadow: var(--dock-shadow);
      box-sizing: border-box;
    }

    .thumbs {
      display: flex;
      align-items: center;
      gap: 7px;
      min-width: 0;
      overflow: hidden;
      padding: 2px;
    }

    .thumb {
      position: relative;
      flex: 0 0 auto;
      width: var(--thumb-width, 60px);
      height: ${THUMB_HEIGHT}px;
      padding: 0;
      border: 1px solid var(--dock-rim-strong);
      border-radius: 5px;
      background: var(--dock-chip);
      box-sizing: border-box;
      overflow: hidden;
      transition: border-color 140ms ease, box-shadow 140ms ease;
    }

    .thumb img {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }

    .thumb img:not([src]) {
      display: none;
    }

    .thumb[data-active="true"] {
      border-color: var(--dock-accent);
      box-shadow: 0 0 0 1px var(--dock-accent);
    }

    .thumb[data-status="loading"]::after,
    .thumb[data-status="partial"]::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(110deg, transparent 20%, var(--dock-sweep) 50%, transparent 80%);
      background-size: 200% 100%;
      animation: dockShimmer 1.5s linear infinite;
    }

    .add {
      flex: 0 0 auto;
      display: grid;
      place-items: center;
      width: 31px;
      height: 31px;
      border: 1px solid rgba(173, 120, 0, 0.45);
      border-radius: 6px;
      background: linear-gradient(90deg, rgba(204, 154, 19, 0.65) 0%, rgba(232, 197, 107, 0.58) 100%);
      color: #1a1c1e;
      box-shadow: 1px 1px 0 0 #d7c0d278, 0 2px 3px 0 rgb(82 56 0 / 15%);
    }

    @keyframes dockShimmer {
      from { background-position: 200% 0; }
      to { background-position: -200% 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .thumb::after { animation: none !important; }
    }
  </style>
  <div class="bar" aria-hidden="true">
    <div class="thumbs" id="thumbs"></div>
    <div class="add">${PLUS_ICON}</div>
  </div>
`;

export class DiffuiLandingCanvasStackDock extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._thumbs = this.shadowRoot.getElementById("thumbs");
    this._stack = null;
    this._onStackChange = (event) => this._patch(event.detail || {});
  }

  disconnectedCallback() {
    this._release();
  }

  /** Mirror `stack`'s options and fade in. */
  attach(stack) {
    if (!stack) return;
    if (this._stack !== stack) {
      this._release();
      this._stack = stack;
      stack.dock = this;
      stack.addEventListener("stack-change", this._onStackChange);
      this._rebuild();
    }
    if (this.dataset.open !== "true") this.dataset.open = "true";
  }

  close() {
    if (this.dataset.open !== "false") this.dataset.open = "false";
  }

  /** Close and let go of the stack, e.g. when a demo resets. */
  clear() {
    this.close();
    this._release();
    this._thumbs.replaceChildren();
  }

  get stack() {
    return this._stack;
  }

  thumb(index) {
    return this._thumbs.querySelector(`.thumb[data-index="${index}"]`);
  }

  _release() {
    if (!this._stack) return;
    this._stack.removeEventListener("stack-change", this._onStackChange);
    if (this._stack.dock === this) this._stack.dock = null;
    this._stack = null;
  }

  _patch({ type, index }) {
    if (!this._stack) return;
    if (type === "slots") this._rebuild();
    else if (type === "slot") this._syncThumb(index);
    else if (type === "active") this._syncActive();
  }

  _rebuild() {
    const stack = this._stack;
    const width = Math.round(Math.min(MAX_THUMB_WIDTH, THUMB_HEIGHT * (stack?.aspect || 16 / 9)));
    this.style.setProperty("--thumb-width", `${width}px`);
    const options = stack?.options || [];
    this._thumbs.replaceChildren(...options.map((_, index) => {
      const thumb = document.createElement("div");
      thumb.className = "thumb";
      thumb.dataset.index = String(index);
      const image = document.createElement("img");
      image.alt = "";
      image.decoding = "async";
      thumb.appendChild(image);
      return thumb;
    }));
    options.forEach((_, index) => this._syncThumb(index));
    this._syncActive();
  }

  _syncThumb(index) {
    const thumb = this.thumb(index);
    const option = this._stack?.options?.[index];
    if (!thumb || !option) return;
    if (thumb.dataset.status !== option.status) thumb.dataset.status = option.status;
    const image = thumb.firstElementChild;
    if (option.url && image.getAttribute("src") !== option.url) image.src = option.url;
  }

  _syncActive() {
    const active = this._stack?.activeIndex ?? -1;
    for (const thumb of this._thumbs.children) {
      const on = Number(thumb.dataset.index) === active ? "true" : "false";
      if (thumb.dataset.active !== on) thumb.dataset.active = on;
    }
  }
}

if (!customElements.get("diffui-landing-canvas-stack-dock")) {
  customElements.define("diffui-landing-canvas-stack-dock", DiffuiLandingCanvasStackDock);
}
