// One review card: a serif quote, then the reviewer's avatar, name, role and
// star rating. Set with the `review` property:
//   { quote, name, role?, rating?, avatar? }
// Without an avatar image the card shows the reviewer's initials.
const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 16px;
      padding: 20px 24px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--surface-highlight, transparent);
      box-sizing: border-box;
    }
    blockquote {
      margin: 0;
      font-family: var(--font-serif);
      font-size: clamp(17px, 1.4vw, 20px);
      line-height: 1.35;
      color: var(--text);
      text-indent: -0.42em;
    }
    blockquote::before { content: "\\201C"; }
    blockquote::after { content: "\\201D"; }
    .who {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar {
      flex: none;
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      background: var(--gold-muted);
      color: var(--landing-bg, #fff);
      font-family: var(--font-serif);
      font-size: 17px;
    }
    .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .name {
      font-size: 15px;
      font-weight: 500;
      color: var(--text);
    }
    .role {
      margin-top: 4px;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .stars {
      margin-top: 10px;
      display: flex;
      gap: 4px;
      color: var(--gold);
    }
    .stars svg { width: 15px; height: 15px; }
    .stars[hidden] { display: none; }
  </style>
  <blockquote></blockquote>
  <div class="who">
    <div class="avatar" aria-hidden="true"></div>
    <div>
      <div class="name"></div>
      <div class="role"></div>
      <div class="stars" hidden role="img"></div>
    </div>
  </div>
`;

const STAR_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>`;

export class DiffuiLandingReview extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(template.content.cloneNode(true));
  }

  set review(review) {
    const root = this.shadowRoot;
    root.querySelector("blockquote").textContent = review.quote;
    root.querySelector(".name").textContent = review.name;
    const role = root.querySelector(".role");
    role.textContent = review.role || "";
    role.hidden = !review.role;
    const avatar = root.querySelector(".avatar");
    if (review.avatar) {
      const img = document.createElement("img");
      img.src = review.avatar;
      img.alt = "";
      img.loading = "lazy";
      avatar.replaceChildren(img);
    } else {
      avatar.textContent = review.name.replace(/^@/, "").split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase();
    }
    const stars = root.querySelector(".stars");
    stars.hidden = !Number.isFinite(review.rating);
    if (!stars.hidden) {
      const rating = Math.max(0, Math.min(5, Math.round(review.rating)));
      stars.innerHTML = STAR_SVG.repeat(rating);
      stars.setAttribute("aria-label", `${rating} out of 5 stars`);
    }
  }
}

if (!customElements.get("diffui-landing-review")) customElements.define("diffui-landing-review", DiffuiLandingReview);
