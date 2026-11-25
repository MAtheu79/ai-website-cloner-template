const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 100%;
    }

    .footer {
      width: 100%;
      border-top: 1px solid var(--card-border, rgba(255, 255, 255, 0.13));
      padding: 22px 28px;
      display: grid;
      grid-template-columns: minmax(max-content, 1fr) auto minmax(max-content, 1fr);
      align-items: center;
      gap: 16px 40px;
      color: var(--muted, var(--muted-copy, rgba(230, 237, 243, 0.58)));
      font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
      font-size: 12px;
      box-sizing: border-box;
    }

    .footerBrand {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-self: start;
    }

    .footerBrand img {
      width: 16px;
      height: 16px;
      display: block;
      opacity: 0.85;
    }

    .footerLinks {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px 22px;
    }

    .footerCenter {
      justify-self: center;
    }

    .footerLegal {
      justify-self: end;
    }

    .footerLinks a {
      color: var(--muted, var(--muted-copy, rgba(230, 237, 243, 0.58)));
      text-decoration: none;
      white-space: nowrap;
      transition: color 120ms ease;
    }

    .footerLinks a:hover {
      color: var(--gold, var(--founder-gold, var(--boot-gold, #d4a640)));
    }

    @media (max-width: 1140px) {
      .footer {
        grid-template-columns: 1fr auto;
        row-gap: 14px;
      }

      .footerCenter {
        justify-self: end;
      }

      .footerLegal {
        grid-column: 1 / -1;
        justify-self: start;
      }
    }

    @media (max-width: 560px) {
      .footer {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 28px 24px 32px;
      }

      .footerLinks {
        gap: 14px 22px;
      }

      .footerBrand,
      .footerCenter,
      .footerLegal {
        justify-self: start;
      }
    }
  </style>

  <footer class="footer">
    <div class="footerBrand">
      <img src="/landing/assets/linen-brand-icon.svg" alt="" />
      <span>&copy; ${new Date().getFullYear()} Diffui Inc.</span>
    </div>
    <nav class="footerLinks footerCenter" aria-label="Contact">
      <a href="mailto:j@linen.ai">Contact</a>
      <a href="https://calendar.app.google/RFwkM1NN4u4g1NQ87" target="_blank" rel="noopener noreferrer">Book a demo</a>
      <a href="https://discord.gg/XdXuJSe4Nu" target="_blank" rel="noopener noreferrer">Discord</a>
      <a href="https://x.com/heylinen" target="_blank" rel="noopener noreferrer">X</a>
    </nav>
    <nav class="footerLinks footerLegal" aria-label="Legal">
      <a href="/support">Support</a>
      <a href="/tos">Terms of Service</a>
      <a href="/privacy">Privacy Policy</a>
      <a href="/security">Security</a>
      <a href="/brand">Brand</a>
      <a href="/changelog">Changelog</a>
    </nav>
  </footer>
`;

export class DiffuiLandingFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

if (!customElements.get("diffui-landing-footer")) {
  customElements.define("diffui-landing-footer", DiffuiLandingFooter);
}
