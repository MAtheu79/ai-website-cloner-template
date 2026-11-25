"use client";

import type { LandingTheme, Review } from "@/types/linen";
import { ReviewCard } from "./ReviewCard";

const REVIEWS: Review[] = [
  {
    quote: "Linen is the only SaaS tool I need",
    name: "Kane Narraway",
    avatar: "/landing/assets/reviews/kane-narraway.webp",
    rating: 5,
  },
  {
    quote:
      "I love Linen and I've been using it internally here at Rhombus to really improve many of our designs.",
    name: "John Anderson",
    role: "Rhombus",
  },
  {
    quote:
      "Linen really is the missing piece to my projects; I know what I want the app/site to do functionally, but I struggle with design, so Linen solves that for me!",
    name: "@buck",
  },
  {
    quote: "I've been using Linen for several months and the way that it jumpstarts my ideas is unmatched",
    name: "Jesse James Clark",
    role: "Lead UI Developer, Design Systems at Cisco",
    avatar: "/landing/assets/reviews/jesse-james-clark.webp",
  },
];

export function ReviewsSection({ theme }: { theme: LandingTheme }) {
  return (
    <section aria-label="Reviews" className="linen-reviews block w-full max-w-[1400px] px-6">
      <h2 className="m-0 mb-[18px] font-serif text-[clamp(42px,5.6vw,84px)] leading-[1.02] font-medium tracking-[-0.02em] text-linen-text">
        Trusted by creators
      </h2>
      <p className="m-0 max-w-[640px] text-[clamp(17px,1.55vw,22px)] leading-[1.45] text-linen-muted">
        From independent creators to nonprofits to global brands, people are using Linen to bring their ideas to
        life. Here&rsquo;s what they have to say.
      </p>
      <div className="mt-12 grid grid-cols-1 gap-[22px] min-[701px]:grid-cols-2 min-[1201px]:grid-cols-4">
        {REVIEWS.map((review) => (
          <ReviewCard key={review.name} review={review} />
        ))}
      </div>
      <p className="mx-0 mt-14 mb-0 text-center text-[clamp(16px,1.45vw,20px)] text-linen-muted">
        Join a growing community of creators, organizations, and businesses building a brighter internet with Linen.
      </p>
      <div className="mt-14 flex flex-col items-center gap-[18px]">
        <div className="flex flex-wrap justify-center gap-3.5">
          <diffui-button
            className="linen-btn-launch"
            type="button"
            outline
            data-theme={theme}
            onClick={() => window.location.assign("https://linen.ai/pricing")}
          >
            <span>See pricing</span>
          </diffui-button>
          <diffui-button
            className="linen-btn-launch"
            type="button"
            data-theme={theme}
            onClick={() => window.location.assign("https://linen.ai/app")}
          >
            <span>Launch Linen</span>
          </diffui-button>
        </div>
      </div>
    </section>
  );
}
