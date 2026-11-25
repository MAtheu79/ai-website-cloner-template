const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      --modal-width: min(640px, calc(100vw - 40px));
      --modal-padding: calc(var(--grid, 8px) * 3);
      --modal-overlay: rgba(0, 0, 0, 0.6);
      position: fixed;
      inset: 0;
      display: none;
      place-items: center;
      background: var(--modal-overlay);
      z-index: 50;
    }
    :host([data-open="true"]) {
      display: grid;
    }
    .modalCard {
      width: min(var(--modal-width), calc(100vw - 40px));
      border: 1px solid var(--border2);
      border-radius: var(--radius-m, 8px);
      background: var(--panel);
      padding: var(--modal-padding);
      display: grid;
      gap: calc(var(--grid, 8px) * 3);
      box-shadow: var(--modal-shadow, none);
    }
    slot {
      display: contents;
    }
  </style>
  <div class="modalCard">
    <slot></slot>
  </div>
`;

export class DiffuiModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._handleClick = (event) => {
      const path = event.composedPath();
      const clickedCard = path.some((node) => node?.classList?.contains("modalCard"));
      if (!clickedCard) {
        this.dispatchEvent(new CustomEvent("modal-overlay-click", { bubbles: true, composed: true }));
      }
    };
  }

  connectedCallback() {
    this.addEventListener("click", this._handleClick);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this._handleClick);
  }
}

customElements.define("diffui-modal", DiffuiModal);
