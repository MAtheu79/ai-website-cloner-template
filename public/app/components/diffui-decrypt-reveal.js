// <diffui-decrypt-reveal> covers one image frame with the image re-drawn as
// scrambled glyphs, then decodes it back with a wipe. It sits inside a
// .stackFrame and reads that frame's final image (or its latest partial) every
// frame, so it follows crops, height tweens and partial updates on its own.
//
// The cover is opaque from the moment it is attached until its wipe. Before
// its first glyphs it shows a generating field on the cipher's own backdrop,
// and once glyphs are up they stay up: while a newer image is still loading
// or decoding, the last one keeps being drawn. The one thing a cover does not
// hide first is a finished picture it is being laid over (an image being
// edited): that stays in view and the glyphs fade in over it.
//
// Frames arrive from the shared renderer as whole-buffer ImageBitmaps with the
// reveal in their top-left corner; the canvas is sized to the buffer and the
// host clips it to the section. A reveal that is scrolled out of view, or in a
// hidden box, draws nothing until it is back; one whose box changes size after
// it has drawn (a height tween, a zoom) draws again before the browser paints.
import "./diffui-generating-field.js";
import { DECRYPT_BACKDROP, DECRYPT_OPTIONS, decryptEase, decryptSourceChanged, fitContentRect } from "./canvas-decrypt-options.js";
import { decryptRenderer, runDecryptLoop, stopDecryptLoop } from "./canvas-decrypt-renderer.js";

const MAX_PIXEL_RATIO = 2;
const MAX_DIMENSION = 2048;
// The glyphs fade in over the waiting field. A host that brings the whole
// frame in itself sets --decrypt-fade to 0ms.
const FADE_MS = 180;
// A cipher that is only holding changes as its cells rescramble, a few times
// a second, and every unfinished design in view holds one. It is redrawn at
// this pace, not on every display frame; morphs and wipes draw every frame.
const HOLD_FRAME_MS = 1000 / 30;

class DiffuiDecryptReveal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      :host { position:absolute; inset:0; display:block; pointer-events:none; z-index:4; border-radius:inherit; overflow:hidden; transition:opacity ${FADE_MS}ms ease; }
      :host([hidden]) { display:none; }
      :host([data-aside]) { opacity:0; }
      canvas { position:absolute; left:0; top:0; display:block; opacity:0; transition:opacity var(--decrypt-fade, ${FADE_MS}ms) ease; }
      .waiting[hidden] { display:none; }
      .waiting { position:absolute; inset:0; display:grid; place-items:center; font:12px sans-serif; background:${DECRYPT_BACKDROP.light}; color:rgba(26, 28, 30, 0.58); }
      .waiting[data-tone="dark"] { background:${DECRYPT_BACKDROP.dark}; color:rgba(255, 255, 255, 0.48); }
    `;
    this.canvas = document.createElement("canvas");
    this.waiting = document.createElement("diffui-generating-field");
    this.waiting.className = "waiting";
    this.waiting.textContent = "Generating...";
    this.shadowRoot.append(style, this.waiting, this.canvas);
    this.ctx = null;
    this.state = "hold";
    this.start = 0;
    this.seed = Math.random();
    // Whether glyphs are on the canvas, and what they were last drawn from.
    this.painted = false;
    this.shown = null;
    this.dormant = false;
    // When the canvas was last drawn. The shared loop draws the longest-waiting reveal first.
    this.drawnAt = 0;
    this._settled = false;
  }

  connectedCallback() {
    const renderer = decryptRenderer();
    if (!renderer) {
      this.remove();
      return;
    }
    this.ctx ||= this.canvas.getContext(renderer.offscreen ? "bitmaprenderer" : "2d");
    this._syncTone();
    if (this.dormant) return;
    // Whoever attached the cover is still setting its frame up. Look at what
    // is under it once they are done, which is before anything is painted.
    queueMicrotask(() => this._syncWaiting());
    if (typeof IntersectionObserver === "function") {
      this._inView = new IntersectionObserver(entries => {
        const entry = entries[entries.length - 1];
        if (entry.isIntersecting) this._run();
        else this._park(entry.boundingClientRect.width === 0 && entry.boundingClientRect.height === 0);
      }, { rootMargin: "64px" });
      this._inView.observe(this);
    }
    if (typeof ResizeObserver === "function") {
      this._resized = new ResizeObserver(() => this._redrawIfResized());
      this._resized.observe(this);
    }
    this._run();
  }

  disconnectedCallback() {
    clearTimeout(this._waitingTimer);
    this._unobserve();
    this._stop();
  }

  _run() {
    this._running = true;
    runDecryptLoop(this);
  }

  _stop() {
    this._running = false;
    stopDecryptLoop(this);
  }

  _unobserve() {
    this._inView?.disconnect();
    this._resized?.disconnect();
    this._inView = this._resized = null;
  }

  /**
   * Whatever resizes the frame (a section's height tween, a zoom) may run
   * after this frame's draw. Draw again at the new size before the browser
   * paints, or the image shows along the edge the glyphs have not reached.
   */
  _redrawIfResized() {
    if (!this._running || !this.painted) return;
    const box = this.getBoundingClientRect();
    if (Math.abs(box.width - this._boxWidth) < 0.5 && Math.abs(box.height - this._boxHeight) < 0.5) return;
    this._settled = false;
    this.drawFrame(this.drawnAt);
  }

  /** True while the cover is up but its glyphs have not been drawn yet. */
  get pending() {
    return !this.dormant && !this.painted;
  }

  /** Show the full cipher and keep it scrambling until reveal(). */
  hold() {
    if (this.state === "reveal") return;
    this.state = "hold";
    // What was left in view may since have stopped being fit to show.
    if (this.waiting.hidden && !this.painted && !this._pictureStays()) this.waiting.hidden = false;
  }

  /** Start the wipe now, or as soon as the frame has a decoded image to show. */
  reveal() {
    // A cover that cannot draw, or has neither drawn nor hidden anything yet, has nothing to take off.
    if (this.dormant || (!this.painted && this.waiting.hidden)) {
      this._finish();
      return;
    }
    if (this.state === "reveal") return;
    this.state = "reveal";
    this.start = 0;
  }

  /**
   * Whether what is under the cover can stay in view until the glyphs are up:
   * a finished picture the cipher is being laid over, as when an image is
   * being edited. Not a blurred preview or a section still to be cropped, and
   * not an image waiting to be wiped in, which nobody has seen yet.
   */
  _pictureStays() {
    const frame = this.parentElement;
    if (this.state !== "hold" || !frame) return false;
    const { partial, partialReveal, sectionPending } = frame.dataset;
    return partial !== "true" && !partialReveal && sectionPending !== "true" && this._source().final;
  }

  /** Before its first glyphs the cover shows the waiting field, unless the picture under it stays. */
  _syncWaiting() {
    if (this.painted || this.dormant) return;
    const hide = this._pictureStays();
    if (this.waiting.hidden !== hide) this.waiting.hidden = hide;
  }

  _clear() {
    if (!this.ctx) return;
    if (typeof this.ctx.transferFromImageBitmap === "function") this.ctx.transferFromImageBitmap(null);
    else this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** The cover comes off. It is gone by the time anyone hears about it. */
  _finish() {
    this.remove();
    this.dispatchEvent(new CustomEvent("decrypt-stage", {detail:{stage:"wipe-complete"}}));
    this.dispatchEvent(new CustomEvent("decrypt-done"));
  }

  /**
   * Glyphs cannot be drawn (WebGL is gone, or the image will not load as a
   * texture). Leave the frame showing its own image, as it does where the
   * effect is unsupported, rather than a cover that never changes.
   */
  _stepAside() {
    if (this.state === "reveal") {
      this._finish();
      return;
    }
    this.dormant = true;
    this.painted = false;
    this._unobserve();
    this._stop();
    // Fade out of the way rather than cut to the image underneath.
    this.dataset.aside = "true";
    clearTimeout(this._waitingTimer);
    this._waitingTimer = setTimeout(() => {
      this.hidden = true;
      this._clear();
    }, FADE_MS + 40);
    this.dispatchEvent(new CustomEvent("decrypt-stage", {detail:{stage:"unavailable"}}));
  }

  /** Out of view: stop drawing until the reveal is back. */
  _park(boxHidden) {
    this._stop();
    this._settled = false;
    if (!this.painted) return;
    if (boxHidden) {
      // Nobody can see into a hidden box. Hand the frame's memory back; the
      // cover starts over, as a new one would, when it is seen again.
      this.painted = false;
      clearTimeout(this._waitingTimer);
      this.canvas.style.opacity = "0";
      this._clear();
      this._syncWaiting();
      return;
    }
    // The last frame stays up, stretched with the box so that it still covers
    // the image if the canvas is zoomed before the reveal is seen again.
    this.canvas.style.width = `${this._spanX * 100}%`;
    this.canvas.style.height = `${this._spanY * 100}%`;
    this._cssWidth = this._cssHeight = 0;
  }

  // The backdrop follows the canvas theme, which itself follows the system
  // unless the app is set otherwise.
  _dark() {
    const theme = this.getRootNode()?.host?.getAttribute?.("data-theme");
    if (theme === "dark" || theme === "light") return theme === "dark";
    return !!window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  }

  _syncTone() {
    const tone = this._dark() ? "dark" : "light";
    if (this.waiting.dataset.tone !== tone) this.waiting.dataset.tone = tone;
    return tone === "dark";
  }

  /**
   * The frame's image to draw as glyphs: its final once that has loaded, else
   * its partial. While neither is loaded (a newer partial or the final is on
   * its way) the element is still what the glyphs are framed by.
   */
  _source() {
    const frame = this.parentElement;
    const final = frame?.querySelector(".stackFrameFinal");
    const partial = frame?.querySelector(".stackFramePartial");
    const loaded = image => !!image && image.complete && image.naturalWidth > 0;
    if (loaded(final) && final.getAttribute("src")) return { image: final, final: true, loaded: true, broken: false };
    if (loaded(partial)) return { image: partial, final: false, loaded: true, broken: false };
    const broken = !!final?.getAttribute("src") && final.complete && final.naturalWidth === 0;
    return { image: partial || final || null, final: false, loaded: false, broken };
  }

  /**
   * Draw this frame's glyphs. budget, from the shared loop, is the drawing
   * time the frame has left: a reveal that already has glyphs up skips the
   * frame once it is spent.
   */
  drawFrame(now, budget = null) {
    if (!this.isConnected || !this.ctx || this.dormant) return;
    // Each reveal keeps its own beat, so that several of them holding at once
    // do not all draw on the same frame.
    const beat = Math.floor(now / HOLD_FRAME_MS + this.seed);
    if (this.state === "hold" && this.painted) {
      if (this._settled && beat === this._beat) return;
      if (budget && budget.left <= 0) return;
    }
    const renderer = decryptRenderer();
    if (!renderer) {
      this._stepAside();
      return;
    }
    const box = this.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) return;
    const dark = this._syncTone();
    const source = this._source();
    // Until a newer image has loaded and its texture has decoded, keep drawing
    // the last one shown, framed by the same element box.
    let shown = this.shown;
    // Whether the frame's final image is up for a wipe to decode onto. Glyphs
    // drawn from a final say nothing about it: an edit swaps one final for another.
    let finalUp = false;
    if (source.loaded) {
      const image = source.image;
      const key = image.currentSrc || image.src;
      if (renderer.textureReady(key, image)) {
        shown = { key, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, final: source.final };
        finalUp = source.final;
      } else if (renderer.textureFailed(key)) {
        if (!shown) {
          this._stepAside();
          return;
        }
        // The final cannot be drawn as glyphs, but the wipe can still decode onto it.
        if (source.final) {
          shown = { ...shown, final: true };
          finalUp = true;
        }
      }
    } else if (source.broken && this.state === "reveal") {
      // The final failed to load: there is nothing to decode onto.
      this._finish();
      return;
    }
    if (!shown) return;
    this.shown = shown;
    const final = shown.final;
    const options = DECRYPT_OPTIONS;
    let front = -1;
    if (this.state === "reveal" && (finalUp || this.start)) {
      // A reveal waits for its final image, so the wipe decodes real pixels.
      if (!this.start) this.start = now;
      const t = (now - this.start) / Math.max(100, options.duration);
      const jagRoom = options.jag * 0.07;
      front = -jagRoom + decryptEase(t) * (1 + options.edge + jagRoom * 2);
      if (t >= 1) {
        this._finish();
        return;
      }
    }
    // A wipe takes its turn like the rest, now that it has had the chance to finish.
    if (this.painted && budget && budget.left <= 0) return;
    const began = budget ? performance.now() : 0;
    const ratio = Math.min(
      window.devicePixelRatio || 1,
      MAX_PIXEL_RATIO,
      MAX_DIMENSION / Math.max(box.width, box.height),
    );
    // Rounded up, so the glyphs reach the frame's far edges.
    const width = Math.max(1, Math.ceil(box.width * ratio - 0.01));
    const height = Math.max(1, Math.ceil(box.height * ratio - 0.01));
    const image = source.image;
    const imageBox = image ? image.getBoundingClientRect() : box;
    const fit = image ? getComputedStyle(image).objectFit : "cover";
    const content = fitContentRect(
      { x: imageBox.left - box.left, y: imageBox.top - box.top, width: imageBox.width, height: imageBox.height },
      shown.naturalWidth,
      shown.naturalHeight,
      fit,
    );
    // Track the source in units of the box width, so zooming the canvas is
    // not mistaken for a new image or framing.
    const unit = box.width;
    const next = { key: shown.key, rect: { x: content.x / unit, y: content.y / unit, width: content.width / unit, height: content.height / unit } };
    // The last change, onto the final image in its settled crop, wipes
    // quickly; earlier versions (partials, the uncropped final) morph slowly.
    const settled = final && this.parentElement?.dataset.sectionPending !== "true";
    let morph = 1;
    if (this.morphStart) {
      morph = (now - this.morphStart) / Math.max(1, this.morphDuration);
      if (morph >= 1) this.morphStart = 0;
    }
    if (decryptSourceChanged(this.last, next, !!this.morphStart && !(settled && !this.morphFinal))) {
      const duration = settled ? options.finalMorph : options.morph;
      if (duration > 0) {
        // Freeze what was on screen and resolve to the new source cell by cell.
        this.prev = this.morphStart ? this.prev : this.last;
        this.morphStart = now;
        this.morphDuration = duration;
        this.morphFinal = settled;
        morph = 0;
      }
    }
    this.last = next;
    const toPx = rect => ({ x: rect.x * unit * ratio, y: rect.y * unit * ratio, width: rect.width * unit * ratio, height: rect.height * unit * ratio });
    if (!renderer.offscreen && (this.canvas.width !== width || this.canvas.height !== height)) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    const drawn = renderer.render(this.ctx, width, height, {
      textureKey: shown.key,
      prev: this.morphStart && this.prev ? { key: this.prev.key, rect: toPx(this.prev.rect) } : null,
      morph,
      dark,
      morphWipe: this.morphFinal,
      imageRect: toPx(next.rect),
      front,
      time: now / 1000,
      seed: this.seed,
      pixelRatio: ratio,
    });
    if (budget) budget.left -= performance.now() - began;
    if (!drawn) return;
    this.drawnAt = now;
    this._beat = beat;
    // Settled: holding one image in one place, with nothing to draw before the next beat.
    this._settled = front === -1 && !this.morphStart;
    this._boxWidth = box.width;
    this._boxHeight = box.height;
    // The frame is the whole shared buffer: size the canvas to it in CSS px
    // so its top-left corner lines up with the section; the host clips the rest.
    // Ratio is device px per screen px; the canvas zoom may scale the host, so
    // convert to the host's own layout px.
    const local = (this.offsetWidth || box.width) / box.width;
    const cssWidth = renderer.offscreen ? drawn.bufferWidth / ratio * local : this.offsetWidth;
    const cssHeight = renderer.offscreen ? drawn.bufferHeight / ratio * local : this.offsetHeight;
    if (this._cssWidth !== cssWidth || this._cssHeight !== cssHeight) {
      this._cssWidth = cssWidth;
      this._cssHeight = cssHeight;
      this.canvas.style.width = `${cssWidth}px`;
      this.canvas.style.height = `${cssHeight}px`;
    }
    // How much of the host the canvas spans, for _park.
    this._spanX = renderer.offscreen ? drawn.bufferWidth / width : 1;
    this._spanY = renderer.offscreen ? drawn.bufferHeight / height : 1;
    if (!this.painted) {
      this.painted = true;
      this.canvas.style.opacity = "1";
      // The field stays put, opaque, until the glyphs have faded in over it:
      // two half-faded layers would let the image underneath show through.
      clearTimeout(this._waitingTimer);
      this._waitingTimer = setTimeout(() => { this.waiting.hidden = true; }, FADE_MS + 40);
    }
    const stage = !final ? "partial-painted" : settled ? "cropped-final-painted" : "uncropped-final-painted";
    if (this._lastStage !== stage) {
      this._lastStage = stage;
      this.dispatchEvent(new CustomEvent("decrypt-stage", {detail:{stage}}));
    }
  }
}

if (!customElements.get("diffui-decrypt-reveal")) customElements.define("diffui-decrypt-reveal", DiffuiDecryptReveal);
