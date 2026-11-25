import "../../app/components/diffui-button.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      position: fixed;
      right: 20px;
      bottom: max(20px, env(safe-area-inset-bottom));
      z-index: 1000;
      display: block;
      visibility: hidden;
      pointer-events: none;
      color: var(--text, #f4f1e8);
      font-family: var(--font-mono, "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
      transition: visibility 0s linear 180ms;
    }

    :host([open]) {
      visibility: visible;
      pointer-events: auto;
      transition-delay: 0s;
    }

    .panel {
      display: flex;
      align-items: center;
      gap: 12px;
      box-sizing: border-box;
      padding: 10px;
      border: 1px solid var(--card-border, rgba(255, 255, 255, 0.16));
      background: color-mix(in srgb, var(--bg, #111315) 92%, transparent);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
      backdrop-filter: blur(14px);
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 180ms ease, transform 180ms ease;
    }

    :host([open]) .panel {
      opacity: 1;
      transform: translateY(0);
    }

    .label {
      margin: 0 4px 0 2px;
      color: var(--text, #f4f1e8);
      font-size: 12px;
      font-weight: 600;
      line-height: 1;
      white-space: nowrap;
    }

    diffui-button {
      --height: 30px;
      --font-size: 11px;
      --padding-x: 9px;
    }

    /* diffui-button sets display on :host, which outranks the UA rule for [hidden]. */
    diffui-button[hidden] {
      display: none;
    }

    :host([data-theme="light"]) {
      color-scheme: light;
      --text: #1e201f;
      --bg: #faf8f4;
      --card-border: rgba(44, 39, 31, 0.18);
      --gold: #9b7130;
    }

    :host([data-theme="light"]) .panel {
      box-shadow: 0 12px 32px rgba(75, 59, 37, 0.14);
    }

    @media (max-width: 560px) {
      :host {
        right: 0;
        bottom: 0;
        left: 0;
        width: 100%;
      }

      .panel {
        width: 100%;
        justify-content: flex-end;
        padding: 12px max(14px, env(safe-area-inset-right)) calc(12px + env(safe-area-inset-bottom))
          max(14px, env(safe-area-inset-left));
        border-right: 0;
        border-bottom: 0;
        border-left: 0;
      }

      .label {
        margin-right: auto;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      :host,
      .panel {
        transition: none;
      }
    }
  </style>
  <aside class="panel" role="dialog" aria-label="Cookie consent" aria-modal="false">
    <p class="label" id="label">Cookies?</p>
    <diffui-button id="grantButton">Yeah</diffui-button>
    <diffui-button id="denyButton" subtle>Nah</diffui-button>
  </aside>
`;

const DO_NOT_SELL_LABEL = "Do Not Sell or Share My Personal Information";

export class DiffuiCookieConsent extends HTMLElement {
  /**
   * mode:    "opt-in" (nothing runs until accept) or "opt-out" (informational, with a way out).
   * region:  region class from the server; "us" gets the CCPA-style opt-out wording.
   * consent: the visitor's recorded choice, so a re-opened banner offers the opposite action.
   * gpc:     present when the browser is sending Global Privacy Control and the visitor has not
   *          opted in against it. Tags are already off, so the panel explains that instead of
   *          asking, and its only affirmative action is an informed opt-in.
   */
  static get observedAttributes() {
    return ["mode", "region", "consent", "gpc"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._themeObserver = null;
    this._onGrant = () => this._choose(this._primaryAction());
    this._onDeny = () => this._choose("opt-out");
  }

  attributeChangedCallback() {
    this._syncCopy();
  }

  connectedCallback() {
    this.shadowRoot.getElementById("grantButton")?.addEventListener("click", this._onGrant);
    this.shadowRoot.getElementById("denyButton")?.addEventListener("click", this._onDeny);
    this._syncCopy();
    this._syncTheme();
    this._themeObserver = new MutationObserver(() => this._syncTheme());
    this._themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-landing-theme", "data-theme"],
    });
  }

  disconnectedCallback() {
    this.shadowRoot.getElementById("grantButton")?.removeEventListener("click", this._onGrant);
    this.shadowRoot.getElementById("denyButton")?.removeEventListener("click", this._onDeny);
    this._themeObserver?.disconnect();
    this._themeObserver = null;
  }

  show() {
    this.setAttribute("open", "");
    this.setAttribute("aria-hidden", "false");
  }

  hide() {
    this.removeAttribute("open");
    this.setAttribute("aria-hidden", "true");
  }

  /**
   * What the primary button does in the current state. Only an opt-in region's "Yeah", an
   * "Opt back in", and an informed "Opt in anyway" are affirmative consent; the opt-out notice's
   * "Got it" merely dismisses it.
   */
  _primaryAction() {
    if (this.hasAttribute("gpc")) return "opt-in";
    if (this.getAttribute("mode") !== "opt-out") return "opt-in";
    return this.getAttribute("consent") === "denied" ? "opt-in" : "acknowledge";
  }

  /** Patches only the copy that differs between models; the panel itself is never rebuilt. */
  _syncCopy() {
    const label = this.shadowRoot.getElementById("label");
    const grant = this.shadowRoot.getElementById("grantButton");
    const deny = this.shadowRoot.getElementById("denyButton");
    if (!label || !grant || !deny) return;

    const optOut = this.getAttribute("mode") === "opt-out";

    if (this.hasAttribute("gpc")) {
      label.textContent = "Your browser asks us not to share your data. Ads and analytics are off.";
      grant.textContent = "Opt in anyway";
      deny.removeAttribute("aria-label");
      // Already opted out by the browser signal, so an opt-out region needs no second decline.
      deny.hidden = optOut;
      deny.textContent = "Nah";
      return;
    }

    label.textContent = "Cookies?";
    grant.textContent = "Yeah";
    deny.textContent = "Nah";
    deny.hidden = optOut && this.getAttribute("consent") === "denied";
    if (optOut && this.getAttribute("region") === "us") {
      deny.setAttribute("aria-label", DO_NOT_SELL_LABEL);
    } else {
      deny.removeAttribute("aria-label");
    }
  }

  _choose(action) {
    this.dispatchEvent(
      new CustomEvent("diffui-cookie-consent", {
        bubbles: true,
        composed: true,
        detail: { action },
      }),
    );
  }

  _syncTheme() {
    const root = document.documentElement;
    const isLight = root.dataset.landingTheme === "light" || root.dataset.theme === "light";
    if (isLight) this.setAttribute("data-theme", "light");
    else this.removeAttribute("data-theme");
  }
}

if (!customElements.get("diffui-cookie-consent")) {
  customElements.define("diffui-cookie-consent", DiffuiCookieConsent);
}
