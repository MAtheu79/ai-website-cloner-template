import "../../app/components/diffui-button.js";
import { COLLAB_CURSOR_DISPLAY_SIZE, COLLAB_CURSOR_HOTSPOT } from "../../app/collab/collab-cursor.js";
import { VisibleActivity } from "./visible-activity.js";

// The app's share dialog (diffui-project-share-dialog.js), header and people
// list, with a teammate's multiplayer cursor inviting someone new on a loop:
// Ana clicks the email field, types an address, presses Invite, and the new
// person joins the list. The loop runs only while the demo is on screen.
const ANA_COLOR = "AA5F52";
const PEOPLE = [
  { name: "You", detail: "you@studio.co", owner: true },
  { name: "Jamie Rivera", detail: "jamie@studio.co", level: "Can edit" },
  { name: "Lex Chen", detail: "lex@studio.co", level: "Can view" },
];
const INVITE = { name: "Maya Okafor", detail: "maya@studio.co", level: "Can edit" };

const KEBAB_ICON_SVG = `
  <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
    <circle cx="8" cy="3.5" r="1.1"/><circle cx="8" cy="8" r="1.1"/><circle cx="8" cy="12.5" r="1.1"/>
  </svg>`;

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      --sd-surface: light-dark(#ffffff, #15181b);
      --sd-soft: light-dark(#f7f6f3, #1c2024);
      --sd-border: light-dark(rgba(20, 22, 26, 0.08), rgba(255, 255, 255, 0.08));
      --sd-border2: light-dark(rgba(20, 22, 26, 0.14), rgba(255, 255, 255, 0.14));
      display: block;
      position: relative;
      pointer-events: none;
      user-select: none;
    }
    .dialog {
      border-radius: 10px;
      background: var(--sd-surface);
      box-shadow: 0 18px 50px rgba(20, 16, 8, 0.18), 0 2px 8px rgba(20, 16, 8, 0.08);
      color: var(--text);
      font-family: var(--font, system-ui, sans-serif);
      overflow: hidden;
    }
    .section { padding: 18px 20px; }
    .peopleHeader {
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      margin-bottom: 10px;
    }
    .sectionLabel { margin: 0; font-size: 13px; font-weight: 600; }
    .peopleCount { font-size: 12px; color: var(--muted); }
    .peopleList {
      margin: 0; padding: 0; list-style: none;
      border: 1px solid var(--sd-border2);
      border-radius: 4px;
      overflow: hidden;
    }
    .peopleRow {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-bottom: 1px solid var(--sd-border);
    }
    .peopleRow:last-child { border-bottom: 0; }
    .peopleRow[data-new] { animation: rowIn 420ms cubic-bezier(.2, .8, .2, 1) both; }
    .peopleRow[data-leaving] { transition: opacity 300ms ease; opacity: 0; }
    @keyframes rowIn {
      from { opacity: 0; transform: translateY(-6px); background: color-mix(in srgb, var(--gold) 16%, transparent); }
      60% { opacity: 1; transform: none; background: color-mix(in srgb, var(--gold) 12%, transparent); }
      to { background: transparent; }
    }
    .peopleRowMain { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .avatar {
      width: 30px; height: 30px; flex: 0 0 30px;
      border-radius: 999px;
      display: grid; place-items: center;
      background: var(--sd-soft);
      color: var(--muted);
      font-size: 12px; font-weight: 700;
    }
    .personName { font-size: 13px; font-weight: 600; white-space: nowrap; }
    .personEmail { margin-top: 2px; font-size: 12px; color: var(--muted); white-space: nowrap; }
    .ownerBadge { font-size: 12px; color: var(--muted); }
    .rowActions { display: flex; align-items: center; gap: 4px; }
    .accessLevel {
      height: 28px; min-width: 88px; box-sizing: border-box;
      display: inline-flex; align-items: center;
      border: 1px solid var(--sd-border2);
      border-radius: 4px;
      background: var(--sd-soft);
      font-size: 12px;
      padding: 0 24px 0 8px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%238a8f96' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 6px center;
    }
    .kebab { width: 24px; height: 28px; display: inline-grid; place-items: center; color: var(--muted); }
    .kebab svg { width: 14px; height: 14px; }
    .invitePanelRow { display: flex; gap: 8px; margin-top: 12px; }
    .email {
      flex: 1; min-width: 0; height: 34px; box-sizing: border-box;
      display: flex; align-items: center;
      border: 1px solid var(--sd-border2);
      border-radius: 4px;
      background: var(--sd-soft);
      font-size: 13px;
      padding: 0 10px;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
    }
    .email[data-focus] { border-color: var(--gold); }
    .email:empty::before { content: "name@company.com"; color: var(--muted); }
    .email[data-focus]::after {
      content: ""; width: 1px; height: 15px; margin-left: 1px;
      background: var(--text);
      animation: caret 1s steps(1) infinite;
    }
    @keyframes caret { 50% { opacity: 0; } }
    .level {
      height: 34px; box-sizing: border-box;
      display: inline-flex; align-items: center;
      border: 1px solid var(--sd-border2);
      border-radius: 4px;
      background: var(--sd-soft);
      font-size: 12px;
      padding: 0 8px;
    }
    .inviteBtn { --height: 34px; --padding-x: 14px; transition: transform 120ms ease; }
    .inviteBtn[data-pressed] { transform: scale(0.95); }
    .cursor {
      position: absolute;
      left: 0; top: 0;
      width: ${COLLAB_CURSOR_DISPLAY_SIZE}px;
      height: ${COLLAB_CURSOR_DISPLAY_SIZE}px;
      opacity: 0;
      transition: transform 900ms cubic-bezier(.45, .05, .25, 1), opacity 300ms ease;
      will-change: transform;
      z-index: 2;
    }
    .cursor[data-shown] { opacity: 1; }
    .cursor img {
      position: absolute;
      left: ${-COLLAB_CURSOR_HOTSPOT.x}px;
      top: ${-COLLAB_CURSOR_HOTSPOT.y}px;
      width: ${COLLAB_CURSOR_DISPLAY_SIZE}px;
      height: ${COLLAB_CURSOR_DISPLAY_SIZE}px;
    }
    /* The multiplayer name tag (collab-cursor.js drawCollabCursorLabel). */
    .cursor span {
      position: absolute;
      left: 14px; top: 12px;
      height: 16px;
      padding: 0 6px;
      border-radius: 2px;
      background: #${ANA_COLOR};
      box-shadow: 0 2px 2px rgba(0, 0, 0, 0.25);
      color: #fff;
      font: 400 12px/16px "Geist Mono", "JetBrains Mono", monospace;
      white-space: nowrap;
    }
  </style>
  <div class="dialog" aria-hidden="true">
    <section class="section">
      <div class="peopleHeader">
        <h4 class="sectionLabel">People with access</h4>
        <span class="peopleCount"></span>
      </div>
      <ul class="peopleList"></ul>
      <div class="invitePanelRow">
        <div class="email"></div>
        <span class="level">Can edit</span>
        <diffui-button class="inviteBtn" type="button" tabindex="-1">Invite</diffui-button>
      </div>
    </section>
  </div>
  <div class="cursor"><img src="/app/assets/collab-cursors/${ANA_COLOR}.png" alt=""><span>Ana</span></div>
`;

function initials(name) {
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0]).toUpperCase();
}

function personRow(person) {
  const row = document.createElement("li");
  row.className = "peopleRow";
  row.innerHTML = `
    <div class="peopleRowMain">
      <span class="avatar"></span>
      <span><div class="personName"></div><div class="personEmail"></div></span>
    </div>
    ${person.owner ? `<span class="ownerBadge">Owner</span>` : `<div class="rowActions"><span class="accessLevel"></span><span class="kebab">${KEBAB_ICON_SVG}</span></div>`}
  `;
  row.querySelector(".avatar").textContent = initials(person.name);
  row.querySelector(".personName").textContent = person.name;
  row.querySelector(".personEmail").textContent = person.detail;
  const level = row.querySelector(".accessLevel");
  if (level) level.textContent = person.level;
  return row;
}

export class DiffuiLandingShareDemo extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.appendChild(template.content.cloneNode(true));
    this._list = root.querySelector(".peopleList");
    this._count = root.querySelector(".peopleCount");
    this._email = root.querySelector(".email");
    this._invite = root.querySelector(".inviteBtn");
    this._cursor = root.querySelector(".cursor");
    for (const person of PEOPLE) this._list.appendChild(personRow(person));
    this._setCount(PEOPLE.length);
    this._activity = new VisibleActivity(this, () => this._start());
  }

  connectedCallback() {
    this.setAttribute("aria-hidden", "true");
    this._activity.connect();
  }

  disconnectedCallback() {
    this._activity.disconnect();
  }

  _setCount(n) {
    this._count.textContent = `${n} ${n === 1 ? "person" : "people"}`;
  }

  // Move the cursor's hotspot to a point on an element (fractions of its box).
  _moveTo(el, fx = 0.5, fy = 0.5) {
    const host = this.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = r.left - host.left + r.width * fx;
    const y = r.top - host.top + r.height * fy;
    this._cursor.style.transform = `translate(${x}px, ${y}px)`;
  }

  _start() {
    if (this._running) return;
    this._running = true;
    this._loop().finally(() => { this._running = false; });
  }

  async _loop() {
    const wait = (ms) => this._activity.wait(ms);
    const host = this.getBoundingClientRect();
    // Ana arrives from below the dialog.
    this._cursor.style.transition = "none";
    this._cursor.style.transform = `translate(${host.width * 0.82}px, ${host.height + 30}px)`;
    this._cursor.getBoundingClientRect();
    this._cursor.style.transition = "";
    await wait(600);
    this._cursor.toggleAttribute("data-shown", true);
    this._moveTo(this._email, 0.3, 0.55);
    await wait(1100);
    this._email.toggleAttribute("data-focus", true);
    await wait(350);
    for (const ch of INVITE.detail) {
      this._email.textContent += ch;
      await wait(55 + Math.random() * 70);
    }
    await wait(450);
    this._moveTo(this._invite, 0.45, 0.6);
    await wait(1000);
    this._invite.toggleAttribute("data-pressed", true);
    await wait(140);
    this._invite.toggleAttribute("data-pressed", false);
    const row = personRow(INVITE);
    row.toggleAttribute("data-new", true);
    this._list.appendChild(row);
    this._setCount(PEOPLE.length + 1);
    this._email.textContent = "";
    this._email.toggleAttribute("data-focus", false);
    await wait(300);
    this._moveTo(row, 0.62, 0.8);
    await wait(3200);
    this._cursor.toggleAttribute("data-shown", false);
    await wait(900);
    row.toggleAttribute("data-leaving", true);
    await wait(320);
    row.remove();
    this._setCount(PEOPLE.length);
    await wait(1400);
    if (this.isConnected) return this._loop();
  }
}

if (!customElements.get("diffui-landing-share-demo")) customElements.define("diffui-landing-share-demo", DiffuiLandingShareDemo);
