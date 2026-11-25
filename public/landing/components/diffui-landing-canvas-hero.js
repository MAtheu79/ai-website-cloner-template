import { strokeNoodle } from "../../app/components/canvas-noodle.js";
import "./diffui-landing-canvas-prompt-node.js";
import "./diffui-landing-canvas-stack-dock.js";
import { VisibleActivity } from "./visible-activity.js";

const JAZZ_ASSET = (name) => `/landing/assets/landing/${name}.webp`;
const JAZZ_PARTIAL = (name) => `/landing/assets/landing/${name}p.webp`;

const ROOT_PROMPT =
  "Create a website for a city jazz festival. It should feel expressive, rhythmic, and easy to scan. It should feature the festival lineup.";
const LINEUP_PROMPT = "Create the lineup page for the jazz festival";
const SCHEDULE_PROMPT = "Show me the festival schedule page";

const ROOT_IMAGES = [1, 2, 3, 4, 5].map((n) => JAZZ_ASSET(`jazz_initial_${n}`));
const ROOT_PARTIALS = [1, 2, 3, 4, 5].map((n) => JAZZ_PARTIAL(`jazz_initial_${n}`));
const LINEUP_IMAGES = [1, 2, 3].map((n) => JAZZ_ASSET(`jazz_lineup_${n}`));
const LINEUP_PARTIALS = [1, 2, 3].map((n) => JAZZ_PARTIAL(`jazz_lineup_${n}`));
const SCHEDULE_IMAGES = [1, 2, 3].map((n) => JAZZ_ASSET(`jazz_schedule_${n}`));
const SCHEDULE_PARTIALS = [1, 2, 3].map((n) => JAZZ_PARTIAL(`jazz_schedule_${n}`));

const NODE_LAYOUT = {
  root: { x: 40, y: 60, w: 280, h: 158 },
  pricing: { x: 380, y: 40, w: 260, h: 146 },
  about: { x: 380, y: 240, w: 260, h: 146 },
};

const HEADER_CHROME = 36;
// Option thumbnails dock to the bottom of the canvas, so nodes are fitted into
// the area above it.
const DOCK_RESERVE = 62;
const STACK_BAR_CHROME = 8;
const OUTPUT_CHROME = 28;
const INPUT_CHROME = 16;

function layoutBounds(layout) {
  return {
    x: layout.x - INPUT_CHROME,
    y: layout.y - HEADER_CHROME,
    width: layout.w + INPUT_CHROME + OUTPUT_CHROME,
    height: layout.h + HEADER_CHROME + STACK_BAR_CHROME,
  };
}

function combinedBounds(layouts) {
  const boxes = layouts.map(layoutBounds);
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  const x2 = Math.max(...boxes.map((b) => b.x + b.width));
  const y2 = Math.max(...boxes.map((b) => b.y + b.height));
  return { x, y, width: x2 - x, height: y2 - y };
}

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 100%;
    }

    .heroStage {
      position: relative;
      width: 100%;
      aspect-ratio: 2 / 1;
      border: none;
      border-radius: 0;
      background: transparent;
      /* Clip the demo to its stage, but leave room for floating UI shadows
         (the option strip sits near the bottom edge). */
      overflow: clip;
      overflow-clip-margin: 48px;
      pointer-events: none;
    }

    :host([data-theme="light"]) .heroStage {
      background: transparent;
    }

    canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
    }

    .nodeLayer {
      position: absolute;
      inset: 0;
      overflow: clip;
      overflow-clip-margin: 48px;
      pointer-events: auto;
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

    .demoCursor[data-visible="true"] {
      opacity: 1;
    }

    .demoCursor img {
      width: 100%;
      height: 100%;
      display: block;
    }
  </style>
  <div class="heroStage" id="stage">
    <canvas id="canvas"></canvas>
    <div class="nodeLayer" id="nodeLayer"></div>
    <diffui-landing-canvas-stack-dock id="stackDock"></diffui-landing-canvas-stack-dock>
    <div class="demoCursor" id="cursor" aria-hidden="true">
      <img src="/app/assets/canvas-cursor-pointer.png" alt="" />
    </div>
  </div>
`;

function optionFinalMs(index, {
  partialMs = 3000,
  partialStagger = 420,
  finalDelayAfterPartial = 2000,
  finalStagger = 300,
} = {}) {
  const pDelay = partialMs + index * partialStagger;
  return pDelay + finalDelayAfterPartial + index * finalStagger;
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export class DiffuiLandingCanvasHero extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._stage = this.shadowRoot.getElementById("stage");
    this._canvas = this.shadowRoot.getElementById("canvas");
    this._nodeLayer = this.shadowRoot.getElementById("nodeLayer");
    this._cursor = this.shadowRoot.getElementById("cursor");
    this._dock = this.shadowRoot.getElementById("stackDock");
    this._onNodeChange = () => this._syncDock();
    this._ctx = this._canvas?.getContext("2d");
    this._nodes = new Map();
    this._layouts = new Map();
    this._edges = [];
    this._running = false;
    this._started = false;
    this._abort = false;
    this._viewport = { x: 0, y: 0, scale: 1 };
    this._viewMode = "single";
    this._cursorPos = { x: 0, y: 0 };
    this._portDrag = null;
    this._resizeObserver = null;
    this._mobileMq = null;
    this._mobileMqHandler = null;
    this._activity = new VisibleActivity(this, () => this.start());
  }

  connectedCallback() {
    this._activity.connect();
    this._syncScale();
    this._resizeObserver = new ResizeObserver(() => this._syncScale());
    if (this._stage) this._resizeObserver.observe(this._stage);
    this._resizeObserver.observe(this);
    this._mobileMq = window.matchMedia("(max-width: 760px)");
    this._mobileMqHandler = () => this._syncScale();
    this._mobileMq.addEventListener("change", this._mobileMqHandler);
    this._nodeLayer?.addEventListener("landing-node-select", this._onNodeChange);
    this._nodeLayer?.addEventListener("stack-change", this._onNodeChange);
    this._syncNodeThemes();
    this._draw();
  }

  disconnectedCallback() {
    this._activity.disconnect();
    this._resizeObserver?.disconnect();
    if (this._mobileMq && this._mobileMqHandler) {
      this._mobileMq.removeEventListener("change", this._mobileMqHandler);
    }
    this._mobileMq = null;
    this._mobileMqHandler = null;
    this._nodeLayer?.removeEventListener("landing-node-select", this._onNodeChange);
    this._nodeLayer?.removeEventListener("stack-change", this._onNodeChange);
  }

  /**
   * As in the editor, the dock shows the option thumbnails of the one selected
   * node that has options; any other selection fades it out.
   */
  _syncDock() {
    if (!this._dock) return;
    const selected = [...this._nodes.values()].filter((node) => node.selected);
    const stack = selected.length === 1 ? selected[0].imageStack : null;
    if (stack?.slotCount) this._dock.attach(stack);
    else this._dock.close();
  }

  static get observedAttributes() {
    return ["data-theme"];
  }

  attributeChangedCallback(name) {
    if (name === "data-theme") this._syncNodeThemes();
  }

  _syncNodeThemes() {
    const theme = this.getAttribute("data-theme");
    if (!theme) return;
    this._nodes.forEach((node) => node.setAttribute("data-theme", theme));
    this._dock?.setAttribute("data-theme", theme);
  }

  /** One persistent emitter per node, including its empty prompt/loading state. */
  getNodeLightSources() {
    const sources = [];
    this._nodes.forEach((node, id) => {
      const rect = node.getBoundingClientRect();
      if (rect.width && rect.height) sources.push({ id, rect });
    });
    return sources;
  }

  async start() {
    if (this._started || this._running) return;
    this._started = true;
    this._running = true;
    this._abort = false;

    try {
      await this._runScript();
    } finally {
      this._running = false;
    }
  }

  _syncScale() {
    if (!this._stage) return;
    const sw = this._stage.clientWidth;
    const sh = this._stage.clientHeight;
    const layouts = this._viewportLayouts();
    const bounds = layouts.length === 1 ? layoutBounds(layouts[0]) : combinedBounds(layouts);
    this._viewport = this._computeFitViewport(bounds, this._viewportPadding());

    this._applyViewport();

    if (this._canvas) {
      const dpr = window.devicePixelRatio || 1;
      this._canvas.width = Math.floor(sw * dpr);
      this._canvas.height = Math.floor(sh * dpr);
      this._canvas.style.width = `${sw}px`;
      this._canvas.style.height = `${sh}px`;
      this._ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    this._draw();
  }

  _viewportLayouts() {
    if (this._viewMode === "single") return [NODE_LAYOUT.root];
    return [NODE_LAYOUT.root, NODE_LAYOUT.pricing, NODE_LAYOUT.about];
  }

  _viewportPadding() {
    return this._viewMode === "single" ? 0.06 : 0.08;
  }

  /** Maps layout stage coords to on-screen coords (accounts for external CSS scale on :host). */
  _getStageDisplayScale() {
    if (!this._stage) return { scaleX: 1, scaleY: 1 };
    const layoutW = this._stage.clientWidth || 1;
    const layoutH = this._stage.clientHeight || 1;
    const rect = this._stage.getBoundingClientRect();
    return {
      scaleX: rect.width / layoutW,
      scaleY: rect.height / layoutH,
    };
  }

  _displayToLayout(x, y) {
    const { scaleX, scaleY } = this._getStageDisplayScale();
    return {
      x: x / scaleX,
      y: y / scaleY,
    };
  }

  _getAnchorPointLayout(node, anchorName) {
    const pt = node.getAnchorPoint(anchorName, this._stage);
    if (!pt) return null;
    return this._displayToLayout(pt.x, pt.y);
  }

  _computeFitViewport(bounds, padding = 0.08) {
    const sw = this._stage?.clientWidth || 1;
    const sh = this._stage?.clientHeight || 1;
    const padX = sw * padding;
    const padY = sh * padding;
    const reserve = Math.min(DOCK_RESERVE, sh * 0.16);
    const usableH = sh - reserve;
    const scale = Math.min(
      (sw - 2 * padX) / bounds.width,
      (usableH - 2 * padY) / bounds.height,
    );
    return {
      x: (sw - bounds.width * scale) / 2 - bounds.x * scale,
      y: (usableH - bounds.height * scale) / 2 - bounds.y * scale,
      scale,
    };
  }

  _applyViewport() {
    this._layouts.forEach((layout, id) => {
      const node = this._nodes.get(id);
      if (node) this._applyNodeGeometry(node, layout);
    });
  }

  _applyNodeGeometry(node, layout) {
    const vp = this._viewport;
    const s = vp.scale;
    node.style.transform = `translate3d(${layout.x * s + vp.x}px, ${layout.y * s + vp.y}px, 0)`;
    node.style.setProperty("--node-stage-width", `${layout.w * s}px`);
    node.style.setProperty("--node-stage-height", `${layout.h * s}px`);
  }

  async _animateViewport(target, duration = 900) {
    const start = { ...this._viewport };
    const startTs = this._activity.now();
    return new Promise((resolve) => {
      const tick = (now) => {
        if (this._abort) {
          resolve();
          return;
        }
        const t = Math.min(1, (now - startTs) / duration);
        const e = easeInOut(t);
        this._viewport = {
          x: start.x + (target.x - start.x) * e,
          y: start.y + (target.y - start.y) * e,
          scale: start.scale + (target.scale - start.scale) * e,
        };
        this._applyViewport();
        this._draw();
        if (t < 1) this._activity.requestAnimationFrame(tick);
        else resolve();
      };
      this._activity.requestAnimationFrame(tick);
    });
  }

  async _zoomToAllNodes() {
    this._viewMode = "all";
    const target = this._computeFitViewport(
      combinedBounds([NODE_LAYOUT.root, NODE_LAYOUT.pricing, NODE_LAYOUT.about]),
      0.08,
    );
    await this._animateViewport(target, 900);
  }

  _draw() {
    if (!this._ctx || !this._canvas) return;
    const w = this._stage?.clientWidth || 0;
    const h = this._stage?.clientHeight || 0;
    this._ctx.clearRect(0, 0, w, h);
    this._drawEdges(this._ctx);
    if (this._portDrag) this._drawPortDrag(this._ctx);
  }

  _drawGrid(ctx, width, height) {
    const vp = this._viewport;
    const step = Math.max(4, 16 * vp.scale);
    const isLight = this.getAttribute("data-theme") === "light";
    ctx.save();
    ctx.strokeStyle = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let x = vp.x % step; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = vp.y % step; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  _worldToScreen(wx, wy) {
    const vp = this._viewport;
    return {
      x: wx * vp.scale + vp.x,
      y: wy * vp.scale + vp.y,
    };
  }

  _screenToWorld(sx, sy) {
    const vp = this._viewport;
    return {
      x: (sx - vp.x) / vp.scale,
      y: (sy - vp.y) / vp.scale,
    };
  }

  _portDragPreviewLayout(inputWorld, template) {
    const gap = 18 / this._viewport.scale;
    return {
      x: inputWorld.x + gap,
      y: inputWorld.y - template.h / 2,
      w: template.w,
      h: template.h,
    };
  }

  _targetInputWorld(layout) {
    const gap = 18 / this._viewport.scale;
    return {
      x: layout.x - gap,
      y: layout.y + layout.h / 2,
    };
  }

  _drawPortPreview(ctx, layout) {
    const p = this._worldToScreen(layout.x, layout.y);
    const w = layout.w * this._viewport.scale;
    const h = layout.h * this._viewport.scale;
    ctx.save();
    ctx.strokeStyle = "rgba(212,166,64,0.92)";
    ctx.fillStyle = "rgba(212,166,64,0.06)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 6]);
    ctx.fillRect(p.x, p.y, w, h);
    ctx.strokeRect(p.x, p.y, w, h);
    ctx.restore();
  }

  _drawBezierWire(ctx, fromPt, toPt, color = "rgba(212,166,64,0.72)") {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    strokeNoodle(ctx, fromPt, toPt);
    ctx.restore();
  }

  _drawPortDrag(ctx) {
    const drag = this._portDrag;
    if (!drag) return;
    const from = this._nodes.get(drag.fromId);
    if (!from) return;
    if (drag.preview) this._drawPortPreview(ctx, drag.preview);
    const fromPt = from.getAnchorPoint("output", this._stage);
    if (!fromPt) return;
    const fromLayout = this._displayToLayout(fromPt.x, fromPt.y);
    const endLayout = drag.wireEndScreen || fromLayout;
    this._drawBezierWire(ctx, fromLayout, endLayout, "#d4a640");
  }

  _drawEdges(ctx) {
    ctx.save();
    this._edges.forEach((edge) => {
      const from = this._nodes.get(edge.from);
      const to = this._nodes.get(edge.to);
      if (!from || !to) return;
      const fromPt = from.getAnchorPoint("output", this._stage);
      const toPt = to.getAnchorPoint("input", this._stage);
      if (!fromPt || !toPt) return;
      this._drawBezierWire(
        ctx,
        this._displayToLayout(fromPt.x, fromPt.y),
        this._displayToLayout(toPt.x, toPt.y),
      );
    });
    ctx.restore();
  }

  _createNode(id, layout, title) {
    const node = document.createElement("diffui-landing-canvas-prompt-node");
    node.id = id;
    node.title = title;
    const theme = this.getAttribute("data-theme");
    if (theme) node.setAttribute("data-theme", theme);
    this._layouts.set(id, layout);
    this._nodeLayer?.appendChild(node);
    this._nodes.set(id, node);
    this._applyNodeGeometry(node, layout);
    return node;
  }

  _addEdge(fromId, toId) {
    this._edges.push({ from: fromId, to: toId });
    this._draw();
  }

  _showCursor() {
    if (this._cursor) this._cursor.dataset.visible = "true";
  }

  _hideCursor() {
    if (this._cursor) this._cursor.dataset.visible = "false";
  }

  _setCursorPos(x, y) {
    this._cursorPos = { x, y };
    if (this._cursor) {
      const clicking = this._cursor.dataset.clicking === "true";
      const scale = clicking ? 0.88 : 1;
      this._cursor.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    }
  }

  async _moveCursorToPoint(x, y, duration = 500) {
    this._showCursor();
    const start = { ...this._cursorPos };
    const startTs = this._activity.now();
    return new Promise((resolve) => {
      const tick = (now) => {
        if (this._abort) {
          resolve();
          return;
        }
        const t = Math.min(1, (now - startTs) / duration);
        const e = easeInOut(t);
        this._setCursorPos(start.x + (x - start.x) * e, start.y + (y - start.y) * e);
        if (t < 1) this._activity.requestAnimationFrame(tick);
        else resolve();
      };
      this._activity.requestAnimationFrame(tick);
    });
  }

  async _moveCursorToAnchor(node, anchorName, duration = 500) {
    const pt = this._getAnchorPointLayout(node, anchorName);
    if (!pt) return;
    await this._moveCursorToPoint(pt.x, pt.y, duration);
  }

  async _clickCursor() {
    if (!this._cursor) return;
    this._cursor.dataset.clicking = "true";
    this._setCursorPos(this._cursorPos.x, this._cursorPos.y);
    await this._activity.wait(120);
    delete this._cursor.dataset.clicking;
    this._setCursorPos(this._cursorPos.x, this._cursorPos.y);
    await this._activity.wait(80);
  }

  async _dragCursor(fromX, fromY, toX, toY, duration, onProgress) {
    this._showCursor();
    const startTs = this._activity.now();
    return new Promise((resolve) => {
      const tick = (now) => {
        if (this._abort) {
          resolve();
          return;
        }
        const t = Math.min(1, (now - startTs) / duration);
        const e = easeInOut(t);
        const x = fromX + (toX - fromX) * e;
        const y = fromY + (toY - fromY) * e;
        this._setCursorPos(x, y);
        onProgress?.(t, e);
        if (t < 1) this._activity.requestAnimationFrame(tick);
        else resolve();
      };
      this._activity.requestAnimationFrame(tick);
    });
  }

  async _dragSpawnNode(fromNode, targetLayout, duration = 700) {
    const outPt = this._getAnchorPointLayout(fromNode, "output");
    if (!outPt) return;

    const endInput = this._targetInputWorld(targetLayout);
    const endScreen = this._worldToScreen(endInput.x, endInput.y);
    const startInput = this._screenToWorld(outPt.x, outPt.y);

    await this._moveCursorToAnchor(fromNode, "output", 400);

    this._portDrag = {
      fromId: fromNode.id,
      preview: this._portDragPreviewLayout(startInput, targetLayout),
      wireEndScreen: { ...outPt },
    };
    this._draw();

    await this._dragCursor(outPt.x, outPt.y, endScreen.x, endScreen.y, duration, (_t, e) => {
      const x = outPt.x + (endScreen.x - outPt.x) * e;
      const y = outPt.y + (endScreen.y - outPt.y) * e;
      const inputWorld = this._screenToWorld(x, y);
      this._portDrag = {
        fromId: fromNode.id,
        preview: this._portDragPreviewLayout(inputWorld, targetLayout),
        wireEndScreen: { x, y },
      };
      this._draw();
    });

    this._portDrag = null;
    this._draw();
  }

  async _runScript() {
    this._viewMode = "single";
    this._syncScale();

    const root = this._createNode("root", NODE_LAYOUT.root, "Prompt");
    root.setSelected(true);
    root.setOutputVisible(true);

    const rootCenter = this._worldToScreen(
      NODE_LAYOUT.root.x + NODE_LAYOUT.root.w / 2,
      NODE_LAYOUT.root.y + NODE_LAYOUT.root.h / 2,
    );
    this._setCursorPos(rootCenter.x + 40, rootCenter.y + 20);
    await this._activity.wait(400);

    // Step 1: type prompt
    await root.typePrompt(ROOT_PROMPT, 32);
    await this._activity.wait(300);

    // Step 2: plunger drag to 5
    await this._moveCursorToAnchor(root, "generate", 450);
    const genPt = this._getAnchorPointLayout(root, "generate");
    if (genPt) {
      await this._dragCursor(genPt.x, genPt.y, genPt.x - 44, genPt.y, 600, (_t, e) => {
        const count = Math.min(5, Math.max(0, Math.floor(e * 6)));
        root.setPlungerCount(count);
        root.setPlungerPull(Math.min(44, e * 44));
      });
      root.setPlungerCount(5);
      root.setPlungerPull(44);
      await this._activity.wait(150);
      root.resetPlunger();
    }

    // Step 3: generate 5 options; start dot tour once option 2 has finished
    const rootGen = { partialMs: 3000, partialUrls: ROOT_PARTIALS };
    root.startGeneration(5, ROOT_IMAGES, rootGen);
    await this._activity.wait(optionFinalMs(1, rootGen));

    // Step 4: dot tour 2-5 then back to 3 (skip dot 0 — already selected)
    const dotTour = [1, 2, 3, 4, 3];
    for (const idx of dotTour) {
      await this._moveCursorToAnchor(root, `dot-${idx}`, 350);
      await this._clickCursor();
      root.selectStackIndex(idx);
      await this._activity.wait(400);
    }

    // Zoom out and pan to fit all three nodes before branching
    await this._zoomToAllNodes();
    await this._activity.wait(200);

    // Step 5: drag output to spawn pricing node
    await this._dragSpawnNode(root, NODE_LAYOUT.pricing);

    const pricing = this._createNode("pricing", NODE_LAYOUT.pricing, "Lineup page");
    pricing.setSelected(true);
    pricing.setInputVisible(true);
    pricing.setOutputVisible(true);
    root.setSelected(false);
    this._addEdge("root", "pricing");
    await this._activity.wait(300);

    await pricing.typePrompt(LINEUP_PROMPT, 32);
    await this._activity.wait(200);

    // Step 6: generate pricing — continue to about without waiting for results
    await this._moveCursorToAnchor(pricing, "generate", 350);
    await this._clickCursor();
    pricing.startGeneration(3, LINEUP_IMAGES, {
      partialUrls: LINEUP_PARTIALS,
      partialMs: 3000,
      jitterPartial: 400,
      jitterFinal: 600,
    });

    // Step 7: drag output to spawn about node
    await this._dragSpawnNode(root, NODE_LAYOUT.about);

    const about = this._createNode("about", NODE_LAYOUT.about, "Schedule page");
    about.setSelected(true);
    about.setInputVisible(true);
    root.setSelected(false);
    pricing.setSelected(false);
    this._addEdge("root", "about");
    await this._activity.wait(300);

    await about.typePrompt(SCHEDULE_PROMPT, 32);
    await this._activity.wait(200);

    // Step 8: auto-generate schedule (3 options)
    about.startGeneration(3, SCHEDULE_IMAGES, {
      partialUrls: SCHEDULE_PARTIALS,
      partialMs: 3000,
      jitterPartial: 400,
      jitterFinal: 600,
    });
    await this._activity.wait(7200);

    // Step 9: hold — hide cursor
    this._hideCursor();
  }
}

if (!customElements.get("diffui-landing-canvas-hero")) {
  customElements.define("diffui-landing-canvas-hero", DiffuiLandingCanvasHero);
}
