import { connectLandingTheme } from "../landing-theme.js";
import "./diffui-landing-brand-demo.js";
import "./diffui-landing-share-demo.js";

// What Linen works with, each over a linen collage. Your team: the share
// dialog, with a teammate inviting someone. Your agent: the prompt you'd hand
// your coding agent. Your brand: screenshots becoming a brand, then on-brand
// designs.
const ARROW_SVG = `
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>`;

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      --ta-card: light-dark(#ffffff, #15181b);
      --ta-pill: light-dark(#efede8, #22262a);
      /* A solid band across the page, ruled top and bottom, with the content
         in a centered 1600px column. */
      display: block;
      box-sizing: border-box;
      /* The same left edge as the page's other section headings. */
      padding: 48px max(48px, calc((100% - 1600px) / 2 + 24px)) 64px;
      /* Matches the river's floor above (--river-floor), whose band is the
         divider into this section. */
      background: light-dark(#f1ede5, #121519);
    }
    .row {
      display: grid;
      grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
      gap: 40px 56px;
      align-items: center;
    }
    .row.agent { grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr); }
    h3 {
      margin: 0 0 16px;
      font-family: var(--font-serif);
      font-size: clamp(34px, 3.8vw, 58px);
      font-weight: 500;
      line-height: 1;
      letter-spacing: -0.02em;
      color: var(--text);
    }
    .copy p {
      margin: 0;
      max-width: 480px;
      font-size: clamp(15px, 1.2vw, 18px);
      line-height: 1.55;
      color: var(--muted);
    }
    /* The graphics sit at 80% of their column, toward the copy. */
    .art { position: relative; width: 80%; }
    .row.team .art { justify-self: start; }
    /* Nudged left to line up with the team and brand graphics. */
    .row.agent .art { justify-self: end; left: -40px; }
    .art img.collage { display: block; width: 100%; height: auto; }
    diffui-landing-share-demo {
      position: absolute;
      left: 38%;
      top: 24%;
      /* A fixed size, like the real dialog: it doesn't shrink with the art. */
      width: 344px;
      max-width: calc(100vw - 48px);
    }
    .row.agent, .row.brand { margin-top: 72px; }
    /* The brand flow is wider than the other overlays, so its art gets more
       of the row. */
    .row.brand { grid-template-columns: minmax(0, 0.7fr) minmax(0, 1.3fr); }
    .row.brand .art { width: 100%; }
    /* The demo's pieces sit straight on the graphic, spilling past its
       sides. Both share one grid cell, so whichever is taller (the demo, once
       it stacks into a column on narrow screens) sets the row's height and
       nothing spills into the rows around it. */
    .row.brand .art { display: grid; grid-template-columns: minmax(0, 1fr); place-items: center; }
    .row.brand .art img.collage,
    .row.brand .art diffui-landing-brand-demo { grid-area: 1 / 1; }
    .row.brand .art img.collage { width: 58.5%; }
    diffui-landing-brand-demo { position: relative; width: 100%; }
    .prompt {
      position: absolute;
      left: 10%;
      top: 36%;
      /* At least 76% of the art, wider to keep the prompt on one line. */
      min-width: 76%;
      max-width: 90%;
      display: flex;
      align-items: center;
      gap: 13px;
      padding: 16px 19px;
      box-sizing: border-box;
      border-radius: 13px;
      background: var(--ta-card);
      box-shadow: 0 18px 50px rgba(20, 16, 8, 0.18), 0 2px 8px rgba(20, 16, 8, 0.08);
      color: var(--text);
      font-size: clamp(13px, 1.05vw, 15px);
      white-space: nowrap;
    }
    .prompt img { flex: none; width: 22px; height: 22px; }
    /* One line when there's room; wraps rather than spilling out of the card. */
    .prompt span { flex: 1; min-width: 0; white-space: normal; }
    .prompt svg { flex: none; width: 19px; height: 19px; color: var(--gold); }
    .building {
      position: absolute;
      left: 24%;
      top: calc(36% + 74px);
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 11px 21px;
      border-radius: 16px;
      background: var(--ta-pill);
      box-shadow: 0 10px 30px rgba(20, 16, 8, 0.12);
      color: var(--muted);
      font-size: clamp(12px, 0.95vw, 14px);
      white-space: nowrap;
    }
    .dots { display: flex; gap: 7px; }
    .dots i {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--muted);
      opacity: 0.35;
      animation: dot 1.2s ease-in-out infinite;
    }
    .dots i:nth-child(2) { animation-delay: 0.2s; }
    .dots i:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dot { 30% { opacity: 1; transform: translateY(-2px); } 60% { opacity: 0.35; transform: none; } }
    @media (prefers-reduced-motion: reduce) { .dots i { animation: none; } }
    @media (max-width: 940px) {
      .row, .row.agent { grid-template-columns: 1fr; }
      .row .art, .row.agent .art, .row.brand .art { width: 100%; max-width: 640px; justify-self: start; left: 0; }
      .row.agent .art { order: 2; }
      .row.brand { grid-template-columns: 1fr; }
      .row.brand .art img.collage { width: 70%; }
      .prompt { left: 8%; min-width: 84%; max-width: 92%; }
      .building { left: 16%; }
    }
  </style>

  <div class="row team">
    <div class="copy">
      <h3>Works with<br>your team.</h3>
      <p>Invite your team, collaborate in real time, and keep everything on brand. Linen gives you shared workspaces, version history, and brand controls — so everyone can move forward together.</p>
    </div>
    <div class="art">
      <img class="collage" src="/landing/assets/team/team-collage.webp" alt="" width="1936" height="1456" loading="lazy" decoding="async">
      <diffui-landing-share-demo></diffui-landing-share-demo>
    </div>
  </div>

  <div class="row agent">
    <div class="art">
      <img class="collage" src="/landing/assets/team/agent-collage.webp" alt="" width="1936" height="1456" loading="lazy" decoding="async">
      <div class="prompt" aria-hidden="true">
        <img src="/app/assets/claude-logo.svg" alt="">
        <span>Build this design for me in my codebase</span>
        ${ARROW_SVG}
      </div>
      <div class="building" aria-hidden="true">
        <span class="dots"><i></i><i></i><i></i></span>
        Your agent is building…
      </div>
    </div>
    <div class="copy">
      <h3>Works with<br>your agent.</h3>
      <p>When you’re done designing, just ask your agent to build it. Linen generates clean, production-ready code that matches your design, so you can go from concept to live without leaving the canvas.</p>
    </div>
  </div>

  <div class="row brand">
    <div class="copy">
      <h3>Works with<br>your brand.</h3>
      <p>Upload screenshots of what you already have and Linen learns your design. New features come out looking like they’ve always been there: the same components, interactions and data visuals.</p>
    </div>
    <div class="art">
      <img class="collage" src="/landing/assets/team/brand-shapes.webp" alt="" width="944" height="831" loading="lazy" decoding="async">
      <diffui-landing-brand-demo plain></diffui-landing-brand-demo>
    </div>
  </div>
`;

export class DiffuiLandingTeamAgent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(template.content.cloneNode(true));
  }

  // The demos inside style themselves by the landing theme.
  connectedCallback() {
    this._disconnectTheme ||= connectLandingTheme(this);
  }

  disconnectedCallback() {
    this._disconnectTheme?.();
    this._disconnectTheme = null;
  }
}

if (!customElements.get("diffui-landing-team-agent")) customElements.define("diffui-landing-team-agent", DiffuiLandingTeamAgent);
