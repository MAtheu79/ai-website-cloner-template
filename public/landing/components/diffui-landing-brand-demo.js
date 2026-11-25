import "./diffui-landing-canvas-image-stack.js";
import { VisibleActivity } from "./visible-activity.js";

const PROMPT_TEXT = "A landing page for this brand's new satellite connectivity feature";
const ASSET = (name) => `/landing/assets/landing/brands/${name}`;
const BRAND_GEN_MS = 1500;
const PROMPT_GEN_MS = 1600;

const BRANDS = [
  {
    id: "reddit",
    screenshots: ["reddit1.webp", "reddit2.webp", "reddit3.webp"],
    brand: "redditBrand.webp",
    design: "redditDesign.webp",
  },
  {
    id: "netflix",
    screenshots: ["netflix1.webp", "netflix2.webp", "netflix3.webp"],
    brand: "netflixBrand.webp",
    design: "netflixDesign.webp",
  },
  {
    id: "slack",
    screenshots: ["slack1.webp", "slack2.webp", "slack3.webp"],
    brand: "slackBrand.webp",
    design: "slackDesign.webp",
  },
];

const DESIGN_SET_COUNT = 3;
const DESIGN_URLS = Array.from({ length: BRANDS.length * DESIGN_SET_COUNT }, (_, i) =>
  ASSET(BRANDS[i % BRANDS.length].design),
);
const SLACK_BRAND_INDEX = BRANDS.findIndex((brand) => brand.id === "slack");
const INITIAL_STACK_SET = DESIGN_SET_COUNT - 1;
const INITIAL_STACK_INDEX = INITIAL_STACK_SET * BRANDS.length + SLACK_BRAND_INDEX;

function stackIndexForBrand(brandIndex, setIndex) {
  return setIndex * BRANDS.length + brandIndex;
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function easeIn(t) {
  return t * t;
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 2);
}

function jumbleForBrand(brandId, count) {
  let seed = 0;
  for (let i = 0; i < brandId.length; i += 1) seed += brandId.charCodeAt(i) * (i + 1);
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const s = seed + i * 7919;
    out.push({
      dx: ((s % 37) - 18) * 1.1,
      dy: (((s * 3) % 31) - 15) * 1.1,
      rot: ((s * 7) % 23) - 11,
    });
  }
  return out;
}

const FLY_THUMB_W = 56;
const FLY_THUMB_H = Math.round(FLY_THUMB_W * (176 / 200));
const MOBILE_MAX_WIDTH = 760;
const DESKTOP_FLOW_VIEWBOX = "0 0 960 600";
const DESKTOP_FLOW_PATHS = {
  lineShotsBrand: "M 363 165 L 660 165",
  lineBrandPrompt:
    "M 720 250 L 720 274 A 16 16 0 0 1 704 290 L 296 290 A 16 16 0 0 0 280 306 L 280 430",
  linePromptDesign: "M 404 415 L 660 415",
};

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 100%;
      overflow: hidden;
      --gold: #d4a640;
      --text: #e6edf3;
      --muted: #9aa6b2;
      --card-border: #2a2c30;
      --compare-bg: #0e1113;
      --compare-overlay-opacity: 0.4;
      --mock-bg: #0a0b0d;
      --mock-border: rgba(255, 255, 255, 0.18);
      --mock-border-strong: rgba(255, 255, 255, 0.25);
      color: var(--text);
      font-family: var(--font, system-ui, sans-serif);
    }
    :host([data-theme="light"]) {
      --text: #1a1c1e;
      --muted: #5c6570;
      --card-border: rgba(26, 28, 30, 0.12);
      --compare-bg: #f0ede8;
      --compare-overlay-opacity: 0.22;
      --mock-bg: #ffffff;
      --mock-border: rgba(26, 28, 30, 0.14);
      --mock-border-strong: rgba(26, 28, 30, 0.2);
    }

    .demoRoot {
      position: relative;
    }

    .stage {
      position: relative;
      border: 1px solid var(--card-border);
      border-radius: var(--radius-m, 8px);
      background-color: var(--compare-bg);
      background-repeat: repeat;
      background-size: 512px 512px;
      isolation: isolate;
      overflow: hidden;
      aspect-ratio: 16 / 10;
      min-height: 420px;
    }
    :host([data-theme="dark"]) .stage,
    :host(:not([data-theme="light"])) .stage {
      background-image: url("/landing/assets/landing/mossySlateTexture.webp");
    }
    :host([data-theme="light"]) .stage {
      background-image: url("/landing/assets/landing/marbleTexture3.webp");
    }
    .stage::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      opacity: var(--compare-overlay-opacity);
      background: radial-gradient(
        ellipse 500px 500px at 50% 0%,
        #ffedc5 0%,
        #000000 100%
      );
      mix-blend-mode: overlay;
      border-radius: inherit;
    }
    /* plain: no card at all; the pieces sit directly on whatever artwork is
       behind the demo, each on its own solid surface so it stays legible. */
    :host([plain]) { overflow: visible; --plain-surface: rgba(21, 24, 27, 0.9); }
    :host([plain][data-theme="light"]) { --plain-surface: rgba(255, 255, 255, 0.9); }
    :host([plain]) .stage,
    :host([plain][data-theme]) .stage {
      background: none;
      border: none;
      overflow: visible;
    }
    :host([plain]) .stage::after { display: none; }
    /* Laid over artwork the demo follows its container's width; the usual
       minimum height would force it wider than the space it's given. */
    :host([plain]) .stage { min-height: 0; }
    :host([plain]) .dropBox,
    :host([plain][data-theme]) .dropBox {
      background: var(--plain-surface);
      backdrop-filter: blur(6px);
    }
    :host([plain]) .shotsLabel {
      padding: 3px 8px;
      border-radius: 4px;
      background: var(--plain-surface);
      opacity: 1;
    }
    :host([data-theme="light"]) .stage::after {
      background: radial-gradient(
        ellipse 520px 420px at 50% -10%,
        rgba(255, 255, 255, 0.85) 0%,
        rgba(255, 255, 255, 0) 72%
      );
      mix-blend-mode: normal;
    }

    .flowGrid {
      position: relative;
      z-index: 2;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 0;
      height: 100%;
      padding: 28px 32px;
      box-sizing: border-box;
    }

    .cell {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      min-height: 0;
      padding: 8px;
      box-sizing: border-box;
    }

    .shotsPanel {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      width: min(100%, 200px);
      margin-top: -16px;
    }
    .shotsLabel {
      font-family: var(--font-mono, monospace);
      font-size: 11px;
      letter-spacing: 0.4px;
      color: var(--muted);
      white-space: nowrap;
    }
    :host([data-theme="light"]) .shotsLabel {
      color: var(--text);
      opacity: 0.65;
    }

    .dropBox {
      position: relative;
      width: 100%;
      height: 134px;
      border: 1.5px dashed var(--mock-border-strong);
      border-radius: var(--radius-m, 8px);
      background: rgba(0, 0, 0, 0.22);
      box-sizing: border-box;
      transition: border-color 200ms ease, box-shadow 200ms ease;
    }
    .dropBox[data-hover="true"] {
      border-color: var(--gold);
      box-shadow: 0 0 0 1px rgba(212, 166, 64, 0.35), 0 0 18px rgba(212, 166, 64, 0.18);
    }
    :host([data-theme="light"]) .dropBox {
      background: rgba(255, 255, 255, 0.45);
    }

    .shotSlots {
      position: absolute;
      inset: 10px;
      pointer-events: none;
      opacity: 0;
    }

    .flyLayer {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 60;
      overflow: visible;
    }
    .flyThumb {
      position: absolute;
      left: 0;
      top: 0;
      width: 56px;
      height: 49px;
      border: 1px solid var(--mock-border-strong);
      border-radius: var(--radius-sm, 4px);
      background: var(--mock-bg);
      overflow: hidden;
      box-shadow: 0 10px 22px rgba(0, 0, 0, 0.48);
      transform-origin: center center;
      will-change: transform, opacity;
    }
    .flyThumb img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }

    .brandBoard {
      position: relative;
      width: min(100%, 356px);
      margin-left: -4px;
      aspect-ratio: 16 / 9;
      border-radius: var(--radius-m, 8px);
      overflow: hidden;
      border: 1px solid var(--mock-border-strong);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
      background: var(--mock-bg);
    }
    .brandBoard img.brandImg {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      opacity: 0;
      transition: opacity 360ms ease;
    }
    .brandBoard[data-state="ready"] img.brandImg[data-active="true"] {
      opacity: 1;
    }
    .brandPlaceholder {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 16px;
      box-sizing: border-box;
      background: rgba(0, 0, 0, 0.35);
      transition: opacity 280ms ease;
    }
    :host([data-theme="light"]) .brandPlaceholder {
      background: rgba(255, 255, 255, 0.72);
    }
    .brandBoard[data-state="ready"] .brandPlaceholder {
      opacity: 0;
      pointer-events: none;
    }
    .brandPlaceholderLabel {
      font-family: var(--font-mono, monospace);
      font-size: 11px;
      letter-spacing: 0.4px;
      color: var(--muted);
      opacity: 0;
      transition: opacity 200ms ease, color 200ms ease;
    }
    .brandBoard[data-state="generating"] .brandPlaceholderLabel,
    .brandBoard[data-state="ready"] .brandPlaceholderLabel {
      opacity: 1;
    }
    .brandBoard[data-state="generating"] .brandPlaceholderLabel {
      color: var(--gold);
    }
    .brandLoadBar {
      width: min(100%, 160px);
      height: 4px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.12);
      overflow: hidden;
      opacity: 0;
      transition: opacity 200ms ease;
    }
    :host([data-theme="light"]) .brandLoadBar {
      background: rgba(26, 28, 30, 0.1);
    }
    .brandBoard[data-state="generating"] .brandLoadBar {
      opacity: 1;
    }
    .brandLoadFill {
      display: block;
      height: 100%;
      width: 0%;
      border-radius: inherit;
      background: var(--gold);
      transition: none;
    }
    .brandBoard[data-state="generating"] .brandLoadFill[data-animate="true"] {
      width: 100%;
      transition: width 1.5s linear;
    }

    .promptBox {
      position: relative;
      width: min(100%, 280px);
      margin-top: -38px;
      border: 1px solid var(--mock-border-strong);
      border-radius: var(--radius-lg, 11px);
      background: rgba(12, 15, 20, 0.88);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
      transition: border-color 200ms ease;
    }
    .promptBox[data-generating="true"] {
      border-color: rgba(212, 166, 64, 0.55);
    }
    :host([data-theme="light"]) .promptBox {
      background: rgba(255, 255, 255, 0.94);
    }
    :host([data-theme="light"]) .promptBox[data-generating="true"] {
      border-color: rgba(180, 130, 40, 0.45);
    }
    .promptEditor {
      position: relative;
      padding: 10px 10px 42px;
      min-height: 88px;
      box-sizing: border-box;
    }
    .promptText {
      display: block;
      font-family: var(--font-mono, monospace);
      font-size: clamp(11px, 1.4vw, 12px);
      line-height: 1.45;
      color: rgba(255, 255, 255, 0.92);
    }
    :host([data-theme="light"]) .promptText {
      color: var(--text);
    }
    .promptActions {
      position: absolute;
      left: 10px;
      right: 10px;
      bottom: 8px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }
    .generateBtn {
      height: 26px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: var(--radius-sm, 4px);
      background: rgba(255, 255, 255, 0.045);
      color: var(--text);
      padding: 0 9px;
      font-size: 12px;
      font-weight: 800;
      white-space: nowrap;
      box-shadow: 0 3px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05);
      font-family: var(--font, system-ui, sans-serif);
      cursor: default;
    }
    :host([data-theme="light"]) .generateBtn {
      border: 1px solid rgba(173, 120, 0, 0.40);
      background: linear-gradient(90deg, rgba(204, 154, 19, 0.55) 0%, rgba(232, 197, 107, 0.49) 100%);
      box-shadow: 1px 1px 0 0 rgba(255, 189, 240, 0.47), 0 4px 4px 0 rgb(82 56 0 / 19%);
      color: #1a1c1e;
      text-shadow: -1px -1px 0 rgba(255, 255, 255, 0.25);
    }
    .generateBtn[data-pressed="true"],
    .promptBox[data-generating="true"] .generateBtn {
      border-color: rgba(212, 166, 64, 0.55);
      background: rgba(212, 166, 64, 0.18);
      color: #fff;
    }
    :host([data-theme="light"]) .generateBtn[data-pressed="true"],
    :host([data-theme="light"]) .promptBox[data-generating="true"] .generateBtn {
      border-color: rgba(173, 120, 0, 0.55);
      background: linear-gradient(90deg, rgba(204, 154, 19, 0.65) 0%, rgba(232, 197, 107, 0.58) 100%);
      color: #1a1c1e;
      text-shadow: -1px -1px 0 rgba(255, 255, 255, 0.25);
    }
    .promptSpinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top-color: var(--gold);
      border-radius: 50%;
      opacity: 0;
      flex: 0 0 auto;
      transition: opacity 160ms ease;
    }
    :host([data-theme="light"]) .promptSpinner {
      border-color: rgba(26, 28, 30, 0.15);
      border-top-color: var(--gold);
    }
    .promptSpinner[data-visible="true"] {
      opacity: 1;
      animation: brandDemoSpin 760ms linear infinite;
    }
    @keyframes brandDemoSpin {
      to { transform: rotate(360deg); }
    }

    .designCell { align-items: stretch; }
    .designStackWrap {
      position: relative;
      width: min(100%, 356px);
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-bottom: 8px;
    }
    diffui-landing-canvas-image-stack { width: 100%; }

    .flowArrows {
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      overflow: visible;
    }
    .flowLine {
      fill: none;
      stroke: rgba(255, 255, 255, 0.32);
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 6 8;
      stroke-dashoffset: 0;
    }
    :host([data-theme="light"]) .flowLine {
      stroke: rgba(26, 28, 30, 0.28);
    }
    .flowLine[data-active="true"] {
      stroke: var(--gold);
      animation: brandDemoDash 1.1s linear infinite;
    }
    :host([data-theme="light"]) .flowLine[data-active="true"] {
      stroke: var(--gold);
    }
    /* Over artwork, the lines take the pieces' own surface color so they
       read on any patch of the graphic; the active one stays opaque. */
    :host([plain]) .flowLine,
    :host([plain][data-theme]) .flowLine {
      stroke: var(--plain-surface);
      stroke-width: 3;
      opacity: 0.7;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25));
    }
    :host([plain]) .flowLine[data-active="true"],
    :host([plain][data-theme]) .flowLine[data-active="true"] {
      opacity: 1;
    }
    @keyframes brandDemoDash {
      to { stroke-dashoffset: -28; }
    }

    .demoCursor {
      position: absolute;
      top: 0;
      left: 0;
      width: 24px;
      height: 24px;
      margin: -2px 0 0 -2px;
      pointer-events: none;
      z-index: 100;
      opacity: 0;
      transition: opacity 200ms ease;
      will-change: transform;
    }
    .demoCursor[data-visible="true"] { opacity: 1; }
    .demoCursor img {
      width: 100%;
      height: 100%;
      display: block;
    }

    @media (max-width: 760px) {
      .stage { aspect-ratio: auto; min-height: 0; }
      .flowGrid {
        grid-template-columns: 1fr;
        grid-template-rows: auto;
        padding: 20px 16px;
        gap: 20px;
      }
      .promptBox { margin-top: 0; }
      .shotsPanel { width: min(100%, 180px); }
      .brandBoard { width: 100%; }
      .designStackWrap { width: 100%; min-height: 200px; }
    }
  </style>

  <div class="demoRoot" id="demoRoot">
    <div class="stage" id="stage">
      <svg class="flowArrows" id="flowArrows" viewBox="0 0 960 600" preserveAspectRatio="none" aria-hidden="true">
        <path class="flowLine" id="lineShotsBrand" d="M 363 165 L 660 165" data-active="false" />
        <path class="flowLine" id="lineBrandPrompt" d="M 720 250 L 720 274 A 16 16 0 0 1 704 290 L 296 290 A 16 16 0 0 0 280 306 L 280 430" data-active="false" />
        <path class="flowLine" id="linePromptDesign" d="M 404 415 L 660 415" data-active="false" />
      </svg>

      <div class="flowGrid">
        <div class="cell" id="cellShots">
          <div class="shotsPanel">
            <span class="shotsLabel">Add screenshots</span>
            <div class="dropBox" id="dropBox">
              <div class="shotSlots" id="shotSlots">
                <div class="shotSlot" data-layer="0" data-visible="false"><img alt="" /></div>
                <div class="shotSlot" data-layer="1" data-visible="false"><img alt="" /></div>
                <div class="shotSlot" data-layer="2" data-visible="false"><img alt="" /></div>
              </div>
            </div>
          </div>
        </div>

        <div class="cell" id="cellBrand">
          <div class="brandBoard" id="brandBoard" data-state="placeholder">
            <div class="brandPlaceholder">
              <span class="brandPlaceholderLabel" id="brandPlaceholderLabel">Brand generating</span>
              <div class="brandLoadBar" aria-hidden="true">
                <span class="brandLoadFill" id="brandLoadFill"></span>
              </div>
            </div>
            <div class="brandImages" id="brandImages"></div>
          </div>
        </div>

        <div class="cell" id="cellPrompt">
          <div class="promptBox" id="promptBox">
            <div class="promptEditor">
              <span class="promptText" id="promptText">${PROMPT_TEXT}</span>
              <div class="promptActions">
                <span class="promptSpinner" id="promptSpinner" aria-hidden="true"></span>
                <button class="generateBtn" id="generateBtn" type="button" tabindex="-1">Generate</button>
              </div>
            </div>
          </div>
        </div>

        <div class="cell designCell" id="cellDesign">
          <div class="designStackWrap" id="designStackWrap">
            <diffui-landing-canvas-image-stack id="designStack" data-comparison="true"></diffui-landing-canvas-image-stack>
          </div>
        </div>
      </div>
    </div>

    <div class="flyLayer" id="flyLayer"></div>

    <div class="demoCursor" id="demoCursor" aria-hidden="true">
      <img src="/app/assets/canvas-cursor-pointer.png" alt="" />
    </div>
  </div>
`;

export class DiffuiLandingBrandDemo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._demoStarted = false;
    this._demoRunning = false;
    this._abort = false;
    this._cursorPos = { x: 0, y: 0 };
    this._brandIndex = 0;
    this._stackSetIndex = INITIAL_STACK_SET;
    this._stackReady = false;
    this._flowLinesObserver = null;
    this._mobileMedia = null;
    this._onMobileMediaChange = null;
    this._activity = new VisibleActivity(this, () => {
      if (!this._stackReady) {
        this._initBrandImages();
        this._initDesignStack();
        this._applyInitialState();
      }
      this._startDemo();
    });
  }

  connectedCallback() {
    this._setupFlowLines();
    this._activity.connect();
  }

  _initBrandImages() {
    const container = this.shadowRoot.getElementById("brandImages");
    if (!container || container.childElementCount) return;
    for (const brand of BRANDS) {
      const img = document.createElement("img");
      img.className = "brandImg";
      img.dataset.brand = brand.id;
      img.alt = "";
      img.loading = "lazy";
      img.src = ASSET(brand.brand);
      container.appendChild(img);
    }
  }

  disconnectedCallback() {
    this._activity.disconnect();
    this._flowLinesObserver?.disconnect();
    this._flowLinesObserver = null;
    if (this._mobileMedia && this._onMobileMediaChange) {
      this._mobileMedia.removeEventListener("change", this._onMobileMediaChange);
    }
    this._mobileMedia = null;
    this._onMobileMediaChange = null;
  }

  _initDesignStack() {
    const stack = this.shadowRoot.getElementById("designStack");
    if (!stack) return;
    stack.showReady(DESIGN_URLS);
    this._stackReady = true;
  }

  _applyInitialState() {
    const brand = BRANDS[SLACK_BRAND_INDEX];
    if (!brand) return;
    this._setBrandState("ready", brand);
    const stack = this.shadowRoot.getElementById("designStack");
    if (stack && this._stackReady) {
      stack.selectIndex(INITIAL_STACK_INDEX, { direction: -1 });
    }
  }

  _isMobileLayout() {
    return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;
  }

  _setupFlowLines() {
    const stage = this.shadowRoot.getElementById("stage");
    if (!stage || typeof ResizeObserver !== "function") {
      this._activity.requestAnimationFrame(() => this._updateFlowLines());
      return;
    }

    this._flowLinesObserver = new ResizeObserver(() => {
      this._updateFlowLines();
    });
    this._flowLinesObserver.observe(stage);

    this._mobileMedia = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
    this._onMobileMediaChange = () => this._updateFlowLines();
    this._mobileMedia.addEventListener("change", this._onMobileMediaChange);
    this._activity.requestAnimationFrame(() => this._updateFlowLines());
  }

  _setFlowLinePath(id, d) {
    const line = this.shadowRoot.getElementById(id);
    if (line) line.setAttribute("d", d);
  }

  _verticalLinePath(fromRect, toRect) {
    const x = (fromRect.cx + toRect.cx) / 2;
    return `M ${x} ${fromRect.bottom} L ${x} ${toRect.top}`;
  }

  _updateFlowLines() {
    const svg = this.shadowRoot.getElementById("flowArrows");
    const stage = this.shadowRoot.getElementById("stage");
    if (!svg || !stage) return;

    if (!this._isMobileLayout()) {
      svg.setAttribute("viewBox", DESKTOP_FLOW_VIEWBOX);
      for (const [id, d] of Object.entries(DESKTOP_FLOW_PATHS)) {
        this._setFlowLinePath(id, d);
      }
      return;
    }

    const dropBox = this.shadowRoot.getElementById("dropBox");
    const brandBoard = this.shadowRoot.getElementById("brandBoard");
    const promptBox = this.shadowRoot.getElementById("promptBox");
    const designStackWrap = this.shadowRoot.getElementById("designStackWrap");
    if (!dropBox || !brandBoard || !promptBox || !designStackWrap) return;

    const dropRect = this._rectInRoot(dropBox, stage);
    const brandRect = this._rectInRoot(brandBoard, stage);
    const promptRect = this._rectInRoot(promptBox, stage);
    const designRect = this._rectInRoot(designStackWrap, stage);

    svg.setAttribute("viewBox", `0 0 ${stage.clientWidth} ${stage.clientHeight}`);
    this._setFlowLinePath("lineShotsBrand", this._verticalLinePath(dropRect, brandRect));
    this._setFlowLinePath("lineBrandPrompt", this._verticalLinePath(brandRect, promptRect));
    this._setFlowLinePath("linePromptDesign", this._verticalLinePath(promptRect, designRect));
  }

  async _startDemo() {
    if (this._demoStarted || this._demoRunning) return;
    this._demoStarted = true;
    this._demoRunning = true;
    this._abort = false;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      this._showFinalState(SLACK_BRAND_INDEX);
      this._demoRunning = false;
      return;
    }

    try {
      await this._runLoop();
    } finally {
      this._demoRunning = false;
    }
  }

  _showFinalState(brandIndex = 0) {
    const brand = BRANDS[brandIndex];
    this._clearScreenshots();
    this._populateScreenshots(brand, true);
    this._setBrandState("ready", brand);
    this._setPromptGenerating(false);
    this._setActiveLines([]);
    const stack = this.shadowRoot.getElementById("designStack");
    if (stack && this._stackReady) {
      stack.selectIndex(stackIndexForBrand(brandIndex, INITIAL_STACK_SET), { direction: -1 });
    }
  }

  async _runLoop() {
    while (!this._abort) {
      await this._runBrandCycle(this._brandIndex);
      this._brandIndex = (this._brandIndex + 1) % BRANDS.length;
    }
  }

  async _runBrandCycle(brandIndex) {
    const brand = BRANDS[brandIndex];

    this._clearScreenshots();
    this._setPromptGenerating(false);
    this._setActiveLines([]);

    let brandGenPromise = null;
    await this._dragScreenshotStack(brand, {
      onFirstScreenshotSucked: () => {
        this._setActiveLines(["lineShotsBrand"]);
        brandGenPromise = this._generateBrandBoard(brand);
      },
    });

    if (!brandGenPromise) {
      this._setActiveLines(["lineShotsBrand"]);
      brandGenPromise = this._generateBrandBoard(brand);
    }
    await brandGenPromise;
    this._setActiveLines([]);

    await this._activity.wait(280);
    await this._clickGenerateButton();

    this._setActiveLines(["lineBrandPrompt", "linePromptDesign"]);
    this._setPromptGenerating(true);
    await this._activity.wait(PROMPT_GEN_MS);
    this._shiftDesignStack(brandIndex);
    this._setPromptGenerating(false);
    this._setActiveLines([]);
    if (brandIndex === SLACK_BRAND_INDEX) {
      this._stackSetIndex = (this._stackSetIndex + 1) % DESIGN_SET_COUNT;
    }
    await this._activity.wait(600);
  }

  _clearScreenshots() {
    this.shadowRoot.querySelectorAll(".shotSlot").forEach((slot) => {
      slot.dataset.visible = "false";
    });
    const dropBox = this.shadowRoot.getElementById("dropBox");
    if (dropBox) delete dropBox.dataset.hover;
    this._clearFlyThumbs();
  }

  _populateScreenshots(brand, visible = true) {
    const slots = [...this.shadowRoot.querySelectorAll(".shotSlot")];
    brand.screenshots.forEach((name, i) => {
      const slot = slots[i];
      if (!slot) return;
      const img = slot.querySelector("img");
      if (img) img.src = ASSET(name);
      slot.dataset.visible = visible ? "true" : "false";
    });
  }

  _clearFlyThumbs() {
    const layer = this.shadowRoot.getElementById("flyLayer");
    if (layer) layer.replaceChildren();
  }

  _createFlyThumbs(brand) {
    const layer = this.shadowRoot.getElementById("flyLayer");
    if (!layer) return [];
    const thumbs = brand.screenshots.map((name, i) => {
      const el = document.createElement("div");
      el.className = "flyThumb";
      el.dataset.index = String(i);
      const img = document.createElement("img");
      img.alt = "";
      img.src = ASSET(name);
      el.appendChild(img);
      layer.appendChild(el);
      return el;
    });
    return thumbs;
  }

  _setFlyThumbTransform(el, x, y, rot, scale = 1, opacity = 1) {
    const hw = FLY_THUMB_W / 2;
    const hh = FLY_THUMB_H / 2;
    el.style.opacity = String(opacity);
    el.style.transform = `translate(${x - hw}px, ${y - hh}px) rotate(${rot}deg) scale(${scale})`;
  }

  _positionFlyJumble(thumbs, jumble, cx, cy) {
    thumbs.forEach((thumb, i) => {
      const j = jumble[i];
      if (!j) return;
      this._setFlyThumbTransform(thumb, cx + j.dx, cy + j.dy, j.rot, 1, 1);
    });
  }

  _rectInRoot(el, root) {
    const r = el.getBoundingClientRect();
    const base = root.getBoundingClientRect();
    return {
      left: r.left - base.left,
      top: r.top - base.top,
      right: r.right - base.left,
      bottom: r.bottom - base.top,
      width: r.width,
      height: r.height,
      cx: r.left - base.left + r.width / 2,
      cy: r.top - base.top + r.height / 2,
    };
  }

  _pointInRect(x, y, rect) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  _gridPointsInDropBox(dropRect) {
    const pad = 14;
    const innerW = dropRect.width - pad * 2;
    const innerH = dropRect.height - pad * 2;
    const colW = innerW / 2;
    const rowH = innerH / 2;
    return [
      { x: dropRect.left + pad + colW * 0.5, y: dropRect.top + pad + rowH * 0.42 },
      { x: dropRect.left + pad + colW * 1.5, y: dropRect.top + pad + rowH * 0.42 },
      { x: dropRect.left + dropRect.width / 2, y: dropRect.top + pad + rowH * 1.45 },
    ];
  }

  _suckPointInDropBox(dropRect) {
    if (this._isMobileLayout()) {
      return {
        x: dropRect.cx,
        y: dropRect.bottom - 2,
      };
    }
    return {
      x: dropRect.right - 2,
      y: dropRect.top + dropRect.height / 2,
    };
  }

  async _animateValue(duration, easeFn, onFrame) {
    const startTs = this._activity.now();
    await new Promise((resolve) => {
      const tick = (now) => {
        if (this._abort) {
          resolve();
          return;
        }
        const t = Math.min(1, (now - startTs) / duration);
        onFrame(easeFn(t), t);
        if (t < 1) this._activity.requestAnimationFrame(tick);
        else resolve();
      };
      this._activity.requestAnimationFrame(tick);
    });
  }

  async _animateFlyStates(thumbs, fromStates, toStates, duration, easeFn = easeInOut) {
    await this._animateValue(duration, easeFn, (e) => {
      thumbs.forEach((thumb, i) => {
        const a = fromStates[i];
        const b = toStates[i];
        if (!a || !b) return;
        this._setFlyThumbTransform(
          thumb,
          a.x + (b.x - a.x) * e,
          a.y + (b.y - a.y) * e,
          a.rot + (b.rot - a.rot) * e,
          a.scale + (b.scale - a.scale) * e,
          a.opacity + (b.opacity - a.opacity) * e,
        );
      });
    });
  }

  _readFlyStates(thumbs, jumble, cx, cy) {
    return thumbs.map((_, i) => ({
      x: cx + jumble[i].dx,
      y: cy + jumble[i].dy,
      rot: jumble[i].rot,
      scale: 1,
      opacity: 1,
    }));
  }

  _setActiveBrandImage(brandId) {
    this.shadowRoot.querySelectorAll(".brandImg").forEach((img) => {
      if (brandId && img.dataset.brand === brandId) img.dataset.active = "true";
      else delete img.dataset.active;
    });
  }

  _setBrandState(state, brand = null) {
    const brandBoard = this.shadowRoot.getElementById("brandBoard");
    const loadFill = this.shadowRoot.getElementById("brandLoadFill");
    if (!brandBoard) return;

    brandBoard.dataset.state = state;

    if (loadFill && state !== "generating") {
      loadFill.dataset.animate = "false";
    }

    if (state === "ready" && brand) {
      this._setActiveBrandImage(brand.id);
    } else {
      this._setActiveBrandImage(null);
    }
  }

  async _generateBrandBoard(brand) {
    const brandBoard = this.shadowRoot.getElementById("brandBoard");
    const loadFill = this.shadowRoot.getElementById("brandLoadFill");
    if (brandBoard) brandBoard.dataset.state = "generating";
    if (loadFill) {
      loadFill.dataset.animate = "false";
      loadFill.offsetWidth;
    }

    await new Promise((resolve) => {
      this._activity.requestAnimationFrame(() => {
        this._activity.requestAnimationFrame(() => {
          if (loadFill) loadFill.dataset.animate = "true";
          resolve();
        });
      });
    });

    await this._activity.wait(BRAND_GEN_MS);

    if (this._abort) return;
    this._setBrandState("ready", brand);
    await this._activity.wait(300);
  }

  _setPromptGenerating(active) {
    const promptBox = this.shadowRoot.getElementById("promptBox");
    const spinner = this.shadowRoot.getElementById("promptSpinner");
    if (promptBox) {
      if (active) promptBox.dataset.generating = "true";
      else delete promptBox.dataset.generating;
    }
    if (spinner) spinner.dataset.visible = active ? "true" : "false";
  }

  async _clickGenerateButton() {
    if (this._abort) return;
    const root = this._coordRoot();
    const btn = this.shadowRoot.getElementById("generateBtn");
    if (!root || !btn) return;

    const pt = this._localPoint(btn, root);
    await this._moveCursorTo(pt.x, pt.y, 540);
    await this._activity.wait(120);
    btn.dataset.pressed = "true";
    await this._clickCursor();
    await this._activity.wait(140);
    delete btn.dataset.pressed;
    await this._activity.wait(80);
    this._hideCursor();
  }

  _setActiveLines(lineIds) {
    this.shadowRoot.querySelectorAll(".flowLine").forEach((line) => {
      line.dataset.active = lineIds.includes(line.id) ? "true" : "false";
    });
  }

  _coordRoot() {
    return this.shadowRoot.getElementById("demoRoot");
  }

  _localPoint(el, root) {
    const r = el.getBoundingClientRect();
    const base = root.getBoundingClientRect();
    return {
      x: r.left - base.left + r.width * 0.5,
      y: r.top - base.top + r.height * 0.5,
    };
  }

  _showCursor() {
    const cursor = this.shadowRoot.getElementById("demoCursor");
    if (cursor) cursor.dataset.visible = "true";
  }

  _hideCursor() {
    const cursor = this.shadowRoot.getElementById("demoCursor");
    if (cursor) cursor.dataset.visible = "false";
  }

  _setCursorPos(x, y) {
    this._cursorPos = { x, y };
    const cursor = this.shadowRoot.getElementById("demoCursor");
    if (!cursor) return;
    const clicking = cursor.dataset.clicking === "true";
    const scale = clicking ? 0.88 : 1;
    cursor.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }

  async _moveCursorTo(x, y, duration = 520, onFrame) {
    if (this._abort) return;
    this._showCursor();
    const start = { ...this._cursorPos };
    const startTs = this._activity.now();
    await new Promise((resolve) => {
      const tick = (now) => {
        if (this._abort) {
          resolve();
          return;
        }
        const t = Math.min(1, (now - startTs) / duration);
        const e = easeInOut(t);
        const nx = start.x + (x - start.x) * e;
        const ny = start.y + (y - start.y) * e;
        this._setCursorPos(nx, ny);
        onFrame?.(nx, ny, e);
        if (t < 1) this._activity.requestAnimationFrame(tick);
        else resolve();
      };
      this._activity.requestAnimationFrame(tick);
    });
  }

  async _clickCursor() {
    if (this._abort) return;
    const cursor = this.shadowRoot.getElementById("demoCursor");
    if (!cursor) return;
    cursor.dataset.clicking = "true";
    this._setCursorPos(this._cursorPos.x, this._cursorPos.y);
    await this._activity.wait(120);
    delete cursor.dataset.clicking;
    this._setCursorPos(this._cursorPos.x, this._cursorPos.y);
    await this._activity.wait(80);
  }

  async _dragScreenshotStack(brand, options = {}) {
    if (this._abort) return;
    const root = this._coordRoot();
    const dropBox = this.shadowRoot.getElementById("dropBox");
    if (!root || !dropBox) return;

    this._clearFlyThumbs();
    const thumbs = this._createFlyThumbs(brand);
    const jumble = jumbleForBrand(brand.id, thumbs.length);
    const dropRect = () => this._rectInRoot(dropBox, root);
    const dropCenter = () => {
      const r = dropRect();
      return { x: r.cx, y: r.cy };
    };

    const mobile = this._isMobileLayout();
    const initialRect = dropRect();
    const target = dropCenter();
    const from = mobile
      ? { x: target.x, y: initialRect.top - 72 }
      : { x: -48, y: target.y };
    this._setCursorPos(from.x + (mobile ? 0 : 24), from.y + (mobile ? 24 : 0));
    this._showCursor();
    this._positionFlyJumble(thumbs, jumble, from.x, from.y);
    await this._activity.wait(160);

    await this._moveCursorTo(target.x, target.y, 860, (nx, ny) => {
      this._positionFlyJumble(thumbs, jumble, nx, ny);
      const inside = this._pointInRect(nx, ny, dropRect());
      if (inside) dropBox.dataset.hover = "true";
      else delete dropBox.dataset.hover;
    });

    await this._activity.wait(80);
    await this._clickCursor();
    delete dropBox.dataset.hover;

    const gridPts = this._gridPointsInDropBox(dropRect());
    const fromStates = this._readFlyStates(thumbs, jumble, this._cursorPos.x, this._cursorPos.y);
    const gridStates = gridPts.map((pt) => ({
      x: pt.x,
      y: pt.y,
      rot: 0,
      scale: 0.92,
      opacity: 1,
    }));
    await this._animateFlyStates(thumbs, fromStates, gridStates, 420, easeOut);
    await this._activity.wait(120);

    const suckPt = this._suckPointInDropBox(dropRect());
    for (let i = 0; i < thumbs.length; i += 1) {
      if (this._abort) return;
      const thumb = thumbs[i];
      const start = gridStates[i];
      const end = {
        x: suckPt.x + 8,
        y: suckPt.y + (i - 1) * 4,
        rot: start.rot + (i % 2 === 0 ? 12 : -10),
        scale: 0.15,
        opacity: 0,
      };
      await this._animateFlyStates([thumb], [start], [end], 340, easeIn);
      gridStates[i] = end;
      if (i === 0 && typeof options.onFirstScreenshotSucked === "function") {
        options.onFirstScreenshotSucked();
      }
      await this._activity.wait(90);
    }

    this._clearFlyThumbs();
    await this._activity.wait(100);
    this._hideCursor();
  }

  _shiftDesignStack(brandIndex) {
    const stack = this.shadowRoot.getElementById("designStack");
    if (!stack || !this._stackReady) return;
    stack.selectIndex(stackIndexForBrand(brandIndex, this._stackSetIndex), { direction: -1 });
  }
}

if (!customElements.get("diffui-landing-brand-demo")) {
  customElements.define("diffui-landing-brand-demo", DiffuiLandingBrandDemo);
}
