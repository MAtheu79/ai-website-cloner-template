import { copyLogoToClipboard, logoMenuItems, menuPosition, nextMenuIndex } from "../logo-menu-model.js";
import "./diffui-copy-toast.js";

const ICONS = {
  copy: `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 3.5v-.5A1.5 1.5 0 0 0 9 1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5"/></svg>`,
  download: `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v8M4.5 6.75 8 10.25l3.5-3.5M2.5 11.5v1A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5v-1"/></svg>`,
  archive: `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="1.75" y="2.5" width="12.5" height="3.25" rx="1"/><path d="M2.75 5.75V12A1.5 1.5 0 0 0 4.25 13.5h7.5a1.5 1.5 0 0 0 1.5-1.5V5.75M6.5 8.5h3"/></svg>`,
  book: `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4.25C7 3.4 5.6 3 3.75 3H2.5v9.5h1.25c1.85 0 3.25.4 4.25 1.25m0-9.5C9 3.4 10.4 3 12.25 3h1.25v9.5h-1.25c-1.85 0-3.25.4-4.25 1.25m0-9.5v9.5"/></svg>`,
};

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: contents;
      --logo-menu-bg: var(--header-menu-bg, #0e1113);
      --logo-menu-rim: var(--header-menu-rim, rgba(255, 255, 255, 0.12));
      --logo-menu-hover: var(--header-menu-hover, rgba(255, 255, 255, 0.06));
      --logo-menu-text: var(--header-text, #e6edf3);
      --logo-menu-muted: var(--header-muted, #9aa6b2);
      --logo-menu-font: var(--font-mono, "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
    }

    /* Rendered in the top layer, so no header overflow or stacking context clips it. The rim in
       the shadow stack draws the edge, matching the header's nav menus. */
    .menu {
      position: fixed;
      inset: auto;
      margin: 0;
      border: 0;
      background: var(--logo-menu-bg);
      color: var(--logo-menu-text);
      font-family: var(--logo-menu-font);
      box-shadow:
        0 0 0 1px var(--logo-menu-rim),
        0 4px 12px rgba(0, 0, 0, 0.18),
        0 14px 28px rgba(0, 0, 0, 0.18);
      z-index: 1000;
      min-width: 208px;
      padding: 6px;
      overflow: visible;
      border-radius: var(--radius-m, 8px);
    }

    .menu[hidden] { display: none; }
    .menu[popover]:not(:popover-open) { display: none; }

    .item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      min-height: 34px;
      padding: 8px 10px;
      border: 0;
      border-radius: var(--radius-sm, 4px);
      background: transparent;
      color: var(--logo-menu-muted);
      font: 500 13px/1.35 var(--logo-menu-font);
      text-align: left;
      text-decoration: none;
      box-sizing: border-box;
      white-space: nowrap;
      cursor: pointer;
      outline: none;
      transition: color 120ms ease, background 120ms ease;
      -webkit-tap-highlight-color: transparent;
    }

    .item:hover,
    .item:focus-visible {
      color: var(--logo-menu-text);
      background: var(--logo-menu-hover);
    }

    .item:focus-visible {
      box-shadow: inset 0 0 0 1px var(--gold, #d4a640);
    }

    .item svg {
      width: 16px;
      height: 16px;
      flex: 0 0 auto;
    }

    .separator {
      height: 1px;
      margin: 5px 4px;
      background: var(--logo-menu-rim);
    }

  </style>
  <slot></slot>
  <div class="menu" id="menu" role="menu" aria-label="Linen logo" aria-orientation="vertical" tabindex="-1"></div>
  <diffui-copy-toast id="toast"></diffui-copy-toast>
`;

const supportsPopover = typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype;

/**
 * Wraps a header logo link. A right-click (or the context-menu key) on it opens a menu to copy or
 * download the Linen logos and brand assets instead of the browser's own menu; a normal click
 * still navigates.
 */
export class DiffuiLogoMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(template.content.cloneNode(true));
    this._menu = this.shadowRoot.getElementById("menu");
    this._toast = this.shadowRoot.getElementById("toast");
    this._open = false;
    if (supportsPopover) this._menu.setAttribute("popover", "manual");
    else this._menu.hidden = true;
    for (const item of logoMenuItems()) this._menu.appendChild(this._createItem(item));

    this._onContextMenu = (event) => this._handleContextMenu(event);
    this._onMenuKeyDown = (event) => this._handleMenuKeyDown(event);
    this._onMenuClick = (event) => this._handleMenuClick(event);
    this._onMenuPointerMove = (event) => {
      const item = event.target.closest?.(".item");
      if (item && this.shadowRoot.activeElement !== item) item.focus({ preventScroll: true });
    };
    this._onDocPointerDown = (event) => {
      if (!event.composedPath().includes(this._menu)) this.close();
    };
    this._onDocKeyDown = (event) => {
      if (event.key === "Escape") this.close({ restoreFocus: true });
    };
    this._onDismiss = () => this.close();
  }

  connectedCallback() {
    this.addEventListener("contextmenu", this._onContextMenu);
    this._menu.addEventListener("keydown", this._onMenuKeyDown);
    this._menu.addEventListener("click", this._onMenuClick);
    this._menu.addEventListener("pointermove", this._onMenuPointerMove);
  }

  disconnectedCallback() {
    this.removeEventListener("contextmenu", this._onContextMenu);
    this._menu.removeEventListener("keydown", this._onMenuKeyDown);
    this._menu.removeEventListener("click", this._onMenuClick);
    this._menu.removeEventListener("pointermove", this._onMenuPointerMove);
    this.close();
  }

  get isOpen() {
    return this._open;
  }

  /** The wrapped logo link the menu anchors under. */
  get anchor() {
    return this.shadowRoot.querySelector("slot").assignedElements()[0] || null;
  }

  open() {
    const anchor = this.anchor;
    if (!anchor) return;
    if (!this._open) {
      this._open = true;
      this._setMenuVisible(true);
      document.addEventListener("pointerdown", this._onDocPointerDown, true);
      document.addEventListener("keydown", this._onDocKeyDown);
      window.addEventListener("scroll", this._onDismiss, { capture: true, passive: true });
      window.addEventListener("resize", this._onDismiss);
      window.addEventListener("blur", this._onDismiss);
    }
    this._position();
    this._items()[0]?.focus({ preventScroll: true });
  }

  close({ restoreFocus = false } = {}) {
    if (!this._open) return;
    this._open = false;
    this._setMenuVisible(false);
    document.removeEventListener("pointerdown", this._onDocPointerDown, true);
    document.removeEventListener("keydown", this._onDocKeyDown);
    window.removeEventListener("scroll", this._onDismiss, { capture: true });
    window.removeEventListener("resize", this._onDismiss);
    window.removeEventListener("blur", this._onDismiss);
    if (restoreFocus) this.anchor?.focus({ preventScroll: true });
  }

  _handleContextMenu(event) {
    event.preventDefault();
    if (event.composedPath().includes(this._menu)) return;
    this.open();
  }

  _handleMenuKeyDown(event) {
    const items = this._items();
    const current = items.indexOf(this.shadowRoot.activeElement);
    const next = nextMenuIndex(current, event.key, items.length);
    if (next >= 0) {
      event.preventDefault();
      items[next].focus({ preventScroll: true });
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      this.close({ restoreFocus: true });
    } else if (event.key === "Tab") {
      this.close();
    } else if ((event.key === "Enter" || event.key === " ") && current >= 0) {
      event.preventDefault();
      this._activate(items[current]);
    }
  }

  _handleMenuClick(event) {
    const item = event.target.closest(".item");
    if (!item) return;
    // Links navigate on their own; only modified clicks (new tab) skip the menu bookkeeping.
    if (item._logoMenuItem?.action === "link") {
      this.close();
      return;
    }
    this._activate(item);
  }

  _activate(element) {
    const item = element._logoMenuItem;
    if (!item) return;
    if (item.action === "link") {
      this.close();
      element.click();
      return;
    }
    this.close({ restoreFocus: true });
    if (item.action === "copy") this._copy(item.asset);
    else this._download(item.asset);
  }

  async _copy(asset) {
    try {
      await copyLogoToClipboard(asset);
      this._toast.show(`Copied ${asset.label}`);
    } catch {
      this._toast.show(`Couldn't copy the ${asset.label}`, { ok: false });
    }
  }

  _download(asset) {
    const link = document.createElement("a");
    link.href = asset.url;
    link.download = asset.filename;
    link.hidden = true;
    this.shadowRoot.appendChild(link);
    link.click();
    link.remove();
  }

  _createItem(item) {
    if (item.separator) {
      const separator = document.createElement("div");
      separator.className = "separator";
      separator.setAttribute("role", "separator");
      return separator;
    }
    const element = document.createElement(item.action === "link" ? "a" : "button");
    if (item.action === "link") element.href = item.href;
    else element.type = "button";
    element.className = "item";
    element.setAttribute("role", "menuitem");
    element.tabIndex = -1;
    element.dataset.action = item.action;
    if (item.asset) element.dataset.asset = item.asset.id;
    element.innerHTML = ICONS[item.icon];
    element.append(item.label);
    element._logoMenuItem = item;
    return element;
  }

  _items() {
    return [...this._menu.querySelectorAll(".item")];
  }

  _position() {
    const anchor = this.anchor;
    if (!anchor) return;
    const { left, top } = menuPosition(
      anchor.getBoundingClientRect(),
      { width: this._menu.offsetWidth, height: this._menu.offsetHeight },
      { width: document.documentElement.clientWidth, height: window.innerHeight },
    );
    this._menu.style.left = `${left}px`;
    this._menu.style.top = `${top}px`;
  }

  _setMenuVisible(visible) {
    if (!supportsPopover) {
      this._menu.hidden = !visible;
      return;
    }
    const open = this._menu.matches(":popover-open");
    if (visible && !open) this._menu.showPopover();
    else if (!visible && open) this._menu.hidePopover();
  }
}

if (!customElements.get("diffui-logo-menu")) {
  customElements.define("diffui-logo-menu", DiffuiLogoMenu);
}
