import { StarIcon } from "@/components/icons";
import type { Review } from "@/types/linen";

function initials(name: string) {
  return name
    .replace(/^@/, "")
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ReviewCard({ review }: { review: Review }) {
  const rating = Number.isFinite(review.rating) ? Math.max(0, Math.min(5, Math.round(review.rating ?? 0))) : null;
  return (
    <article className="flex flex-col justify-between gap-4 rounded-[12px] border border-linen-border bg-linen-surface-highlight px-6 py-5">
      <blockquote className="m-0 -indent-[0.42em] font-serif text-[clamp(17px,1.4vw,20px)] leading-[1.35] text-linen-text">
        &ldquo;{review.quote}&rdquo;
      </blockquote>
      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className="grid size-10 flex-none place-items-center overflow-hidden rounded-full bg-linen-gold-muted font-serif text-[17px] text-linen-bg"
        >
          {review.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={review.avatar} alt="" loading="lazy" className="block size-full object-cover" />
          ) : (
            initials(review.name)
          )}
        </div>
        <div>
          <div className="text-[15px] font-medium text-linen-text">{review.name}</div>
          {review.role && (
            <div className="mt-1 font-mono text-[11px] tracking-[0.22em] text-linen-muted uppercase">{review.role}</div>
          )}
          {rating !== null && (
            <div role="img" aria-label={`${rating} out of 5 stars`} className="mt-2.5 flex gap-1 text-linen-gold">
              {Array.from({ length: rating }, (_, i) => (
                <StarIcon key={i} className="size-[15px]" />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
