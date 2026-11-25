import "./diffui-button.js";
import "./diffui-modal.js";
import { extractLoginError, loginErrorMessage, stripLoginErrorParams } from "../../login-error.js";

// Feather Icons — lock (https://feathericons.com/?query=lock)
const FEATHER_LOCK_SVG = `
  <svg class="lockIcon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
`;

const GOOGLE_ICON_SVG = `
  <svg class="oauthIcon oauthIcon--google" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-.8 2.4-1.8 3.2l3 2.3c1.8-1.6 2.8-4 2.8-6.9 0-.7-.1-1.3-.2-1.9H12z"></path>
    <path fill="#34A853" d="M12 21c2.6 0 4.8-.9 6.4-2.4l-3-2.3c-.8.6-1.9 1-3.4 1-2.6 0-4.8-1.8-5.5-4.2l-3.1 2.4C5.1 18.8 8.3 21 12 21z"></path>
    <path fill="#4A90E2" d="M6.5 13.1c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2L3.4 6.7C2.8 8 2.5 9.5 2.5 11.1s.3 3.1.9 4.4l3.1-2.4z"></path>
    <path fill="#FBBC05" d="M12 4.8c1.4 0 2.7.5 3.7 1.5l2.8-2.8C16.8 1.9 14.6 1 12 1 8.3 1 5.1 3.2 3.4 6.7l3.1 2.4C7.2 6.6 9.4 4.8 12 4.8z"></path>
  </svg>
`;

const GITHUB_ICON_SVG = `
  <svg class="oauthIcon" viewBox="0 0 16 16" aria-hidden="true">
    <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.6 7.6 0 0 1 8 4.9c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.14.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
  </svg>
`;

const MICROSOFT_ICON_SVG = `
  <svg class="oauthIcon oauthIcon--microsoft" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="3" width="8.5" height="8.5" fill="#f25022"></rect>
    <rect x="12.5" y="3" width="8.5" height="8.5" fill="#7fba00"></rect>
    <rect x="3" y="12.5" width="8.5" height="8.5" fill="#00a4ef"></rect>
    <rect x="12.5" y="12.5" width="8.5" height="8.5" fill="#ffb900"></rect>
  </svg>
`;

const PROVIDERS = [
  { id: "openai", label: "Continue with ChatGPT", icon: '<img class="oauthIcon" src="/app/assets/openai-logo.svg" alt="">' },
  { id: "google", label: "Continue with Google", icon: GOOGLE_ICON_SVG },
  { id: "github", label: "Continue with GitHub", icon: GITHUB_ICON_SVG },
  { id: "microsoft", label: "Continue with Microsoft", icon: MICROSOFT_ICON_SVG },
];

// The server injects the providers it actually has credentials for
// (window.__DIFFUI_AUTH_PROVIDERS__), so the modal never offers a provider
// whose /start endpoint answers 404. A missing or malformed injection (embeds,
// cached shells) falls back to the existing providers. ChatGPT stays hidden
// unless the backend explicitly enables it.
function configuredProviders() {
  const injected = window.__DIFFUI_AUTH_PROVIDERS__;
  if (!Array.isArray(injected)) return PROVIDERS.filter((provider) => provider.id !== "openai");
  const allowed = new Set(injected.map((id) => String(id || "").trim()).filter(Boolean));
  return PROVIDERS.filter((provider) => allowed.has(provider.id));
}

// A failed OAuth callback bounces back with login_error/login_request_id in
// the URL. The params are read once per page load and stripped from the URL so
// a refresh or copied link does not re-show a stale failure; every modal
// instance on the page then shows the same message.
let loginErrorState;
let loginErrorAutoOpened = false;

function consumeLoginError() {
  if (loginErrorState !== undefined) return loginErrorState;
  let found = null;
  try {
    found = extractLoginError(window.location.search);
    if (found) {
      const rest = stripLoginErrorParams(window.location.search);
      window.history.replaceState(null, "", `${window.location.pathname}${rest}${window.location.hash}`);
    }
  } catch {
    found = null;
  }
  loginErrorState = found;
  return found;
}

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      --signin-gold: var(--gold, #d4a640);
      display: inline-flex;
      align-items: center;
    }
    :host([data-theme="light"]) {
      --signin-gold: var(--gold-soft, #b78c2f);
      --gold: var(--signin-gold);
      --panel: #ffffff;
      --border2: rgba(26, 28, 30, 0.12);
      --border: rgba(26, 28, 30, 0.14);
      --text: #1a1c1e;
      --muted: #5c6570;
      --modal-overlay: rgba(26, 28, 30, 0.35);
      --modal-shadow: 0 18px 48px rgba(26, 28, 30, 0.14);
    }
    :host([layout="stack"]) {
      display: block;
      width: 100%;
    }
    :host([no-trigger]) .triggerBtn {
      display: none;
    }
    :host([inline]) .triggerBtn,
    :host([inline]) #signinDialog {
      display: none !important;
    }
    :host([inline]) {
      display: block;
      width: 100%;
    }
    :host([inline]) .providersInline {
      display: grid;
    }
    .providersInline {
      display: none;
      gap: 10px;
    }
    .triggerBtn {
      --height: 34px;
      --padding-x: 12px;
      --gap: 8px;
      --font-size: 12px;
      --font-weight: 500;
      cursor: pointer;
    }
    :host([layout="stack"]) .triggerBtn {
      width: 100%;
    }
    #signinDialog {
      --modal-width: 350px;
      --modal-padding: 20px 32px;
    }
    :host([embedded]) {
      display: block;
      width: 100%;
      max-width: 480px;
    }
    .embeddedWrap {
      display: none;
    }
    :host([embedded]) .embeddedWrap {
      display: block;
    }
    :host([embedded]) .triggerBtn,
    :host([embedded]) #signinDialog,
    :host([embedded]) .providersInline {
      display: none !important;
    }
    #signinDialog:not([data-open="true"]) {
      display: none !important;
    }
    .embeddedPanel {
      background: var(--panel);
      border: 1px solid rgb(128 111 76);
      border-radius: var(--radius-m, 8px);
      box-shadow: 0px 3px 40px #00000080;
      padding: calc(var(--grid) * 4);
    }
    :host([data-theme="light"]) .embeddedPanel {
      border-color: rgba(183, 140, 47, 0.45);
      box-shadow: 0 18px 48px rgba(26, 28, 30, 0.12);
    }
    .localhostActions {
      display: grid;
      gap: 8px;
      margin: calc(var(--grid) * 3) 0 0;
      padding: 0;
    }
    .localhostActions[hidden] {
      display: none;
    }
    .localEmail {
      width: 100%;
      height: 40px;
      box-sizing: border-box;
      padding: 0 12px;
      border: 1px solid var(--border2, rgba(230, 237, 243, 0.14));
      border-radius: var(--radius-sm, 4px);
      background: var(--panel);
      color: var(--text, #e6edf3);
      font: 13px inherit;
    }
    .localEmail::placeholder {
      color: var(--muted, #9aa6b2);
    }
    .localEmail:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--signin-gold, #d4a640) 60%, transparent);
      outline-offset: -1px;
    }
    :host([inline]) .dialogHeader,
    :host([inline]) .dialogDivider,
    :host([inline]) .dialogLegal {
      display: none;
    }
    .providersInline .providerBtn,
    .providerBtn {
      display: block;
      width: 100%;
      --button-width: 100%;
      --height: 40px;
      --icon-size: 16px;
    }
    .dialogBody {
      text-align: center;
      display: grid;
      gap: 0;
      outline: none;
    }
    .dialogHeader {
      display: grid;
      justify-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .lockBadge {
      width: 52px;
      height: 52px;
      border: 1px dashed var(--signin-gold, #d4a640);
      border-radius: 50%;
      display: grid;
      place-items: center;
      color: var(--signin-gold, #d4a640);
      box-sizing: border-box;
    }
    .lockIcon {
      width: 22px;
      height: 22px;
      display: block;
    }
    .dialogTitle {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      line-height: 1.25;
      color: var(--text, #e6edf3);
      letter-spacing: -0.02em;
    }
    .dialogIntro {
      margin: 0;
      font-size: 14px;
      color: var(--muted, #9aa6b2);
      line-height: 1.5;
      max-width: 300px;
    }
    .dialogDivider {
      width: 48px;
      height: 2px;
      margin: 20px auto 24px;
      background: var(--signin-gold, #d4a640);
      border: 0;
      border-radius: 1px;
    }
    .providers {
      display: grid;
      gap: 10px;
    }
    .loginError {
      margin: 0 0 14px;
      padding: 10px 12px;
      border: 1px solid rgba(229, 72, 77, 0.45);
      border-radius: var(--radius-sm, 6px);
      background: rgba(229, 72, 77, 0.12);
      color: var(--text, #e6edf3);
      font-size: 13px;
      line-height: 1.5;
      text-align: left;
    }
    .loginErrorRequestId {
      display: block;
      margin-top: 4px;
      color: var(--muted, #9aa6b2);
      font-size: 11px;
    }
    .oauthIcon--google,
    .oauthIcon--microsoft {
      overflow: visible;
    }
    .dialogLegal {
      margin: 22px 0 0;
      font-size: 12px;
      line-height: 1.55;
      color: var(--muted, #9aa6b2);
    }
    .dialogLegal a {
      color: var(--signin-gold, #d4a640);
      text-decoration: none;
    }
    .dialogLegal a:hover {
      text-decoration: underline;
    }
  </style>
  <div class="embeddedWrap">
    <div class="embeddedPanel">
      <div class="dialogBody" tabindex="-1">
        <header class="dialogHeader">
          <div class="lockBadge">${FEATHER_LOCK_SVG}</div>
          <h2 class="dialogTitle" id="embeddedDialogTitle">Sign in or create an account</h2>
          <p class="dialogIntro" id="embeddedDialogIntro">Unlock the power of AI design generation.</p>
        </header>
        <div class="dialogDivider" aria-hidden="true"></div>
        <div class="providers" id="providersEmbedded"></div>
        <p class="dialogLegal">
          By continuing, you agree to our
          <a href="/tos">Terms of Service</a>
          and
          <a href="/privacy">Privacy Policy</a>.
        </p>
      </div>
      <form class="localhostActions" hidden aria-hidden="true">
        <input class="localEmail" type="email" name="email" placeholder="Email" autocomplete="username" aria-label="Email" />
      </form>
    </div>
  </div>
  <div class="providersInline" id="providersInline"></div>
  <diffui-button class="triggerBtn" id="trigger" type="button" part="trigger">
    <span id="triggerLabel">Sign in / up</span>
  </diffui-button>
  <diffui-modal id="signinDialog" data-open="false" aria-hidden="true" aria-labelledby="dialogTitle">
    <div class="dialogBody" tabindex="-1">
      <header class="dialogHeader">
        <div class="lockBadge">${FEATHER_LOCK_SVG}</div>
        <h2 class="dialogTitle" id="dialogTitle">Sign in or create an account</h2>
        <p class="dialogIntro" id="dialogIntro">Unlock the power of AI design generation.</p>
      </header>
      <div class="dialogDivider" aria-hidden="true"></div>
      <div class="providers" id="providers"></div>
      <p class="dialogLegal">
        By continuing, you agree to our
        <a href="/tos">Terms of Service</a>
        and
        <a href="/privacy">Privacy Policy</a>.
      </p>
      <form class="localhostActions" hidden aria-hidden="true">
        <input class="localEmail" type="email" name="email" placeholder="Email" autocomplete="username" aria-label="Email" />
      </form>
    </div>
  </diffui-modal>
`;

export class DiffuiSigninModal extends HTMLElement {
  static get observedAttributes() {
    return ["subtle", "trigger-label", "dialog-title", "dialog-intro", "layout", "inline", "embedded", "data-theme"];
  }

  constructor() {
    super();
    this._wired = false;
    this._previousFocus = null;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._onKeyDown = (event) => {
      if (event.key === "Escape" && this.isOpen) this.close();
    };
  }

  connectedCallback() {
    this._syncAttributes();
    this._buildProviders();
    this._syncTheme();
    this._syncEmbeddedMode();
    this._syncLocalhostActions();
    this._syncLoginError();
    if (this._wired) return;
    this._wired = true;
    this.shadowRoot.getElementById("trigger")?.addEventListener("click", () => this.open());
    this._modal()?.addEventListener("modal-overlay-click", () => this.close());
    for (const form of this.shadowRoot.querySelectorAll(".localhostActions")) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const email = form.querySelector(".localEmail")?.value?.trim() || "";
        this._localDevSignIn(email);
      });
    }
    document.addEventListener("keydown", this._onKeyDown);
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this._onKeyDown);
  }

  attributeChangedCallback() {
    this._syncAttributes();
    this._syncTheme();
    this._syncEmbeddedMode();
  }

  _modal() {
    return this.shadowRoot.getElementById("signinDialog");
  }

  _syncAttributes() {
    const trigger = this.shadowRoot.getElementById("trigger");
    if (trigger) {
      if (this.hasAttribute("subtle")) trigger.setAttribute("subtle", "");
      else trigger.removeAttribute("subtle");
    }
    const label = this.getAttribute("trigger-label");
    const labelEl = this.shadowRoot.getElementById("triggerLabel");
    if (labelEl && label) labelEl.textContent = label;
    const title = this.getAttribute("dialog-title");
    for (const titleEl of [
      this.shadowRoot.getElementById("dialogTitle"),
      this.shadowRoot.getElementById("embeddedDialogTitle"),
    ]) {
      if (titleEl && title) titleEl.textContent = title;
    }
    const intro = this.getAttribute("dialog-intro");
    for (const introEl of [
      this.shadowRoot.getElementById("dialogIntro"),
      this.shadowRoot.getElementById("embeddedDialogIntro"),
    ]) {
      if (introEl && intro) introEl.textContent = intro;
    }
  }

  _syncTheme() {
    const inherited =
      this.getAttribute("data-theme") ||
      document.documentElement.getAttribute("data-theme") ||
      document.documentElement.getAttribute("data-app-theme");
    const theme = inherited === "light" || inherited === "dark" ? inherited : null;
    if (theme && this.getAttribute("data-theme") !== theme) {
      this.setAttribute("data-theme", theme);
    }
    const apply = (el) => {
      if (!el) return;
      if (theme) el.setAttribute("data-theme", theme);
      else el.removeAttribute("data-theme");
    };
    apply(this.shadowRoot.getElementById("trigger"));
    apply(this._modal());
    for (const btn of this.shadowRoot.querySelectorAll("diffui-button")) {
      apply(btn);
    }
  }

  _syncEmbeddedMode() {
    const embedded = this.hasAttribute("embedded");
    const wrap = this.shadowRoot.querySelector(".embeddedWrap");
    if (wrap) wrap.hidden = !embedded;
    if (!embedded) this.close();
    if (!embedded) return;
    this._syncLocalhostActions();
  }

  _syncLocalhostActions() {
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "::1";
    for (const row of this.shadowRoot.querySelectorAll(".localhostActions")) {
      row.hidden = !isLocal;
      if (isLocal) row.removeAttribute("aria-hidden");
      else row.setAttribute("aria-hidden", "true");
    }
  }

  _localDevSignIn(email) {
    const trimmed = String(email || "").trim();
    if (!trimmed) return;
    if (!this.hasAttribute("inline")) this.close();
    this.dispatchEvent(
      new CustomEvent("diffui-signin-local", {
        detail: { email: trimmed },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _appendProviderButtons(root) {
    const theme = this.getAttribute("data-theme");
    for (const provider of configuredProviders()) {
      const btn = document.createElement("diffui-button");
      btn.className = "providerBtn";
      btn.type = "button";
      btn.setAttribute("data-provider", provider.id);
      btn.setAttribute("aria-label", provider.label);
      if (theme) btn.setAttribute("data-theme", theme);
      btn.innerHTML = `${provider.icon}<span>${provider.label}</span>`;
      btn.addEventListener("click", () => this._selectProvider(provider.id));
      root.appendChild(btn);
    }
  }

  _buildProviders() {
    const modalRoot = this.shadowRoot.getElementById("providers");
    if (modalRoot && modalRoot.childElementCount === 0) this._appendProviderButtons(modalRoot);
    const inlineRoot = this.shadowRoot.getElementById("providersInline");
    if (inlineRoot && inlineRoot.childElementCount === 0) this._appendProviderButtons(inlineRoot);
    const embeddedRoot = this.shadowRoot.getElementById("providersEmbedded");
    if (embeddedRoot && embeddedRoot.childElementCount === 0) this._appendProviderButtons(embeddedRoot);
    this._syncTheme();
  }

  // Shows the OAuth callback failure (if the URL carried one) above every
  // provider list, and opens the dialog variant so a bounced sign-in is never
  // silent. Inline/embedded variants are always visible, so they only need the
  // message.
  _syncLoginError() {
    if (this.shadowRoot.querySelector(".loginError")) return;
    const found = consumeLoginError();
    if (!found) return;
    for (const id of ["providersEmbedded", "providers", "providersInline"]) {
      const root = this.shadowRoot.getElementById(id);
      if (!root || !root.parentNode) continue;
      const notice = document.createElement("div");
      notice.className = "loginError";
      notice.setAttribute("role", "alert");
      const text = document.createElement("span");
      text.textContent = loginErrorMessage(found.code);
      notice.appendChild(text);
      if (found.requestId) {
        const rid = document.createElement("span");
        rid.className = "loginErrorRequestId";
        rid.textContent = `Request ID: ${found.requestId}`;
        notice.appendChild(rid);
      }
      root.parentNode.insertBefore(notice, root);
    }
    if (!this.hasAttribute("inline") && !this.hasAttribute("embedded") && !loginErrorAutoOpened) {
      loginErrorAutoOpened = true;
      this.open();
    }
  }

  open() {
    if (this.hasAttribute("inline")) return;
    this._previousFocus = document.activeElement;
    const modal = this._modal();
    if (!modal) return;
    modal.dataset.open = "true";
    modal.setAttribute("aria-hidden", "false");
    modal.querySelector(".dialogBody")?.focus?.();
  }

  close() {
    if (this.hasAttribute("inline")) return;
    const modal = this._modal();
    if (!modal) return;
    modal.dataset.open = "false";
    modal.setAttribute("aria-hidden", "true");
    if (this._previousFocus && typeof this._previousFocus.focus === "function") {
      this._previousFocus.focus();
    }
  }

  get isOpen() {
    return this._modal()?.dataset.open === "true";
  }

  _selectProvider(provider) {
    if (!this.hasAttribute("inline")) this.close();
    this.dispatchEvent(
      new CustomEvent("diffui-signin-select", {
        detail: { provider },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

function isMarketingPath(pathname) {
  const path = (pathname || "/").replace(/\/+$/, "") || "/";
  return path === "/" || path === "/pricing" || path.startsWith("/brand/") || path.startsWith("/for/");
}

function wireLocalDevSignIn() {
  if (wireLocalDevSignIn.wired) return;
  wireLocalDevSignIn.wired = true;
  document.addEventListener("diffui-signin-local", async (event) => {
    const email = String(event.detail?.email || "").trim();
    if (!email) return;
    try {
      const res = await fetch("/api/auth/local/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "request_failed");
      if (isMarketingPath(window.location.pathname)) {
        window.location.href = "/app/projects";
        return;
      }
      window.dispatchEvent(new CustomEvent("diffui:refresh-user"));
    } catch (error) {
      console.error("Local debug sign-in failed:", error);
    }
  });
}
wireLocalDevSignIn();

if (!customElements.get("diffui-signin-modal")) {
  customElements.define("diffui-signin-modal", DiffuiSigninModal);
}
