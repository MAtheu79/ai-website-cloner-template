const CHECK_ICON = `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3.5 8.5 3 3 6-7"/></svg>`;

const TOAST_MS = 1600;

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: contents; }

    /* Rendered in the top layer so it shows over menus and outside any clipping header. */
    .toast {
      position: fixed;
      inset: auto auto 24px 50%;
      transform: translateX(-50%);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: min(420px, calc(100vw - 32px));
      padding: 9px 14px;
      border: 0;
      border-radius: var(--radius-sm, 4px);
      background: var(--header-menu-bg, #0e1113);
      color: var(--header-text, #e6edf3);
      font: 500 12px/1.4 var(--font-mono, "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
      box-shadow:
        0 0 0 1px var(--header-menu-rim, rgba(255, 255, 255, 0.12)),
        0 4px 12px rgba(0, 0, 0, 0.18),
        0 14px 28px rgba(0, 0, 0, 0.18);
      pointer-events: none;
      z-index: 1000;
    }

    .toast[hidden] { display: none; }
    .toast[popover]:not(:popover-open) { display: none; }

    .icon { display: contents; color: var(--gold, #d4a640); }
    .icon svg { width: 16px; height: 16px; flex: 0 0 auto; }
  </style>
  <div class="toast" id="toast" role="status" aria-live="polite"><span class="icon" id="icon"></span><span id="message"></span></div>
`;

const supportsPopover = typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype;

/** A brief confirmation such as "Copied light logo". Call `show(message)`; it hides itself. */
export class DiffuiCopyToast extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(template.content.cloneNode(true));
    this._toast = this.shadowRoot.getElementById("toast");
    this._timer = 0;
    if (supportsPopover) this._toast.setAttribute("popover", "manual");
    else this._toast.hidden = true;
  }

  disconnectedCallback() {
    clearTimeout(this._timer);
    this._setVisible(false);
  }

  show(message, { ok = true } = {}) {
    this.shadowRoot.getElementById("icon").innerHTML = ok ? CHECK_ICON : "";
    this.shadowRoot.getElementById("message").textContent = message;
    this._setVisible(true);
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this._setVisible(false), TOAST_MS);
  }

  _setVisible(visible) {
    if (!supportsPopover) {
      this._toast.hidden = !visible;
      return;
    }
    if (!this._toast.isConnected) return;
    const open = this._toast.matches(":popover-open");
    if (visible && !open) this._toast.showPopover();
    else if (!visible && open) this._toast.hidePopover();
  }
}

if (!customElements.get("diffui-copy-toast")) {
  customElements.define("diffui-copy-toast", DiffuiCopyToast);
}
