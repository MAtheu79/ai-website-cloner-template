import "../../app/components/diffui-button.js";
import { connectLandingTheme } from "../landing-theme.js";
import "./diffui-landing-footer.js";
import "./diffui-landing-header.js";
import "./diffui-landing-river.js";
import "./diffui-landing-reviews.js";
import "./diffui-landing-team-agent.js";
import "./diffui-landing-lit-ribbon.js";
import "./diffui-landing-canvas-hero.js";
import "./diffui-hero-linen.js";


const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      overflow-x: clip;
      color: var(--text);
      font-family: var(--font);
      --font-serif: "Playfair Display", Georgia, "Times New Roman", serif;
    }

    .page {
      position: relative;
      isolation: isolate;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--bg);
      background-image: radial-gradient(var(--dot) 1px, transparent 1px);
      background-size: 16px 16px;
      background-position: 0 0;
    }

    #heroLinen {
      position: absolute;
      inset: var(--linen-top, 0px) 0 auto;
      height: var(--linen-height, 950px);
      width: 109%;
      z-index: -1;
      overflow: clip;
    }

    #canvasHero {
      --node-emission-shadow: 0 0 22px rgba(255, 225, 166, .176), 0 0 60px rgba(255, 222, 160, .096);
    }

    #landingHeader {
      --landing-signin-surface: var(--bg);
    }

    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: calc(100vh - 130px);
      padding: 32px 24px 72px;
    }

    .heroBlock {
      max-width: 960px;
      text-align: center;
      margin: 40px auto 40px;
    }
    .heroTitle {
      font-family: var(--font-serif);
      font-size: clamp(40px, 6vw, 68px);
      line-height: 1.05;
      font-weight: 500;
      margin: 0 0 18px;
      letter-spacing: -0.5px;
    }
    .heroSub {
      margin: 0;
      color: var(--muted);
      font-size: 16px;
      line-height: 1.5;
    }
    .heroSub .accent {
      color: var(--gold);
      font-weight: 600;
    }

    .heroCanvas {
      width: calc(100% + 48px);
      max-width: none;
      margin-left: -24px;
      margin-right: -24px;
      margin-top: -60px;
      margin-bottom: 8px;
      /* Raised up to 40px without moving anything after it, clear of the
         designs under the fabric's lower edge. Narrower windows keep it lower,
         where the subheading wraps and needs the room. */
      position: relative;
      top: clamp(-40px, calc((1100px - 100vw) * 0.2), 0px);
      padding: 0 20px;
      box-sizing: border-box;
    }

    .comparisonIntro {
      max-width: 960px;
      text-align: center;
      margin: 0 auto 32px;
      padding: 0 24px;
    }

    .comparisonIntro .heroSub {
      max-width: 640px;
      margin: 0 auto;
    }

    /* The river's heading sits at the page's left edge. */
    .comparisonIntro.riverIntro,
    .comparisonIntro.riverIntro .heroSub {
      text-align: left;
    }
    .comparisonIntro.riverIntro .heroSub {
      margin-left: 0;
    }
    .page {
      --river-gap: 200px;
    }
    /* Left-aligned, within a centered 1600px column on wide screens. */
    .comparisonIntro.riverIntro {
      width: 100%;
      max-width: 1600px;
      box-sizing: border-box;
      margin: var(--river-gap) auto 36px;
    }
    /* Full width: stretched across main's 24px side padding. */
    .teamAgentSection {
      display: block;
      align-self: stretch;
      width: auto;
      margin: 0 -24px;
    }
    /* A linen ribbon is the edge between the team section and the reviews:
       the team section's color runs on above the ribbon's centerline (the
       polygon, traced from the artwork), and the page's dot grid shows below. */
    .ribbonDivider {
      position: relative;
      align-self: stretch;
      /* Pulled up into the team section's bottom space; the reviews below
         also tuck up under its lower edge. */
      /* Scales with the ribbon, which gets shorter on narrow pages. */
      margin: max(-140px, -10.1vw) -24px 0;
      aspect-ratio: 2048 / 1000;
      pointer-events: none;
    }
    .ribbonDivider::before {
      content: "";
      position: absolute;
      inset: 0;
      /* Behind the team section's content where the two overlap. */
      z-index: -1;
      background: light-dark(#f1ede5, #121519);
      clip-path: polygon(0% 0%, 100% 0%, 100.0% 74.7%, 97.7% 75.7%, 95.3% 76.4%, 92.8% 76.9%, 90.4% 77.1%, 87.9% 77.0%, 85.5% 76.6%, 83.0% 75.9%, 80.6% 75.1%, 78.2% 74.0%, 75.7% 72.4%, 73.3% 70.1%, 70.8% 67.2%, 68.4% 64.0%, 66.0% 62.2%, 63.5% 61.4%, 61.1% 60.6%, 58.6% 59.6%, 56.2% 58.6%, 53.7% 57.5%, 51.3% 56.0%, 48.9% 54.6%, 46.4% 53.2%, 44.0% 51.9%, 41.5% 50.4%, 39.1% 48.7%, 36.6% 46.7%, 34.2% 44.5%, 31.8% 42.5%, 29.3% 40.6%, 26.9% 39.7%, 24.4% 39.5%, 22.0% 38.6%, 19.5% 37.5%, 17.1% 36.8%, 14.7% 36.1%, 12.2% 35.6%, 9.8% 35.3%, 7.3% 35.0%, 4.9% 34.6%, 2.4% 34.1%, 0.0% 33.7%);
    }
    .ribbonDivider diffui-landing-lit-ribbon {
      position: absolute;
      inset: 0;
    }
    /* Designs rise out from behind the band and fade out at the top. The
       hero fabric stops --river-gap above this (see _setupHeroLinen). */
    .riseSection {
      position: relative;
      width: 100%;
      height: clamp(400px, calc(64vw - 300px), 850px);
      margin-top: calc(128px + var(--river-gap));
      /* The designs run the full window width and rise up behind the hero
         fabric (see _setupHeroLinen), so nothing clips them here. */
      overflow: visible;
    }
    .riseSection diffui-landing-river {
      position: absolute;
      top: 0;
      bottom: 0;
      left: calc(50% - 50vw);
      width: 100vw;
      /* Under the hero fabric (z-index -1), which they disappear behind. */
      z-index: -2;
      /* Below the band's middle: the team section's color, so the band is the
         divider between the two. */
      --river-floor: light-dark(#f1ede5, #121519);
    }
    /* The heading floats in a small card over the designs, at the right of
       the centered 1600px column and a little above the section's middle. */
    .riseSection .comparisonIntro.riverIntro {
      position: absolute;
      left: 0;
      right: 0;
      /* Centered on the line where designs turn from code into pages (set
         from the river's decodeLineY by _placeRiseCard). */
      top: var(--decode-line, 28%);
      transform: translateY(-50%);
      z-index: 1;
      margin: 0 auto;
      pointer-events: none;
    }
    .riseSection .plate {
      margin-left: auto;
      width: min(440px, 100%);
      box-sizing: border-box;
      padding: 36px 36px 30px;
      border-radius: var(--radius-lg, 11px);
      border: 1px solid color-mix(in srgb, var(--text) 9%, transparent);
      background: color-mix(in srgb, var(--bg) 86%, transparent);
      -webkit-backdrop-filter: blur(18px) saturate(1.1);
      backdrop-filter: blur(18px) saturate(1.1);
      box-shadow: 0 30px 80px rgba(16, 12, 6, 0.24), 0 4px 14px rgba(16, 12, 6, 0.1);
      pointer-events: auto;
    }
    .riseSection .plate .heroTitle {
      margin: 0 0 18px;
      font-size: clamp(32px, 3.1vw, 42px);
      line-height: 1.08;
    }
    .riseSection .plate .heroSub {
      max-width: none;
      font-size: clamp(16px, 1.35vw, 19px);
      line-height: 1.55;
    }
    .riseSection .plate .latencyNote {
      margin: 26px 0 0;
      padding-top: 20px;
      border-top: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
      max-width: none;
      font-size: 13px;
    }
    .reviewsSection {
      display: block;
      max-width: 1400px;
      margin: max(-36px, -2.6vw) auto var(--river-gap);
    }
    .riverIntro .heroSub {
      max-width: 600px;
    }
    .riverIntro .accent {
      color: var(--gold);
    }
    .riverIntro .footnoteRef {
      font-family: var(--font-sans, inherit);
      font-size: 0.55em;
      font-weight: 600;
      color: var(--gold);
      vertical-align: super;
      margin-left: 2px;
    }
    .latencyNote {
      margin: 14px 0 0;
      max-width: 560px;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.5;
    }
    .latencyNote sup {
      color: var(--gold);
      font-weight: 600;
    }


    .mockTable {
      display: grid;
      grid-template-columns: 1.4fr 0.7fr 0.7fr 0.8fr;
      gap: 6px 10px;
      font-family: var(--font-mono);
      font-size: 10px;
    }
    .mockTable .th {
      color: var(--mock-muted);
      border-bottom: 1px solid var(--mock-border);
      padding-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      font-size: 9px;
    }
    .mockTable .td {
      color: var(--mock-text);
      padding: 3px 0;
    }
    .mockTable .td.num {
      text-align: right;
      color: var(--gold);
    }
    .mockViewAllWrap {
      margin-top: auto;
    }
    .mockViewAll {
      --height: 26px;
      --padding-x: 10px;
      --font-size: 10px;
      --gap: 6px;
    }

    .mockForm {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-family: var(--font);
    }
    .mockFormHead {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .mockFormTitle {
      font-weight: 700;
      font-size: 11px;
    }
    .mockToggle {
      width: 28px;
      height: 14px;
      background: var(--gold);
      position: relative;
      border-radius: 999px;
      flex: 0 0 auto;
    }
    .mockToggle::after {
      content: "";
      position: absolute;
      top: 1px;
      right: 1px;
      width: 12px;
      height: 12px;
      background: #1a1200;
      border-radius: 50%;
    }
    .mockFormText {
      color: var(--mock-muted);
      font-size: 10px;
      line-height: 1.4;
    }
    .mockFormFields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .mockFormField {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .mockFormLabel {
      font-size: 9px;
      color: var(--mock-muted);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .mockFormInput {
      height: 22px;
      border: 1px solid var(--mock-input-border);
      background: var(--mock-input-bg);
      color: var(--mock-text);
      padding: 0 6px;
      font-size: 10px;
      display: flex;
      align-items: center;
    }
    .mockSaveBtnWrap {
      margin-top: 2px;
    }

    .mockChart {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .mockChartHead {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 6px;
    }
    .mockChartTitle {
      font-weight: 700;
      font-size: 11px;
    }
    .mockChartMetrics {
      display: flex;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--mock-muted);
    }
    .mockChartMetrics b {
      color: var(--mock-text);
      font-weight: 600;
      display: block;
      font-size: 10px;
    }
    .mockChartBars {
      display: grid;
      grid-template-columns: repeat(24, 1fr);
      gap: 2px;
      height: 70px;
      align-items: end;
    }
    .mockChartBars span {
      background: rgba(212, 166, 64, 0.25);
      display: block;
      height: var(--h, 10%);
    }
    .mockChartBars span[data-tall="true"] {
      background: var(--gold);
    }
    .mockChartAxis {
      display: flex;
      justify-content: space-between;
      color: var(--mock-muted);
      font-size: 9px;
      font-family: var(--font-mono);
    }

    .sectionHero {
      text-align: center;
      margin-bottom: 28px;
    }
    .sectionHero .heroTitle {
      font-size: clamp(32px, 4.4vw, 48px);
      margin-bottom: 14px;
    }
    .sectionHero .heroSub {
      font-size: 15px;
    }
    .betaTag {
      display: inline-block;
      vertical-align: middle;
      margin-left: 12px;
      padding: 4px 10px;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--gold);
      background: rgba(212, 166, 64, 0.1);
      border: 1px solid rgba(212, 166, 64, 0.5);
      border-radius: 999px;
      transform: translateY(-8px);
    }

    @media (max-width: 760px) {
      .riseSection { height: 640px; }
      /* A smaller card, centered, resting on the top edge of the band. */
      .riseSection .comparisonIntro.riverIntro {
        top: calc(var(--band-top, 70%) + 28px);
        transform: translateY(-100%);
        padding: 0 16px;
      }
      .riseSection .plate {
        width: min(340px, 100%);
        margin: 0 auto;
        padding: 22px 22px 18px;
      }
      .riseSection .plate .heroTitle {
        margin-bottom: 12px;
        font-size: 28px;
      }
      .riseSection .plate .heroSub {
        font-size: 15px;
        line-height: 1.5;
      }
      .riseSection .plate .latencyNote {
        margin-top: 16px;
        padding-top: 14px;
        font-size: 11.5px;
      }
      #heroLinen {
        width: 100%;
        overflow: visible;
        --linen-lift: 80px;
        --linen-transform: scale(1.25);
      }

      .heroCanvas {
        width: calc(100% + 48px);
        max-width: none;
        margin-left: -24px;
        margin-right: -24px;
        padding-top: 8px;
        margin-top: -32px;
        margin-bottom: 0;
        top: 0;
      }

      .heroCanvas diffui-landing-canvas-hero {
        width: 200%;
        transform: scale(0.6);
        transform-origin: top left;
        margin-bottom: -35%;
        margin-left: -10%;
      }
    }
  </style>

  <div class="page">
    <diffui-hero-linen id="heroLinen"></diffui-hero-linen>
    <diffui-landing-header id="landingHeader"></diffui-landing-header>

    <main>
      <section class="heroBlock">
        <h1 class="heroTitle">Design fabric<br/>for the AI era.</h1>
        <p class="heroSub">AI-driven design generation that's <span class="accent">fast, brand-compliant,</span> and <span class="accent">built for creativity.</span></p>
      </section>

      <section class="heroCanvas" aria-label="Linen canvas demo">
        <diffui-landing-canvas-hero id="canvasHero"></diffui-landing-canvas-hero>
      </section>

      <section class="riseSection" aria-label="Designs rising from prompt to page">
        <diffui-landing-river mode="rise"></diffui-landing-river>
        <div class="comparisonIntro sectionHero riverIntro">
          <div class="plate">
            <h2 class="heroTitle">From prompt to page in <span class="latencyFigure" hidden><span class="accent"><span class="latency"></span> seconds</span><sup class="footnoteRef" aria-describedby="latencyNote">*</sup></span><span class="latencyFallback">seconds</span></h2>
            <p class="heroSub">Linen generates at the speed of exploration. Don't derail your train of thought, test and explore directions live.</p>
            <p class="latencyNote" id="latencyNote" hidden>*Average time from prompt to finished design across every Linen generation in the last 30 days.</p>
          </div>
        </div>
      </section>

      <diffui-landing-team-agent class="teamAgentSection" aria-label="Teams and agents"></diffui-landing-team-agent>
      <div class="ribbonDivider" aria-hidden="true">
        <diffui-landing-lit-ribbon base="/landing/assets/ribbon/"></diffui-landing-lit-ribbon>
      </div>

      <diffui-landing-reviews class="reviewsSection" aria-label="Reviews"></diffui-landing-reviews>
    </main>

    <diffui-landing-footer></diffui-landing-footer>
  </div>
`;

export class DiffuiLandingPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._disconnectTheme = null;
  }

  connectedCallback() {
    this._disconnectTheme ||= connectLandingTheme(this);
    this._setupHeroCanvas();
    this._setupHeroLinen();
    if (!this._initialized) {
      this._wireButtons();
      this._loadLatency();
      this._initialized = true;
    }
  }

  // "From prompt to page in N seconds": N is the 30-day average generation
  // time (cached on the server), and it also paces the river.
  async _loadLatency() {
    try {
      const response = await fetch("/api/landing/stats");
      if (!response.ok) return;
      const { generationSeconds } = await response.json();
      if (!(generationSeconds > 0)) return;
      const root = this.shadowRoot;
      root.querySelectorAll(".riverIntro .latency").forEach((el) => { el.textContent = String(generationSeconds); });
      root.querySelectorAll(".riverIntro .latencyFigure").forEach((el) => { el.hidden = false; });
      root.querySelectorAll(".riverIntro .latencyFallback").forEach((el) => { el.hidden = true; });
      root.querySelector("#latencyNote").hidden = false;
      root.querySelectorAll("diffui-landing-river").forEach((river) => { river.latency = generationSeconds; });
    } catch { /* the headline reads "in seconds" */ }
  }

  disconnectedCallback() {
    this._linenResize?.disconnect();
    this._disconnectTheme?.();
    this._disconnectTheme = null;
  }

  setLoggedIn(loggedIn) {
    this.toggleAttribute("data-logged-in", !!loggedIn);
    this.shadowRoot.getElementById("landingHeader")?.setLoggedIn(!!loggedIn);
  }

  openSignin() {
    this.shadowRoot.getElementById("landingHeader")?.openSignin?.();
  }

  _heroCanvas() {
    return this.shadowRoot.getElementById("canvasHero");
  }

  _setupHeroCanvas() {
    const hero = this._heroCanvas();
    if (!hero) return;
    const theme = this.dataset.theme || "dark";
    hero.setAttribute("data-theme", theme);
  }

  _setupHeroLinen() {
    const linen = this.shadowRoot.getElementById("heroLinen");
    const hero = this._heroCanvas();
    linen.hero = hero;
    const page = this.shadowRoot.querySelector(".page");
    const section = this.shadowRoot.querySelector(".heroCanvas");
    this._linenResize?.disconnect();
    this._linenResize = new ResizeObserver(() => {
      const pageRect = page.getBoundingClientRect();
      const heading = this.shadowRoot.querySelector(".heroBlock").getBoundingClientRect();
      const top = pageRect.width <= 760 ? heading.bottom - pageRect.top + 8 : 0;
      const nextSection = this.shadowRoot.querySelector(".riseSection").getBoundingClientRect();
      // The fabric ends where it always has; the next section sits a further
      // --river-gap below it.
      const gap = parseFloat(getComputedStyle(page).getPropertyValue("--river-gap")) || 0;
      const height = nextSection.top - pageRect.top - top - 20 - gap;
      linen.style.setProperty("--linen-top", `${Math.round(top)}px`);
      linen.style.setProperty("--linen-height", `${Math.round(height)}px`);
      cancelAnimationFrame(this._riseFrame);
      this._riseFrame = requestAnimationFrame(() => this._tuckRiseUnderLinen());
    });
    const river = this.shadowRoot.querySelector(".riseSection diffui-landing-river");
    if (river && !this._decodeLineWired) {
      this._decodeLineWired = true;
      river.addEventListener("river-decode-line", () => this._placeRiseCard());
    }
    this._linenResize.observe(page);
    this._linenResize.observe(section);
    this._linenResize.observe(this.shadowRoot.querySelector(".heroBlock"));
  }

  // The rising designs reach up behind the hero fabric: the river starts at
  // the fabric's top, and a mask of everything below the fabric's lower edge
  // (linen-below.png, drawn to match the fabric) hides them once they pass
  // behind it, even where the fabric itself is transparent higher up.
  _tuckRiseUnderLinen() {
    const linen = this.shadowRoot.getElementById("heroLinen");
    const fabric = linen.shadowRoot?.querySelector(".fabric");
    const section = this.shadowRoot.querySelector(".riseSection");
    const river = section?.querySelector("diffui-landing-river");
    if (!fabric || !river) return;
    const box = fabric.getBoundingClientRect();
    const sectionTop = section.getBoundingClientRect().top;
    const lift = Math.max(0, Math.round(sectionTop - box.top));
    river.style.top = `${-lift}px`;
    this._riseLift = lift;
    river.style.height = `calc(100% + ${lift}px)`;
    river.riseInset = lift;
    const riverLeft = river.getBoundingClientRect().left;
    const mask = [
      `url("/landing/assets/linen/linen-below.png") ${Math.round(box.left - riverLeft)}px 0 / ${Math.round(box.width)}px ${Math.round(box.height)}px no-repeat`,
      `linear-gradient(transparent ${Math.round(box.height)}px, #000 ${Math.round(box.height)}px) 0 0 / 100% 100% no-repeat`,
    ].join(", ");
    river.style.mask = mask;
    river.style.webkitMask = mask;
  }

  _placeRiseCard() {
    const section = this.shadowRoot.querySelector(".riseSection");
    const river = section?.querySelector("diffui-landing-river");
    const y = river?.decodeLineY;
    if (y == null || this._riseLift == null) return;
    section.style.setProperty("--decode-line", `${Math.round(y - this._riseLift)}px`);
    // Narrow pages seat the card on the band instead (see the 760px rules).
    const bandTop = river.bandTopY;
    if (bandTop != null) section.style.setProperty("--band-top", `${Math.round(bandTop - this._riseLift)}px`);
  }

  _wireButtons() {
    const go = () => this._startSignin();
    this.shadowRoot.querySelector(".reviewsSection")?.addEventListener("landing-launch", go);
  }

  _startSignin() {
    if (this.hasAttribute("data-logged-in")) {
      this.dispatchEvent(
        new CustomEvent("diffui-landing-nav", {
          detail: { path: this.getAttribute("launch-href") || "/app" },
          bubbles: true,
          composed: true,
        }),
      );
      return;
    }
    // Signed-out visitors pick a provider in the sign-in dialog.
    this.openSignin();
  }
}

if (!customElements.get("diffui-landing-page")) {
  customElements.define("diffui-landing-page", DiffuiLandingPage);
}
