import "../../app/components/diffui-button.js";
import "./diffui-landing-review.js";

// "Trusted by creators": what people say about Linen. A
// heading, four review cards, then Launch Linen
// and See pricing buttons. Launch fires a composed `landing-launch` event for
// the page to start sign-in; See pricing navigates like the header's link.
const REVIEWS = [
  {
    quote: "Linen is the only SaaS tool I need",
    name: "Kane Narraway",
    avatar: "/landing/assets/reviews/kane-narraway.webp",
    rating: 5,
  },
  {
    quote: "I love Linen and I've been using it internally here at Rhombus to really improve many of our designs.",
    name: "John Anderson",
    role: "Rhombus",
  },
  {
    quote: "Linen really is the missing piece to my projects; I know what I want the app/site to do functionally, but I struggle with design, so Linen solves that for me!",
    name: "@buck",
  },
  {
    quote: "I've been using Linen for several months and the way that it jumpstarts my ideas is unmatched",
    name: "Jesse James Clark",
    role: "Lead UI Developer, Design Systems at Cisco",
    avatar: "/landing/assets/reviews/jesse-james-clark.webp",
  },
];

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: 0 24px;
    }
    h2 {
      margin: 0 0 18px;
      font-family: var(--font-serif);
      font-size: clamp(42px, 5.6vw, 84px);
      font-weight: 500;
      line-height: 1.02;
      letter-spacing: -0.02em;
      color: var(--text);
    }
    .lede {
      margin: 0;
      max-width: 640px;
      font-size: clamp(17px, 1.55vw, 22px);
      line-height: 1.45;
      color: var(--muted);
    }
    .cards {
      margin-top: 48px;
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 22px;
    }
    .community {
      margin: 56px 0 0;
      text-align: center;
      font-size: clamp(16px, 1.45vw, 20px);
      color: var(--muted);
    }
    .launch {
      margin-top: 56px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
    }
    .launchActions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 14px;
    }
    .launchBtn,
    .pricingBtn {
      --height: 52px;
      --padding-x: 56px;
      --font-size: 18px;
      --font-weight: 500;
    }
    @media (max-width: 1200px) {
      .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 700px) {
      .cards { grid-template-columns: 1fr; }
    }
  </style>
  <div class="intro">
    <div>
      <h2>Trusted by creators</h2>
      <p class="lede">From independent creators to nonprofits to global brands, people are using Linen to bring their ideas to life. Here’s what they have to say.</p>
    </div>
  </div>
  <div class="cards"></div>
  <p class="community">Join a growing community of creators, organizations, and businesses building a brighter internet with Linen.</p>
  <div class="launch">
    <div class="launchActions">
      <diffui-button class="pricingBtn" type="button" outline><span>See pricing</span></diffui-button>
      <diffui-button class="launchBtn" type="button"><span>Launch Linen</span></diffui-button>
    </div>
  </div>
`;

export class DiffuiLandingReviews extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.appendChild(template.content.cloneNode(true));
    const cards = root.querySelector(".cards");
    for (const review of REVIEWS) {
      const card = document.createElement("diffui-landing-review");
      card.review = review;
      cards.appendChild(card);
    }
    root.querySelector(".launchBtn").addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("landing-launch", { bubbles: true, composed: true }));
    });
    root.querySelector(".pricingBtn").addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("diffui-landing-nav", { detail: { path: "/pricing" }, bubbles: true, composed: true }));
    });
  }
}

if (!customElements.get("diffui-landing-reviews")) customElements.define("diffui-landing-reviews", DiffuiLandingReviews);
