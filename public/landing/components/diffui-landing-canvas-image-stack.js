import "../../app/components/diffui-decrypt-reveal.js";
import { VisibleActivity } from "./visible-activity.js";

// The marketing canvas's image stack, matching the editor: one design shows at
// a time and options slide in from the side, while their thumbnails live in
// the canvas's bottom dock (<diffui-landing-canvas-stack-dock>), not under the
// node. A design generated while it is the shown option arrives as glyphs: its
// partial scrambles in place, then decodes left to right once the final lands,
// using the editor's own <diffui-decrypt-reveal>.
//
// Every change to the options is announced as a bubbling, composed
// `stack-change` event ({ type: "slots" | "slot" | "active", index }) so the
// dock can patch just the thumbnail that changed.

const SWITCH_MS = 220;

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 100%;
      flex: 0 0 auto;
      pointer-events: none;
      --stack-plane: #11151a;
      --stack-rim: rgba(255, 255, 255, 0.22);
      --stack-shadow: 0 10px 20px rgba(0, 0, 0, 0.24);
      --canvas-bg: #0d1014;
      --canvas-text-faint: rgba(255, 255, 255, 0.48);
    }

    :host([data-theme="light"]) {
      --stack-plane: #f2efe9;
      --stack-rim: rgba(26, 28, 30, 0.26);
      --stack-shadow: 0 10px 20px rgba(26, 28, 30, 0.14);
      --canvas-bg: #f2efe9;
      --canvas-text-faint: rgba(26, 28, 30, 0.58);
    }

    .wrap {
      position: absolute;
      inset: 0;
    }

    .nodeStack {
      position: absolute;
      inset: 0;
      overflow: hidden;
      border-radius: var(--radius-sm, 4px);
      box-shadow: var(--stack-shadow);
    }

    .nodeStack[hidden] {
      display: none;
    }

    :host([data-comparison="true"]) .wrap {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    :host([data-comparison="true"]) .nodeStack {
      position: relative;
      inset: auto;
      width: min(100%, 356px);
      aspect-ratio: 16 / 9;
    }

    .stackFrame {
      position: absolute;
      inset: 0;
      border-radius: var(--radius-sm, 4px);
      background: var(--stack-plane);
      box-sizing: border-box;
      pointer-events: none;
      transition: transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 180ms ease;
    }

    .stackFrame::after {
      content: "";
      position: absolute;
      inset: 0;
      border: 1px solid var(--stack-rim);
      border-radius: inherit;
      pointer-events: none;
      z-index: 5;
    }

    .stackFrameMedia {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      overflow: hidden;
    }

    .stackFrameLayer {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      object-position: top center;
    }

    .stackFrameFinal:not([src]),
    .stackFrame[data-final-ready="true"] .stackFramePartial {
      visibility: hidden;
    }

    .stackFrameFinal {
      z-index: 2;
    }

    /* Carousel positions, as in the editor: 0 is the shown option, -1 / 1 sit
       one width off to the left / right, "enter" fades a first image in. */
    .stackFrame[data-layer="0"] {
      z-index: 2;
      transform: translateX(0);
    }

    .stackFrame[data-layer="-1"] {
      z-index: 1;
      transform: translateX(-100%);
    }

    .stackFrame[data-layer="1"] {
      z-index: 1;
      transform: translateX(100%);
    }

    .stackFrame[data-layer="enter"] {
      z-index: 2;
      opacity: 0;
    }

    .stackFrame[data-layer="hidden"] {
      z-index: 0;
      opacity: 0;
      transition: none;
    }
  </style>
  <div class="wrap">
    <div class="nodeStack" id="stack"></div>
  </div>
`;

export class DiffuiLandingCanvasImageStack extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._stack = this.shadowRoot.getElementById("stack");
    this._images = [];
    this._slots = [];
    this._activeIndex = 0;
    this._dock = null;
    this._comparisonFrame = null;
    this._activity = new VisibleActivity(this, undefined, this.shadowRoot.querySelector(".wrap"));
  }

  connectedCallback() {
    this._activity.connect();
  }

  disconnectedCallback() {
    this._activity.disconnect();
  }

  _isComparisonMode() {
    return this.hasAttribute("data-comparison");
  }

  set images(urls) {
    if (!Array.isArray(urls)) return;
    if (urls.length === this._images.length && urls.every((url, index) => url === this._images[index])) return;
    this._images = urls.slice();
    this.reset();
  }

  get images() {
    return this._images.slice();
  }

  /** The options as the dock shows them: what each one has to show, and its state. */
  get options() {
    return this._slots.map((slot) => ({
      status: slot.status,
      url: slot.status === "ready" ? slot.url : slot.partialUrl || "",
    }));
  }

  get activeIndex() {
    return this._activeIndex;
  }

  get slotCount() {
    return this._slots.length;
  }

  /** Width over height of the shown design, for sizing dock thumbnails. */
  get aspect() {
    const rect = this._stack?.getBoundingClientRect();
    return rect && rect.width > 0 && rect.height > 0 ? rect.width / rect.height : 16 / 9;
  }

  /** The dock that currently shows this stack's thumbnails, set by the dock. */
  set dock(dock) {
    this._dock = dock || null;
  }

  get dock() {
    return this._dock;
  }

  getDotElement(index) {
    return this._dock?.thumb(index) || null;
  }

  reset() {
    this._slots = [];
    this._activeIndex = 0;
    this._comparisonFrame = null;
    this._stack?.replaceChildren();
    if (this._stack) this._stack.hidden = false;
    this._emit("slots");
  }

  /** Comparison-section loop: one new design decodes over the last. */
  reveal(index) {
    if (!Number.isFinite(index) || index < 0 || index >= this._images.length || !this._stack) return;
    const url = this._images[index];
    if (!url) return;
    const previous = this._comparisonFrame;
    const frame = this._createFrame(index);
    frame.dataset.layer = "0";
    this._stack.appendChild(frame);
    this._comparisonFrame = frame;
    const finalImg = frame.querySelector(".stackFrameFinal");
    const settle = () => {
      frame.dataset.finalReady = "true";
      // Older designs only go once the new one covers them.
      for (const old of this._stack.querySelectorAll(".stackFrame")) {
        if (old !== frame && old !== previous) old.remove();
      }
    };
    finalImg.addEventListener("load", settle, { once: true });
    finalImg.src = url;
    const reveal = this._decryptFor(frame);
    reveal?.addEventListener("decrypt-done", () => {
      if (previous?.isConnected && this._comparisonFrame !== previous) previous.remove();
    }, { once: true });
    reveal?.reveal();
  }

  startGeneration(count, imageUrls = []) {
    if (!this._stack) return;
    this._stack.replaceChildren();
    this._stack.hidden = true;
    this._slots = Array.from({ length: count }, (_, index) => ({
      index,
      url: imageUrls[index] || "",
      partialUrl: "",
      status: "loading",
      armed: true,
      frame: null,
    }));
    this._activeIndex = 0;
    this._emit("slots");
  }

  /** Options that already exist (an opened file): shown plainly, no decode. */
  showReady(urls, activeIndex = 0) {
    this.startGeneration(urls.length, urls);
    this._activeIndex = Math.min(Math.max(0, activeIndex), Math.max(0, urls.length - 1));
    this._slots.forEach((slot) => {
      slot.armed = false;
      this.revealFinal(slot.index, slot.url);
      slot.frame.dataset.layer = slot.index === this._activeIndex ? "0" : "hidden";
    });
    this._emit("active", this._activeIndex);
  }

  revealPartial(index, url) {
    const slot = this._slots[index];
    if (!slot || !url) return;
    slot.partialUrl = url;
    if (slot.status === "loading") slot.status = "partial";
    const frame = this._ensureFrame(slot);
    const partialImg = frame.querySelector(".stackFramePartial");
    if (partialImg.getAttribute("src") !== url) partialImg.src = url;
    this._syncDecrypt(slot);
    this._emit("slot", index);
  }

  revealFinal(index, url) {
    const slot = this._slots[index];
    if (!slot || !url) return;
    slot.url = url;
    slot.status = "ready";
    const frame = this._ensureFrame(slot);
    const finalImg = frame.querySelector(".stackFrameFinal");
    const ready = () => {
      frame.dataset.finalReady = "true";
    };
    if (finalImg.getAttribute("src") !== url) {
      finalImg.addEventListener("load", ready, { once: true });
      finalImg.src = url;
    } else if (finalImg.complete) {
      ready();
    }
    this._syncDecrypt(slot);
    this._emit("slot", index);
  }

  /** Show option `index`, sliding it in from the side it sits on. */
  selectIndex(index, { direction } = {}) {
    if (!Number.isFinite(index) || index < 0 || index >= this._slots.length) return;
    const next = this._slots[index];
    if (!next?.frame) return;
    const prevIndex = this._activeIndex;
    if (prevIndex === index) return;
    const prev = this._slots[prevIndex];
    const dir = direction === 1 || direction === -1 ? direction : index > prevIndex ? 1 : -1;
    this._activeIndex = index;
    if (prev?.frame) {
      this._syncDecrypt(prev);
      prev.frame.dataset.layer = dir > 0 ? "-1" : "1";
      const leaving = prev.frame;
      this._activity.setTimeout(() => {
        if (leaving.dataset.layer !== "0") leaving.dataset.layer = "hidden";
      }, SWITCH_MS);
    }
    const frame = next.frame;
    frame.style.transition = "none";
    frame.dataset.layer = dir > 0 ? "1" : "-1";
    void frame.offsetWidth;
    frame.style.removeProperty("transition");
    frame.dataset.layer = "0";
    this._syncDecrypt(next);
    this._emit("active", index);
  }

  _emit(type, index = -1) {
    this.dispatchEvent(new CustomEvent("stack-change", { detail: { type, index }, bubbles: true, composed: true }));
  }

  _ensureFrame(slot) {
    if (slot.frame) return slot.frame;
    const frame = this._createFrame(slot.index);
    slot.frame = frame;
    this._stack.hidden = false;
    this._stack.appendChild(frame);
    if (slot.index === this._activeIndex) {
      // The first image fades in where the prompt was.
      frame.dataset.layer = "enter";
      this._activity.requestAnimationFrame(() => {
        this._activity.requestAnimationFrame(() => {
          if (frame.isConnected && slot.index === this._activeIndex) frame.dataset.layer = "0";
        });
      });
    } else {
      frame.dataset.layer = "hidden";
    }
    return frame;
  }

  _createFrame(index) {
    const frame = document.createElement("div");
    frame.className = "stackFrame";
    frame.dataset.slotIndex = String(index);
    const media = document.createElement("div");
    media.className = "stackFrameMedia";
    const partialImg = document.createElement("img");
    partialImg.className = "stackFrameLayer stackFramePartial";
    partialImg.alt = "";
    partialImg.decoding = "async";
    partialImg.setAttribute("aria-hidden", "true");
    const finalImg = document.createElement("img");
    finalImg.className = "stackFrameLayer stackFrameFinal";
    finalImg.alt = "";
    finalImg.decoding = "async";
    media.append(partialImg, finalImg);
    frame.append(media);
    return frame;
  }

  _decryptFor(frame, create = true) {
    let reveal = frame.querySelector(":scope > diffui-decrypt-reveal");
    if (!reveal && create) {
      reveal = document.createElement("diffui-decrypt-reveal");
      frame.appendChild(reveal);
    }
    return reveal;
  }

  /**
   * As in the editor: only the shown option decodes. While it generates it
   * holds as glyphs over its partial; its final wipes in once. An option that
   * finishes out of sight just shows its image when picked later.
   */
  _syncDecrypt(slot) {
    const frame = slot.frame;
    if (!frame) return;
    const shown = slot.index === this._activeIndex;
    if (!shown) {
      this._decryptFor(frame, false)?.remove();
      if (slot.status === "ready") slot.armed = false;
      return;
    }
    if (!slot.armed) return;
    if (slot.status === "partial") {
      this._decryptFor(frame)?.hold();
      return;
    }
    if (slot.status === "ready") {
      slot.armed = false;
      this._decryptFor(frame)?.reveal();
    }
  }
}

if (!customElements.get("diffui-landing-canvas-image-stack")) {
  customElements.define("diffui-landing-canvas-image-stack", DiffuiLandingCanvasImageStack);
}
