/** "From prompt to page" glass plate floating over the rising designs. */
export function RiseCard({ latencySeconds }: { latencySeconds: number }) {
  return (
    <div className="linen-rise-card pointer-events-none absolute right-0 left-0 z-[1] mx-auto w-full max-w-[1600px] px-4 text-left min-[761px]:px-6">
      <div className="pointer-events-auto mx-auto w-[min(340px,100%)] rounded-[11px] border border-[color-mix(in_srgb,var(--text)_9%,transparent)] bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] px-[22px] pt-[22px] pb-[18px] shadow-[0_30px_80px_rgba(16,12,6,0.24),0_4px_14px_rgba(16,12,6,0.1)] backdrop-blur-[18px] backdrop-saturate-[1.1] min-[761px]:mr-0 min-[761px]:ml-auto min-[761px]:w-[min(440px,100%)] min-[761px]:px-9 min-[761px]:pt-9 min-[761px]:pb-[30px]">
        <h2 className="m-0 mb-3 font-serif text-[28px] leading-[1.08] font-medium tracking-[-0.5px] min-[761px]:mb-[18px] min-[761px]:text-[clamp(32px,3.1vw,42px)]">
          From prompt to page in{" "}
          <span className="text-linen-gold">{latencySeconds} seconds</span>
          <sup
            aria-describedby="latencyNote"
            className="static ml-0.5 align-super font-sans text-[0.55em] font-semibold text-linen-gold"
          >
            *
          </sup>
        </h2>
        <p className="m-0 text-[15px] leading-[1.5] text-linen-muted min-[761px]:text-[clamp(16px,1.35vw,19px)] min-[761px]:leading-[1.55]">
          Linen generates at the speed of exploration. Don&apos;t derail your train of thought, test and explore
          directions live.
        </p>
        <p
          id="latencyNote"
          className="mx-0 mt-4 mb-0 border-t border-[color-mix(in_srgb,var(--text)_14%,transparent)] pt-3.5 text-[11.5px] leading-[1.5] text-linen-muted min-[761px]:mt-[26px] min-[761px]:pt-5 min-[761px]:text-[13px]"
        >
          *Average time from prompt to finished design across every Linen generation in the last 30 days.
        </p>
      </div>
    </div>
  );
}
