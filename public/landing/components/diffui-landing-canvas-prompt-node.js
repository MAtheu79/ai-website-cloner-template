import "./diffui-landing-canvas-image-stack.js";
import { VisibleActivity } from "./visible-activity.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      will-change: transform;
      --node-stage-width: 280px;
      --node-stage-height: 158px;
      --node-header-height: 28px;
      --node-input-gap: 8px;
      --node-output-gap: 8px;
      pointer-events: none;
    }

    .promptBox {
      position: relative;
      display: grid;
      grid-template-columns: var(--node-stage-width, 1fr);
      grid-template-rows: var(--node-stage-height, 1fr);
      box-sizing: border-box;
    }

    .promptBox[data-selected="true"] .nodeHeader {
      border-color: rgba(255,255,255,0.22);
      background: linear-gradient(90deg, rgba(255, 106, 0, 0.20) 0%, rgba(255, 204, 0, 0.20) 100%) var(--bg, #0b0d10);
      box-shadow: 1px 1px 0 0 rgba(255, 106, 0, 0.30), 0 4px 4px 0 rgba(0, 0, 0, 0.25);
    }

    .nodeHeader {
      position: absolute;
      left: 0;
      bottom: calc(100% + 6px);
      display: flex;
      align-items: center;
      min-width: 0;
      width: var(--node-stage-width, 100%);
      height: var(--node-header-height, 16px);
      border: 1px solid transparent;
      border-radius: var(--radius-sm, 4px) var(--radius-sm, 4px) 0 0;
      background: transparent;
      box-sizing: border-box;
      transition: background 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
    }

    .nodeTitle {
      flex: 1;
      min-width: 0;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0 14px;
      color: rgba(255,255,255,0.86);
      font-size: 13px;
      line-height: 1;
      font-family: var(--font, system-ui, sans-serif);
    }

    :host([data-theme="light"]) .nodeTitle {
      color: #1a1c1e;
    }

    /* The editor's selected-node actions: delete, duplicate, more. */
    .nodeHeaderActions {
      display: none;
      align-items: center;
      gap: 2px;
      padding-right: 4px;
      color: rgba(255,255,255,0.72);
    }

    :host([data-theme="light"]) .nodeHeaderActions {
      color: rgba(26,28,30,0.72);
    }

    .promptBox[data-selected="true"] .nodeHeaderActions {
      display: flex;
    }

    .nodeHeaderActions span {
      width: 22px;
      height: 22px;
      display: inline-grid;
      place-items: center;
    }

    .nodeHeaderActions svg {
      width: 14px;
      height: 14px;
    }

    /* A section hangs under the design it continues: no header of its own,
       and gold rails down its sides while it is selected. */
    .promptBox[data-section="true"] .nodeHeader {
      display: none;
    }

    .promptBox[data-section="true"][data-selected="true"] .nodeStage::after {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: -3px;
      right: -3px;
      border-left: 2px solid #d4a640;
      border-right: 2px solid #d4a640;
      pointer-events: none;
      z-index: 9;
    }

    :host([data-theme="light"]) .promptBox[data-section="true"][data-selected="true"] .nodeStage::after {
      border-color: #b1852f;
    }

    /* The editor's add-section pill: hangs under the last section of a design. */
    .sectionHandle {
      position: absolute;
      left: 50%;
      top: calc(100% + 8px);
      display: none;
      transform: translateX(-50%);
      z-index: 12;
    }

    .promptBox[data-section-handle="true"] .sectionHandle {
      display: block;
    }

    .sectionHandleButton {
      width: 60px;
      height: 11px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(255,255,255,0.22);
      border-radius: 999px;
      background: rgba(7,9,12,0.78);
      color: rgba(255,255,255,0.72);
      box-sizing: border-box;
      transition: border-color 160ms ease, background 160ms ease, color 160ms ease;
    }

    :host([data-theme="light"]) .sectionHandleButton {
      border-color: rgba(0,0,0,0.12);
      background: #eceef1;
      color: rgba(80,85,95,0.7);
    }

    .sectionHandleButton svg {
      width: 7px;
      height: 7px;
    }

    .sectionHandleLabel {
      position: absolute;
      top: 17px;
      left: 50%;
      transform: translateX(-50%);
      white-space: nowrap;
      color: rgba(255,255,255,0.62);
      font: 12px/1.3 var(--font, system-ui, sans-serif);
      opacity: 0;
      transition: opacity 120ms ease;
    }

    :host([data-theme="light"]) .sectionHandleLabel {
      color: rgba(26,28,30,0.62);
    }

    .promptBox[data-section-handle-hot="true"] .sectionHandleButton {
      border-color: #d4a640;
      background: #d4a640;
      color: #1a1c1e;
    }

    .promptBox[data-section-handle-hot="true"] .sectionHandleLabel {
      opacity: 1;
    }

    .promptEditor:has(.promptSuggestions[data-visible="true"]) textarea {
      bottom: 70px;
    }

    .promptSuggestions {
      position: absolute;
      left: 10px;
      right: 10px;
      bottom: 38px;
      display: none;
      justify-content: center;
      flex-wrap: wrap;
      gap: 6px;
      pointer-events: none;
    }

    .promptSuggestions[data-visible="true"] {
      display: flex;
    }

    .promptSuggestion {
      padding: 4px 9px;
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 999px;
      color: rgba(255,255,255,0.62);
      font-size: 11px;
      line-height: 1.2;
      white-space: nowrap;
      transition: border-color 160ms ease, color 160ms ease, background 160ms ease;
    }

    :host([data-theme="light"]) .promptSuggestion {
      border-color: rgba(26,28,30,0.14);
      color: rgba(26,28,30,0.62);
    }

    .promptSuggestion[data-active="true"] {
      border-color: #d4a640;
      color: #d4a640;
      background: rgba(212,166,64,0.1);
    }

    :host([data-theme="light"]) .promptSuggestion[data-active="true"] {
      border-color: #b1852f;
      color: #8a6526;
      background: rgba(177,133,47,0.1);
    }

    :host([data-theme="light"]) .promptBox[data-selected="true"] .nodeHeader {
      border-color: rgba(173, 120, 0, 0.40);
      background: linear-gradient(90deg, rgba(204, 154, 19, 0.55) 0%, rgba(232, 197, 107, 0.49) 100%) var(--bg, #f8f6f2);
      box-shadow: 1px 1px 0 0 rgba(255, 189, 240, 0.47), 0 4px 4px 0 rgb(82 56 0 / 19%);
    }

    :host([data-theme="light"]) .promptBox[data-selected="true"] .nodeTitle {
      color: #1a1c1e;
      text-shadow: -1px -1px 0 rgba(255, 255, 255, 0.25);
    }

    .nodeInput {
      position: absolute;
      top: 0;
      right: calc(100% + var(--node-input-gap, 0px));
      height: var(--node-stage-height, 100%);
      width: var(--node-input-width, 0px);
      border: 1px solid transparent;
      border-radius: var(--radius-sm, 4px) 0 0 var(--radius-sm, 4px);
      background: transparent;
      box-sizing: border-box;
      opacity: 0;
      transition: opacity 160ms ease;
    }

    .promptBox[data-input-visible="true"] .nodeInput {
      opacity: 1;
      width: 11px;
    }

    .nodeInputHandle,
    .nodeOutputHandle {
      position: absolute;
      display: grid;
      place-items: center;
      border: 1px solid rgba(255,255,255,0.22);
      background: rgba(7,9,12,0.78);
      color: rgba(255,255,255,0.72);
      box-sizing: border-box;
      opacity: 0;
      transition: opacity 120ms ease, border-color 160ms ease, background 160ms ease;
    }

    .nodeInputHandle {
      left: -8px;
      top: 50%;
      width: 11px;
      height: 60px;
      border-radius: 999px;
      transform: translateY(-50%);
    }

    .nodeOutput {
      position: absolute;
      top: 0;
      left: 100%;
      height: var(--node-stage-height, 100%);
      width: 0;
    }

    .nodeOutputHandle {
      position: absolute;
      left: var(--node-output-gap, 8px);
      top: 50%;
      width: 11px;
      height: 60px;
      border-radius: 999px;
      transform: translateY(-50%);
    }

    .promptBox[data-input-visible="true"] .nodeInputHandle,
    .promptBox[data-output-visible="true"] .nodeOutputHandle {
      opacity: 1;
    }

    .nodeInputHandle svg,
    .nodeOutputHandle svg {
      width: 5px;
      height: 7px;
      transform: translateX(1px);
    }

    .nodeInputHandle path,
    .nodeOutputHandle path {
      stroke: currentColor;
    }

    :host([data-theme="light"]) .nodeInputHandle,
    :host([data-theme="light"]) .nodeOutputHandle {
      border-color: rgba(0, 0, 0, 0.08);
      background: #eceef1;
      color: rgba(80, 85, 95, 0.5);
    }

    .nodeStage {
      box-shadow: var(--node-emission-shadow, none);
      grid-column: 1;
      grid-row: 1;
      position: relative;
      width: var(--node-stage-width, 100%);
      height: var(--node-stage-height, 100%);
      min-width: 0;
      min-height: 0;
      overflow: visible;
      border-radius: var(--radius-sm, 4px);
    }

    .promptEditor {
      position: absolute;
      inset: 0;
      border: 1px solid rgba(212,166,64,0.55);
      border-radius: var(--radius-sm, 4px);
      background: rgba(12,15,20,0.88);
      box-sizing: border-box;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04);
    }

    .promptEditor[hidden] {
      display: none;
    }

    :host([data-theme="light"]) .promptEditor {
      background: rgba(255, 255, 255, 0.94);
      border-color: rgba(180, 130, 40, 0.45);
    }

    textarea {
      position: absolute;
      top: 10px;
      right: 10px;
      bottom: 42px;
      left: 10px;
      width: auto;
      height: auto;
      box-sizing: border-box;
      resize: none;
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: var(--radius-m, 8px);
      outline: 0;
      background: rgba(12,15,20,0.88);
      color: var(--text, #e8eaed);
      font: inherit;
      font-size: 13px;
      line-height: 1.35;
      padding: 10px;
    }

    :host([data-theme="light"]) textarea {
      background: rgba(248, 249, 251, 0.96);
      color: #14161c;
      border-color: rgba(0, 0, 0, 0.1);
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

    .promptBrandControl {
      position: relative;
      display: none;
      min-width: 60px;
      margin-right: auto;
      font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
      font-size: 10px;
      color: var(--muted, #9aa6b2);
      z-index: 8;
    }

    .promptBrandControl[data-visible="true"] {
      display: block;
    }

    .promptBrandButton {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      min-width: 60px;
      max-width: 190px;
      height: 26px;
      padding: 0 8px;
      border: 0;
      border-radius: var(--radius-sm, 4px);
      background: transparent;
      color: var(--muted, #9aa6b2);
      font: inherit;
      font-family: inherit;
      font-size: 10px;
      cursor: pointer;
    }

    .promptBrandButton:hover,
    .promptBrandControl[data-open="true"] .promptBrandButton {
      background: rgba(255,255,255,0.045);
      color: #d4a640;
    }

    :host([data-theme="light"]) .promptBrandButton:hover,
    :host([data-theme="light"]) .promptBrandControl[data-open="true"] .promptBrandButton {
      background: rgba(26,28,30,0.05);
      color: #9b7130;
    }

    .promptBrandLogo {
      width: 22px;
      height: 22px;
      flex: 0 0 22px;
      display: grid;
      place-items: center;
      border-radius: var(--radius-sm, 4px);
      background: rgba(255,255,255,0.04);
      color: rgba(255,255,255,0.42);
      overflow: hidden;
      font-size: 10px;
      line-height: 1;
    }

    :host([data-theme="light"]) .promptBrandLogo {
      background: rgba(26,28,30,0.05);
      color: rgba(26,28,30,0.4);
    }

    .promptBrandLogo img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
    }

    .promptBrandLogo[data-empty="true"] {
      display: none;
    }

    .promptBrandName {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: left;
    }

    .promptBrandMenu {
      position: absolute;
      left: 0;
      bottom: calc(100% + 5px);
      z-index: 20;
      width: 250px;
      padding: 10px 0;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: var(--radius-m, 8px);
      background: rgba(13,15,19,0.96);
      box-shadow: 0 16px 42px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.04);
    }

    :host([data-theme="light"]) .promptBrandMenu {
      border-color: rgba(26,28,30,0.12);
      background: rgba(255,255,255,0.98);
      box-shadow: 0 16px 42px rgba(40,30,10,0.14);
    }

    .promptBrandMenu[hidden] {
      display: none;
    }

    .promptBrandOption {
      display: grid;
      grid-template-columns: 22px minmax(0, 1fr) 14px;
      align-items: center;
      gap: 9px;
      width: 100%;
      height: 34px;
      padding: 0 12px;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: rgba(255,255,255,0.78);
      font: inherit;
      font-size: 11px;
      text-align: left;
      cursor: pointer;
    }

    :host([data-theme="light"]) .promptBrandOption {
      color: rgba(26,28,30,0.78);
    }

    .promptBrandOption[data-has-logo="false"] {
      grid-template-columns: minmax(0, 1fr) 14px;
    }

    .promptBrandOption:hover,
    .promptBrandOption[data-selected="true"] {
      color: #d4a640;
      background: rgba(212,166,64,0.08);
    }

    :host([data-theme="light"]) .promptBrandOption:hover,
    :host([data-theme="light"]) .promptBrandOption[data-selected="true"] {
      color: #9b7130;
      background: rgba(155,113,48,0.1);
    }

    .promptBrandOption[data-selected="true"] {
      background: rgba(212,166,64,0.12);
    }

    .promptBrandOption .promptResolutionName {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .promptBrandOption .promptResolutionMark {
      justify-self: end;
      display: flex;
      align-items: center;
      opacity: 1;
    }

    .promptBrandOption:not([data-selected="true"]) .promptResolutionMark {
      opacity: 0;
    }

    .promptBox[data-click-prompt-state="typing"] textarea {
      display: block;
      bottom: 10px;
    }

    .promptBox[data-click-prompt-state="typing"] .promptActions {
      display: none;
    }

    .generateWrap {
      position: relative;
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      z-index: 6;
    }

    .plungerSlide {
      position: relative;
      display: inline-flex;
      align-items: center;
      will-change: transform;
    }

    .generateBtn {
      position: relative;
      z-index: 2;
      height: 26px;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: var(--radius-sm, 4px);
      background: linear-gradient(rgba(255,255,255,0.045), rgba(255,255,255,0.045)) var(--bg, #0b0d10);
      color: var(--text, #e8eaed);
      /* 6px + 1px bar + 2px gap + 1px bar + 6px before label */
      padding: 0 9px 0 16px;
      font-size: 12px;
      font-weight: 800;
      white-space: nowrap;
      box-shadow: 0 3px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05);
      font-family: var(--font, system-ui, sans-serif);
    }

    .generateBtn::before,
    .generateBtn::after {
      content: "";
      position: absolute;
      top: 50%;
      width: 1px;
      height: 10px;
      margin-top: -5px;
      border-radius: 999px;
      background: rgba(255,255,255,0.12);
      pointer-events: none;
    }

    .generateBtn::before {
      left: 6px;
    }

    .generateBtn::after {
      left: 9px;
    }

    .generateWrap[data-plunging="true"] .generateBtn {
      border-color: rgba(212,166,64,0.55);
      background: linear-gradient(rgba(212,166,64,0.18), rgba(212,166,64,0.18)) var(--bg, #0b0d10);
      color: #fff;
      cursor: grabbing;
    }

    .generateWrap[data-plunging="true"] .generateBtn::before,
    .generateWrap[data-plunging="true"] .generateBtn::after {
      background: rgba(255, 204, 80, 0.95);
      box-shadow: 0 0 6px rgba(255,170,40,0.45);
    }

    .plungerBars {
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: 4px;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 4px;
      height: 22px;
      pointer-events: none;
    }

    .plungerBar {
      width: 4px;
      height: 22px;
      border-radius: 999px;
      background: linear-gradient(180deg, #ffcc00, #ff8a00);
      box-shadow: 0 0 8px rgba(255,170,40,0.45);
      transform: scaleY(0);
      transform-origin: center center;
      transition: transform 140ms cubic-bezier(.34, 1.56, .64, 1);
    }

    .plungerBar[data-grown="true"] {
      transform: scaleY(1);
    }

    diffui-landing-canvas-image-stack {
      position: absolute;
      inset: 0;
      display: none;
      pointer-events: auto;
    }

    diffui-landing-canvas-image-stack[data-visible="true"] {
      display: block;
    }

    .nodeLoading {
      position: absolute;
      inset: 0;
      z-index: 8;
      display: grid;
      place-items: center;
      border-radius: var(--radius-sm, 4px);
      color: rgba(255,255,255,0.58);
      font-size: 12px;
      background: rgba(12,15,20,0.72);
      font-family: var(--font, system-ui, sans-serif);
    }

    .nodeLoading[hidden] {
      display: none;
    }

    :host([data-theme="light"]) .nodeLoading {
      color: rgba(20, 22, 28, 0.58);
      background: rgba(255, 255, 255, 0.82);
    }

    .promptBox[data-generating="true"] .generateBtn {
      border-color: rgba(212,166,64,0.55);
      background: linear-gradient(rgba(212,166,64,0.18), rgba(212,166,64,0.18)) var(--bg, #0b0d10);
      color: #fff;
    }

    :host([data-theme="light"]) .promptBox[data-generating="true"] .generateBtn {
      color: #a8aeb8;
    }

    :host([data-theme="light"]) .generateWrap[data-plunging="true"] .generateBtn {
      border-color: rgba(173, 120, 0, 0.55);
      background: linear-gradient(90deg, rgba(204, 154, 19, 0.65) 0%, rgba(232, 197, 107, 0.58) 100%) var(--bg, #f8f6f2);
      color: #1a1c1e;
      text-shadow: -1px -1px 0 rgba(255, 255, 255, 0.25);
    }
  </style>
  <div class="promptBox" id="box" data-selected="false" data-has-image="false" data-generating="false" data-output-visible="false" data-input-visible="false">
    <div class="nodeHeader">
      <div class="nodeTitle" id="title">Prompt</div>
      <div class="nodeHeaderActions" aria-hidden="true">
        <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></span>
        <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span>
        <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/><circle cx="5" cy="12" r="1" fill="currentColor"/></svg></span>
      </div>
    </div>
    <div class="nodeInput">
      <div class="nodeInputHandle" id="inputHandle" aria-hidden="true">
        <svg width="5" height="7" viewBox="0 0 5 7" fill="none" aria-hidden="true">
          <path d="M0.353554 0.353516L3.35355 3.35352L0.353554 6.35352" stroke="currentColor"></path>
        </svg>
      </div>
    </div>
    <div class="nodeStage">
      <div class="promptEditor" id="editor">
        <textarea id="textarea" readonly aria-label="Prompt"></textarea>
        <div class="promptSuggestions" id="suggestions" aria-hidden="true"></div>
        <div class="promptActions">
          <div class="promptBrandControl" id="brandControl" data-visible="false" data-open="false">
            <button class="promptBrandButton" id="brandButton" type="button" tabindex="-1" aria-label="Brand" aria-haspopup="listbox" aria-expanded="false">
              <span class="promptBrandLogo" id="brandLogo" data-empty="true"></span>
              <span class="promptBrandName" id="brandName">No brand</span>
            </button>
            <div class="promptBrandMenu" id="brandMenu" role="listbox" hidden></div>
          </div>
          <div class="generateWrap" id="generateWrap">
            <div class="plungerSlide" id="plungerSlide">
              <button class="generateBtn" id="generateBtn" type="button" tabindex="-1">Generate</button>
              <div class="plungerBars" id="plungerBars"></div>
            </div>
          </div>
        </div>
      </div>
      <diffui-landing-canvas-image-stack id="imageStack"></diffui-landing-canvas-image-stack>
      <div class="nodeLoading" id="loading" hidden>Generating...</div>
      <div class="sectionHandle" aria-hidden="true">
        <div class="sectionHandleButton" id="sectionHandle">
          <svg viewBox="0 0 8 8" fill="none"><path d="M4 0.5v7M0.5 4h7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
        </div>
        <span class="sectionHandleLabel">Add section</span>
      </div>
    </div>
    <div class="nodeOutput">
      <div class="nodeOutputHandle" id="outputHandle" aria-hidden="true">
        <svg width="5" height="7" viewBox="0 0 5 7" fill="none" aria-hidden="true">
          <path d="M0.353554 0.353516L3.35355 3.35352L0.353554 6.35352" stroke="currentColor"></path>
        </svg>
      </div>
    </div>
  </div>
`;

export class DiffuiLandingCanvasPromptNode extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._box = this.shadowRoot.getElementById("box");
    this._title = this.shadowRoot.getElementById("title");
    this._editor = this.shadowRoot.getElementById("editor");
    this._textarea = this.shadowRoot.getElementById("textarea");
    this._generateWrap = this.shadowRoot.getElementById("generateWrap");
    this._generateBtn = this.shadowRoot.getElementById("generateBtn");
    this._plungerSlide = this.shadowRoot.getElementById("plungerSlide");
    this._plungerBars = this.shadowRoot.getElementById("plungerBars");
    this._brandControl = this.shadowRoot.getElementById("brandControl");
    this._brandButton = this.shadowRoot.getElementById("brandButton");
    this._brandLogo = this.shadowRoot.getElementById("brandLogo");
    this._brandName = this.shadowRoot.getElementById("brandName");
    this._brandMenu = this.shadowRoot.getElementById("brandMenu");
    this._imageStack = this.shadowRoot.getElementById("imageStack");
    this._loading = this.shadowRoot.getElementById("loading");
    this._outputHandle = this.shadowRoot.getElementById("outputHandle");
    this._inputHandle = this.shadowRoot.getElementById("inputHandle");
    this._suggestions = this.shadowRoot.getElementById("suggestions");
    this._sectionHandle = this.shadowRoot.getElementById("sectionHandle");
    this._genTimers = [];
    this._typeTimer = 0;
    this._brands = [];
    this._selectedBrandId = "";
    this._activity = new VisibleActivity(this);
  }

  disconnectedCallback() {
    this._activity.disconnect();
  }

  connectedCallback() {
    this._activity.connect();
    this._syncChildTheme();
  }

  attributeChangedCallback(name) {
    if (name === "data-theme") this._syncChildTheme();
  }

  static get observedAttributes() {
    return ["data-theme"];
  }

  _syncChildTheme() {
    const theme = this.getAttribute("data-theme");
    if (theme && this._imageStack) this._imageStack.setAttribute("data-theme", theme);
  }

  set title(value) {
    if (this._title) this._title.textContent = value || "Prompt";
  }

  setSelected(selected) {
    const next = selected ? "true" : "false";
    if (!this._box || this._box.dataset.selected === next) return;
    this._box.dataset.selected = next;
    // The canvas docks the lone selected node's option thumbnails.
    this.dispatchEvent(new CustomEvent("landing-node-select", { bubbles: true, composed: true }));
  }

  get selected() {
    return this._box?.dataset.selected === "true";
  }

  /** Show this node as a section continuing the design above it. */
  setSection(section, placeholder = "Describe the next section of this page...") {
    if (!this._box) return;
    this._box.dataset.section = section ? "true" : "false";
    if (this._textarea) this._textarea.placeholder = section ? placeholder : "";
  }

  /** The add-section pill under this design; `hot` is its hover state. */
  setSectionHandle(visible, hot = false) {
    if (!this._box) return;
    this._box.dataset.sectionHandle = visible ? "true" : "false";
    this._box.dataset.sectionHandleHot = visible && hot ? "true" : "false";
  }

  /** The suggestion chips the editor offers under an empty prompt. */
  setSuggestions(labels = []) {
    if (!this._suggestions) return;
    this._suggestions.replaceChildren(...labels.map((label) => {
      const chip = document.createElement("span");
      chip.className = "promptSuggestion";
      chip.textContent = label;
      return chip;
    }));
    this._suggestions.dataset.visible = labels.length ? "true" : "false";
  }

  /** Highlight one suggestion chip, as a hover or click would. */
  setActiveSuggestion(index) {
    [...(this._suggestions?.children || [])].forEach((chip, i) => {
      chip.dataset.active = i === index ? "true" : "false";
    });
  }

  setInputVisible(visible) {
    if (this._box) this._box.dataset.inputVisible = visible ? "true" : "false";
  }

  setOutputVisible(visible) {
    if (this._box) this._box.dataset.outputVisible = visible ? "true" : "false";
  }

  setPrompt(text) {
    if (this._textarea) this._textarea.value = text || "";
  }

  setBrandPickerVisible(visible) {
    if (!this._brandControl) return;
    this._brandControl.dataset.visible = visible ? "true" : "false";
    if (!visible) this.closeBrandMenu();
  }

  setBrandOptions(brands) {
    this._brands = Array.isArray(brands) ? brands : [];
    this._rebuildBrandMenu();
    this._syncBrandButton();
  }

  setSelectedBrand(id) {
    this._selectedBrandId = String(id || "");
    this._syncBrandButton();
    this._syncBrandMenuSelection();
  }

  openBrandMenu() {
    if (!this._brandControl || this._brandControl.dataset.visible !== "true") return;
    this._brandControl.dataset.open = "true";
    if (this._brandButton) this._brandButton.setAttribute("aria-expanded", "true");
    if (this._brandMenu) this._brandMenu.hidden = false;
  }

  closeBrandMenu() {
    if (!this._brandControl) return;
    this._brandControl.dataset.open = "false";
    if (this._brandButton) this._brandButton.setAttribute("aria-expanded", "false");
    if (this._brandMenu) this._brandMenu.hidden = true;
  }

  _rebuildBrandMenu() {
    if (!this._brandMenu) return;
    this._brandMenu.replaceChildren();
    const options = [{ id: "", name: "No brand", logoUrl: "" }, ...this._brands];
    for (const brand of options) {
      const id = String(brand.id || "");
      const label = String(brand.name || "Brand").trim() || "Brand";
      const logoUrl = String(brand.logoUrl || brand.logo_url || "");
      const option = document.createElement("button");
      option.type = "button";
      option.className = "promptBrandOption";
      option.dataset.value = id;
      option.dataset.hasLogo = logoUrl ? "true" : "false";
      option.setAttribute("role", "option");
      option.tabIndex = -1;
      const logo = document.createElement("span");
      logo.className = "promptBrandLogo";
      this._patchBrandLogo(logo, logoUrl);
      const name = document.createElement("span");
      name.className = "promptResolutionName";
      name.textContent = label;
      const mark = document.createElement("span");
      mark.className = "promptResolutionMark";
      mark.innerHTML = '<svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true"><path d="M0.353553 3.35355L2.85355 5.85355L8.35355 0.353546" stroke="currentColor"/></svg>';
      if (logoUrl) option.append(logo, name, mark);
      else option.append(name, mark);
      this._brandMenu.appendChild(option);
    }
    this._syncBrandMenuSelection();
  }

  _patchBrandLogo(container, logoUrl) {
    if (!container) return;
    const url = String(logoUrl || "").trim();
    if (!url) {
      container.dataset.empty = "true";
      container.replaceChildren();
      return;
    }
    container.dataset.empty = "false";
    let img = container.querySelector("img");
    if (!img) {
      container.replaceChildren();
      img = document.createElement("img");
      img.alt = "";
      container.appendChild(img);
    }
    if (img.getAttribute("src") !== url) img.src = url;
  }

  _syncBrandButton() {
    const selected = this._brands.find((brand) => String(brand.id || "") === this._selectedBrandId) || null;
    const label = selected ? String(selected.name || "Brand").trim() || "Brand" : "No brand";
    const logoUrl = selected ? String(selected.logoUrl || selected.logo_url || "") : "";
    if (this._brandName) this._brandName.textContent = label;
    this._patchBrandLogo(this._brandLogo, logoUrl);
  }

  _syncBrandMenuSelection() {
    this._brandMenu?.querySelectorAll(".promptBrandOption").forEach((option) => {
      const selected = (option.dataset.value || "") === this._selectedBrandId;
      option.dataset.selected = selected ? "true" : "false";
      option.setAttribute("aria-selected", selected ? "true" : "false");
    });
  }

  setClickPromptState(state) {
    if (!this._box) return;
    const next = String(state || "");
    if (next) this._box.dataset.clickPromptState = next;
    else delete this._box.dataset.clickPromptState;

    if (next === "detecting") {
      if (this._editor) this._editor.hidden = true;
      if (this._imageStack) this._imageStack.dataset.visible = "false";
      if (this._loading) {
        this._loading.textContent = "Thinking...";
        this._loading.hidden = false;
      }
      this._box.dataset.hasImage = "false";
      this._box.dataset.generating = "false";
      return;
    }

    if (this._editor) this._editor.hidden = false;
    if (this._imageStack) this._imageStack.dataset.visible = "false";
    if (this._loading) this._loading.hidden = true;
    this._box.dataset.hasImage = "false";
    this._box.dataset.generating = "false";
  }

  typePrompt(text, cps = 28) {
    return new Promise((resolve) => {
      if (!this._textarea) {
        resolve();
        return;
      }
      this._textarea.value = "";
      if (this._suggestions) this._suggestions.dataset.visible = "false";
      const chars = String(text || "");
      let i = 0;
      const step = () => {
        if (i >= chars.length) {
          resolve();
          return;
        }
        this._textarea.value += chars[i];
        i += 1;
        this._typeTimer = this._activity.setTimeout(step, 1000 / cps);
      };
      step();
    });
  }

  setPlungerCount(count) {
    if (!this._plungerBars || !this._generateBtn) return;
    const n = Math.max(0, Math.min(8, count));
    while (this._plungerBars.children.length > n) {
      this._plungerBars.lastElementChild?.remove();
    }
    while (this._plungerBars.children.length < n) {
      const bar = document.createElement("div");
      bar.className = "plungerBar";
      this._plungerBars.appendChild(bar);
      this._activity.requestAnimationFrame(() => {
        bar.dataset.grown = "true";
      });
    }
    if (n <= 0) {
      this._generateBtn.textContent = "Generate";
      if (this._generateWrap) delete this._generateWrap.dataset.plunging;
    } else {
      this._generateBtn.textContent = `Generate ${n} ${n === 1 ? "design" : "designs"}`;
      if (this._generateWrap) this._generateWrap.dataset.plunging = "true";
    }
  }

  setPlungerPull(px) {
    if (this._plungerSlide) {
      this._plungerSlide.style.transform = px ? `translateX(${-px}px)` : "";
    }
  }

  resetPlunger() {
    this.setPlungerPull(0);
    this.setPlungerCount(0);
  }

  showEditor() {
    if (this._editor) this._editor.hidden = false;
    if (this._imageStack) this._imageStack.dataset.visible = "false";
    if (this._loading) this._loading.hidden = true;
    if (this._box) {
      this._box.dataset.hasImage = "false";
      this._box.dataset.generating = "false";
    }
  }

  showStack() {
    if (this._editor) this._editor.hidden = true;
    if (this._imageStack) this._imageStack.dataset.visible = "true";
    if (this._loading) this._loading.hidden = true;
    if (this._box) {
      this._box.dataset.hasImage = "true";
      this._box.dataset.generating = "false";
    }
  }

  setGenerating(active) {
    if (!this._box) return;
    this._box.dataset.generating = active ? "true" : "false";
    if (active) {
      if (this._editor) this._editor.hidden = false;
      if (this._loading) {
        this._loading.textContent = "Generating...";
        this._loading.hidden = false;
      }
      if (this._imageStack) this._imageStack.dataset.visible = "true";
      if (this._box) this._box.dataset.hasImage = "false";
    }
  }

  startGeneration(count, imageUrls, {
    partialMs = 3000,
    partialStagger = 420,
    finalDelayAfterPartial = 2000,
    finalStagger = 300,
    jitterPartial = 0,
    jitterFinal = 0,
    partialUrls = null,
  } = {}) {
    this.setGenerating(true);
    this._clearGenTimers();
    this._imageStack?.startGeneration(count, imageUrls);

    let partialCount = 0;
    let finalCount = 0;
    const partials = Array.isArray(partialUrls) ? partialUrls : imageUrls;

    for (let i = 0; i < count; i += 1) {
      const url = imageUrls[i] || "";
      const partialUrl = partials[i] || url;
      const pDelay = partialMs + i * partialStagger + (jitterPartial ? Math.random() * jitterPartial : 0);
      const fDelay =
        pDelay +
        finalDelayAfterPartial +
        i * finalStagger +
        (jitterFinal ? Math.random() * jitterFinal : 0);

      this._genTimers.push(
        this._activity.setTimeout(() => {
          this._imageStack?.revealPartial(i, partialUrl);
          partialCount += 1;
          if (partialCount === 1) {
            if (this._loading) this._loading.hidden = true;
            if (this._editor) this._editor.hidden = true;
            if (this._box) this._box.dataset.hasImage = "true";
          }
        }, pDelay),
      );
      this._genTimers.push(
        this._activity.setTimeout(() => {
          this._imageStack?.revealFinal(i, url);
          finalCount += 1;
          if (finalCount >= count) {
            this.setGenerating(false);
          }
        }, fDelay),
      );
    }
  }

  selectStackIndex(index) {
    this._imageStack?.selectIndex(index);
  }

  get imageStack() {
    return this._imageStack;
  }

  getAnchor(name) {
    const map = {
      generate: this._generateBtn,
      output: this._outputHandle,
      input: this._inputHandle,
      brand: this._brandButton,
      "section-add": this._sectionHandle,
    };
    if (name.startsWith("brand-option-")) {
      const value = name.slice("brand-option-".length);
      return this._brandMenu?.querySelector(`.promptBrandOption[data-value="${CSS.escape(value)}"]`) || null;
    }
    if (name.startsWith("suggestion-")) {
      return this._suggestions?.children[Number(name.slice("suggestion-".length))] || null;
    }
    if (name.startsWith("dot-")) {
      const idx = Number(name.slice(4));
      return this._imageStack?.getDotElement(idx);
    }
    return map[name] || null;
  }

  /** Returns center point relative to a container element. */
  getAnchorPoint(name, container) {
    const el = this.getAnchor(name);
    if (!el || !container) return null;
    const er = el.getBoundingClientRect();
    const cr = container.getBoundingClientRect();
    return {
      x: er.left + er.width / 2 - cr.left,
      y: er.top + er.height / 2 - cr.top,
    };
  }

  _clearGenTimers() {
    this._genTimers.forEach((t) => this._activity.clearTimeout(t));
    this._genTimers = [];
  }
}

if (!customElements.get("diffui-landing-canvas-prompt-node")) {
  customElements.define("diffui-landing-canvas-prompt-node", DiffuiLandingCanvasPromptNode);
}
