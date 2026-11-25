import "../../app/components/diffui-button.js";
import "../../app/components/diffui-modal.js";
import "./diffui-beta-signin.js";
import "./diffui-logo-menu.js";

const USE_CASE_LINKS = [
  { label: "Founders", path: "/for/founders" },
  { label: "Bootstrappers", path: "/for/bootstrappers" },
];

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      color: var(--header-text);
      --font-serif: Georgia, "Times New Roman", serif;
      --header-text: #e6edf3;
      --header-muted: #9aa6b2;
      --text: var(--header-text);
      --muted: var(--header-muted);
      --border: rgba(255, 255, 255, 0.16);
      --header-menu-bg: #0e1113;
      --header-menu-rim: rgba(255, 255, 255, 0.12);
      --header-menu-hover: rgba(255, 255, 255, 0.04);
      --theme-toggle-border: rgba(255, 255, 255, 0.16);
      --theme-toggle-color: #9aa6b2;
    }

    :host([data-theme="light"]) {
      --header-text: #1a1c1e;
      --header-muted: #5c6570;
      --text: var(--header-text);
      --muted: var(--header-muted);
      --border: rgba(26, 28, 30, 0.14);
      --header-menu-bg: #ffffff;
      --header-menu-rim: rgba(26, 28, 30, 0.14);
      --header-menu-hover: rgba(26, 28, 30, 0.04);
      --theme-toggle-border: rgba(26, 28, 30, 0.14);
      --theme-toggle-color: #5c6570;
    }

    .topbar {
      --button-underlay: var(--bg, var(--header-menu-bg));
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 28px;
      gap: 16px;
    }

    .topbarStart {
      display: flex;
      align-items: center;
      gap: 24px;
      min-width: 0;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: inherit;
      font-family: var(--font-serif);
      font-size: 17px;
      font-weight: 500;
      letter-spacing: 0.2px;
      text-decoration: none;
      -webkit-tap-highlight-color: transparent;
    }

    .brand img {
      width: 22px;
      height: 22px;
      display: block;
    }

    .brandWord {
      color: var(--header-text);
      font-size: 20px;
    }

    .topNav {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      min-width: 0;
    }

    .navLink,
    .navMenuBtn {
      height: 30px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 10px;
      border: 0;
      background: transparent;
      color: var(--header-muted);
      font-family: var(--font-mono, "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.2px;
      text-decoration: none;
      transition: color 120ms ease;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .navLink:hover,
    .navMenuBtn:hover,
    .navMenuWrap[data-open="true"] .navMenuBtn {
      color: var(--header-text);
    }

    .navLink[aria-current="page"],
    .navMenuWrap[data-active="true"] .navMenuBtn {
      color: var(--gold, #d4a640);
    }

    .navMenuWrap {
      position: relative;
    }

    .navMenuChevron {
      width: 10px;
      height: 10px;
      transition: transform 120ms ease;
    }

    .navMenuWrap[data-open="true"] .navMenuChevron {
      transform: rotate(180deg);
    }

    /* The rim in the shadow stack draws the menu's edge — no border. */
    .navMenu {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      min-width: 168px;
      padding: 6px;
      border: 0;
      border-radius: var(--radius-m, 8px);
      background: var(--header-menu-bg);
      box-shadow:
        0 0 0 1px var(--header-menu-rim),
        0 4px 12px rgba(0, 0, 0, 0.18),
        0 14px 28px rgba(0, 0, 0, 0.18);
      z-index: 20;
    }

    .navMenu[hidden] {
      display: none;
    }

    .navMenu a {
      display: flex;
      align-items: center;
      min-height: 34px;
      padding: 8px 10px;
      border-radius: var(--radius-sm, 4px);
      color: var(--header-muted);
      font-family: var(--font-mono, "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
      font-size: 13px;
      font-weight: 500;
      line-height: 1.35;
      text-decoration: none;
      transition: color 120ms ease, background 120ms ease;
    }

    .navMenu a:hover {
      color: var(--header-text);
      background: var(--header-menu-hover);
    }

    .navMenu a[aria-current="page"] {
      color: var(--gold, #d4a640);
    }

    ::slotted(a) {
      height: 30px;
      display: inline-flex;
      align-items: center;
      padding: 0 10px;
      color: var(--header-muted);
      font-family: var(--font-mono, "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.2px;
      text-decoration: none;
      transition: color 120ms ease;
    }

    ::slotted(a:hover) {
      color: var(--header-text);
    }

    ::slotted(a[aria-current="page"]) {
      color: var(--gold, #d4a640);
    }

    .authActions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .themeToggle {
      display: none;
      width: 34px;
      height: 34px;
      place-items: center;
      border: 1px solid var(--theme-toggle-border);
      border-radius: var(--radius-sm, 4px);
      background: transparent;
      color: var(--theme-toggle-color);
      cursor: pointer;
      transition: color 120ms ease, border-color 120ms ease, background 120ms ease;
      -webkit-tap-highlight-color: transparent;
    }

    .themeToggle:hover {
      color: var(--header-text);
      border-color: var(--gold, #d4a640);
      background: rgba(212, 166, 64, 0.08);
    }

    .themeToggle svg {
      width: 16px;
      height: 16px;
    }

    .themeToggle .iconSun {
      display: none;
    }

    :host([data-theme="light"]) .themeToggle .iconSun {
      display: block;
    }

    :host([data-theme="light"]) .themeToggle .iconMoon {
      display: none;
    }

    .authActions[hidden] {
      display: none;
    }

    #signinTrigger {
      --height: 34px;
      --padding-x: 12px;
      --font-size: 12px;
      --font-weight: 500;
      background: var(--landing-signin-surface, transparent);
      border-radius: var(--radius-sm, 4px);
      cursor: pointer;
    }

    #betaDialog {
      --modal-width: 390px;
      --modal-padding: 32px;
      --modal-overlay: color-mix(in srgb, #000 55%, transparent);
      --modal-shadow: 0 16px 70px rgba(0, 0, 0, .3);
      z-index: 200;
    }

    @media (max-width: 760px) {
      #useCasesWrap {
        display: none;
      }

      .topbar {
        background: var(--bg, var(--header-menu-bg));
        position: relative;
        display: block;
        padding: 14px;
      }

      .topbarStart {
        width: 100%;
        display: flex;
        align-items: flex-start;
        min-width: 0;
        box-sizing: border-box;
      }

      .brand {
        min-height: 34px;
        flex: 0 0 auto;
      }

      .authActions {
        position: absolute;
        top: 14px;
        right: 14px;
      }

      .topNav {
        flex: 1;
        min-width: 0;
        width: auto;
        flex-wrap: nowrap;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      .topbarStart:has(.navMenuWrap[data-open="true"]) .topNav {
        overflow: visible;
      }

      .navMenuWrap {
        position: static;
      }

      .navMenu {
        left: 14px;
        right: 14px;
        width: auto;
        min-width: 0;
        z-index: 40;
      }

      .navLink,
      .navMenuBtn,
      ::slotted(a) {
        flex: 0 0 auto;
      }

      #signinTrigger {
        display: none;
      }

      #signinTrigger[auth-gate] {
        display: inline-flex;
      }

      #launchDiffui {
        display: none;
      }
    }
  </style>

  <header class="topbar">
    <div class="topbarStart">
      <diffui-logo-menu>
        <a class="brand" href="/" data-nav="/" aria-label="Linen home">
          <img src="/landing/assets/linen-brand-icon.svg" alt="" />
          <span class="brandWord">linen</span>
        </a>
      </diffui-logo-menu>
      <nav class="topNav" aria-label="Primary">
        <a class="navLink" id="pricingLink" href="/pricing" data-nav="/pricing">Pricing</a>
        <a class="navLink" id="learnLink" href="/learn" data-nav="/learn">Learn</a>
        <a class="navLink" id="blogLink" href="/blog" data-nav="/blog">Blog</a>
        <div class="navMenuWrap" id="useCasesWrap">
          <button class="navMenuBtn" id="useCasesBtn" type="button" aria-haspopup="true" aria-expanded="false">
            Use cases
            <svg class="navMenuChevron" viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 5 6 8 9 5"></polyline>
            </svg>
          </button>
          <div class="navMenu" id="useCasesMenu" hidden>
            ${USE_CASE_LINKS.map(
              ({ label, path }) => `<a href="${path}" data-nav="${path}">${label}</a>`,
            ).join("")}
          </div>
        </div>
        <slot name="links"></slot>
      </nav>
    </div>
    <div class="authActions" id="signedOutActions">
      <button class="themeToggle" id="themeToggle" type="button" aria-label="Switch to dark mode">
        <svg class="iconMoon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
        <svg class="iconSun" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      </button>
      <diffui-button id="signinTrigger" subtle type="button">Sign in / up</diffui-button>
    </div>
    <div class="authActions" id="signedInActions" hidden>
      <button class="themeToggle" id="themeToggleSignedIn" type="button" aria-label="Switch to dark mode">
        <svg class="iconMoon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
        <svg class="iconSun" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      </button>
      <diffui-button id="launchDiffui" type="button" style="--height: 34px; --padding-x: 12px; --font-size: 12px;">
        <span>Launch Linen</span>
      </diffui-button>
    </div>
  </header>
  <diffui-modal id="betaDialog" data-open="false" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Sign in to Linen">
    <diffui-beta-signin id="betaSignin"></diffui-beta-signin>
  </diffui-modal>
`;

export class DiffuiLandingHeader extends HTMLElement {
  static get observedAttributes() {
    return ["logged-in", "active-path", "data-theme"];
  }

  constructor() {
    super();
    this._wired = false;
    this._openMenuId = "";
    this._clickAway = null;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this._syncAuth();
    this._syncActivePath();
    this._syncThemeToggleLabel();
    this._syncSigninTheme();
    if (this._wired) return;
    this._wired = true;
    this.shadowRoot.getElementById("signinTrigger")?.addEventListener("click", () => this.openSignin());
    this.shadowRoot.getElementById("betaDialog")?.addEventListener("modal-overlay-click", () => this.closeSignin());
    this._onKeyDown = (event) => {
      if (event.key === "Escape" && this._signinOpen()) this.closeSignin();
    };
    document.addEventListener("keydown", this._onKeyDown);
    // A bounced OAuth sign-in or a "?login=1" link opens straight to the providers.
    const beta = this.shadowRoot.getElementById("betaSignin");
    if (beta?.hasLoginError || new URLSearchParams(window.location.search).get("login") === "1") {
      this.openSignin({ mode: "login" });
    }
    this.shadowRoot.getElementById("launchDiffui")?.addEventListener("click", () => this._emitNav(this.getAttribute("launch-href") || "/app"));
    this.shadowRoot.getElementById("themeToggle")?.addEventListener("click", () => this._emitThemeToggle());
    this.shadowRoot.getElementById("themeToggleSignedIn")?.addEventListener("click", () => this._emitThemeToggle());
    this.shadowRoot.querySelector(".brand")?.addEventListener("click", (event) => this._handleAnchorNav(event, event.currentTarget));
    this.shadowRoot.getElementById("pricingLink")?.addEventListener("click", (event) => this._handleAnchorNav(event, event.currentTarget));
    this.shadowRoot.getElementById("learnLink")?.addEventListener("click", (event) => this._handleAnchorNav(event, event.currentTarget));
    for (const menuId of ["useCases"]) {
      this.shadowRoot.getElementById(`${menuId}Btn`)?.addEventListener("click", (event) => {
        event.stopPropagation();
        this._setMenuOpen(this._openMenuId === menuId ? "" : menuId);
      });
      this.shadowRoot.getElementById(`${menuId}Menu`)?.addEventListener("click", (event) => {
        const link = event.target.closest("a");
        if (!link) return;
        this._setMenuOpen("");
        this._handleAnchorNav(event, link);
      });
    }
    this.addEventListener("click", (event) => this._handleSlottedClick(event));
    this._clickAway = (event) => {
      if (!this._openMenuId) return;
      const path = event.composedPath();
      if (path.includes(this)) return;
      this._setMenuOpen("");
    };
    document.addEventListener("click", this._clickAway);
  }

  disconnectedCallback() {
    if (this._onKeyDown) document.removeEventListener("keydown", this._onKeyDown);
    if (this._clickAway) {
      document.removeEventListener("click", this._clickAway);
      this._clickAway = null;
    }
  }

  attributeChangedCallback(name) {
    this._syncAuth();
    this._syncActivePath();
    if (name === "data-theme") {
      this._syncThemeToggleLabel();
      this._syncSigninTheme();
    }
  }

  _syncThemeToggleLabel() {
    const light = this.getAttribute("data-theme") === "light";
    const label = light ? "Switch to dark mode" : "Switch to light mode";
    this.shadowRoot.getElementById("themeToggle")?.setAttribute("aria-label", label);
    this.shadowRoot.getElementById("themeToggleSignedIn")?.setAttribute("aria-label", label);
  }

  _syncSigninTheme() {
    const theme = this.getAttribute("data-theme");
    for (const id of ["signinTrigger", "betaDialog"]) {
      const el = this.shadowRoot.getElementById(id);
      if (!el) continue;
      if (theme) el.setAttribute("data-theme", theme);
      else el.removeAttribute("data-theme");
    }
  }

  _emitThemeToggle() {
    this.dispatchEvent(
      new CustomEvent("diffui-landing-theme-toggle", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  setLoggedIn(loggedIn) {
    this.toggleAttribute("logged-in", !!loggedIn);
  }

  /** Opens the sign-in dialog: account creation by default, existing-account login for { mode: "login" }. */
  openSignin({ mode = "signup" } = {}) {
    const dialog = this.shadowRoot.getElementById("betaDialog");
    const beta = this.shadowRoot.getElementById("betaSignin");
    if (!dialog || !beta) return;
    this.shadowRoot.getElementById("signinTrigger")?.setAttribute("auth-gate", "");
    if (mode === "login") beta.showLogin();
    else beta.showSignup();
    this._previousFocus = document.activeElement;
    dialog.dataset.open = "true";
    dialog.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => beta.focus());
  }

  closeSignin() {
    const dialog = this.shadowRoot.getElementById("betaDialog");
    if (!dialog) return;
    dialog.dataset.open = "false";
    dialog.setAttribute("aria-hidden", "true");
    this._previousFocus?.focus?.();
  }

  _signinOpen() {
    return this.shadowRoot.getElementById("betaDialog")?.dataset.open === "true";
  }

  _syncAuth() {
    const loggedIn = this.hasAttribute("logged-in");
    const signedOut = this.shadowRoot.getElementById("signedOutActions");
    const signedIn = this.shadowRoot.getElementById("signedInActions");
    if (signedOut) signedOut.hidden = loggedIn;
    if (signedIn) signedIn.hidden = !loggedIn;
  }

  _syncActivePath() {
    const activePath = this.getAttribute("active-path") || "";
    const pricing = this.shadowRoot.getElementById("pricingLink");
    const blog = this.shadowRoot.getElementById("blogLink");
    const learn = this.shadowRoot.getElementById("learnLink");

    if (pricing) {
      if (activePath === "/pricing") pricing.setAttribute("aria-current", "page");
      else pricing.removeAttribute("aria-current");
    }
    if (blog) {
      if (activePath === "/blog" || activePath.startsWith("/blog/")) blog.setAttribute("aria-current", "page");
      else blog.removeAttribute("aria-current");
    }
    if (learn) {
      if (activePath === "/learn" || activePath.startsWith("/learn/")) learn.setAttribute("aria-current", "page");
      else learn.removeAttribute("aria-current");
    }

    for (const menuId of ["useCases"]) {
      const wrap = this.shadowRoot.getElementById(`${menuId}Wrap`);
      const links = this.shadowRoot.querySelectorAll(`#${menuId}Menu a`);
      let anyActive = false;
      links.forEach((link) => {
        const path = link.getAttribute("data-nav") || link.getAttribute("href") || "";
        if (activePath && path === activePath) {
          link.setAttribute("aria-current", "page");
          anyActive = true;
        } else {
          link.removeAttribute("aria-current");
        }
      });
      if (wrap) wrap.dataset.active = anyActive ? "true" : "false";
    }
  }

  _setMenuOpen(openMenuId) {
    this._openMenuId = openMenuId || "";
    for (const menuId of ["useCases"]) {
      const open = menuId === this._openMenuId;
      const wrap = this.shadowRoot.getElementById(`${menuId}Wrap`);
      const menu = this.shadowRoot.getElementById(`${menuId}Menu`);
      const btn = this.shadowRoot.getElementById(`${menuId}Btn`);
      if (wrap) wrap.dataset.open = open ? "true" : "false";
      if (menu) menu.hidden = !open;
      if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
  }

  _handleSlottedClick(event) {
    const link = event.composedPath().find((el) => el instanceof HTMLAnchorElement && el.slot === "links");
    if (link) this._handleAnchorNav(event, link);
  }

  _handleAnchorNav(event, link) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.button && event.button !== 0) return;
    const path = link.getAttribute("data-nav") || link.getAttribute("href") || "";
    if (!path.startsWith("/")) return;
    event.preventDefault();
    this._emitNav(path);
  }

  _emitNav(path) {
    this.dispatchEvent(
      new CustomEvent("diffui-landing-nav", {
        detail: { path },
        bubbles: true,
        composed: true,
      }),
    );
    if (this.hasAttribute("navigate")) {
      window.location.href = path;
    }
  }
}

if (!customElements.get("diffui-landing-header")) {
  customElements.define("diffui-landing-header", DiffuiLandingHeader);
}
