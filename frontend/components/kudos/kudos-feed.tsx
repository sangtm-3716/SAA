import type { ReactNode } from "react";
import type { KudosPost } from "@/lib/kudos/types";
import { KudosPostCard } from "./kudos-post-card";

/**
 * mm:2940:13475 (C_All kudos) — the public feed of kudos post cards, headed
 * by the "ALL KUDOS" gold heading (mm:2940:14221, C.1_Header Giải thưởng).
 * Card list (mm:2940:13482, C.2_Danh sách lời cảm ơn) is 680px wide with a
 * 24px gap between cards; the heading step-down below `lg` mirrors
 * `AwardSystem`'s treatment of the same 57px/-0.25px gold heading style —
 * this screen has no mobile frame to copy exact steps from either.
 */
export function KudosFeed({
  posts,
  labels,
  aside,
  emptyLabel,
}: {
  posts: KudosPost[];
  labels: { eyebrow: string; heading: string; copyLinkLabel: string; copiedLabel: string };
  /**
   * The right rail (mm:2940:13488). It is a sibling of the CARD LIST, not of
   * the section, because in the design the C.1 header rule runs the full
   * 1152px across both columns while the 680px card column and the 422px
   * rail sit side by side beneath it (mm:2940:13481, Frame 502).
   */
  aside?: ReactNode;
  /** Shown instead of the list when the fail-open query returns nothing. */
  emptyLabel: string;
}) {
  return (
    <section
      data-testid="kudos-feed"
      className="mx-auto flex w-full max-w-[1152px] flex-col items-start gap-10 px-4 sm:px-6 md:px-9 lg:px-12 xl:px-0"
    >
      {/* mm:2940:14221 (C.1_Header Giải thưởng) */}
      <div className="flex w-full flex-col items-start gap-4">
        {/* mm:2940:14222 — 24px/32px, weight 700, white */}
        <p className="text-2xl leading-8 font-bold text-white">{labels.eyebrow}</p>
        {/* mm:2940:14223 (Rectangle 26) */}
        <div className="h-px w-full bg-[#2E3940]" />
        {/* mm:2940:14224 (Frame 488) → mm:2940:14225 — 57px/64px, weight 700, -0.25px, gold */}
        <h2 className="text-[34px] leading-10 font-bold tracking-[-0.25px] text-[#FFEA9E] sm:text-[44px] sm:leading-[52px] lg:text-[57px] lg:leading-[64px]">
          {labels.heading}
        </h2>
      </div>

      {/* mm:2940:13481 (Frame 502) — 680px card column + 422px rail */}
      <div className="flex w-full flex-col items-start gap-6 lg:flex-row lg:gap-12">
        {/* mm:2940:13482 (C.2_Danh sách lời cảm ơn) */}
        <div className="flex w-full min-w-0 flex-col items-start gap-6 lg:max-w-[680px]">
          {posts.length === 0 ? (
            <p className="text-base leading-6 font-bold text-white/70">{emptyLabel}</p>
          ) : (
            posts.map((post) => (
              <KudosPostCard
                key={post.id}
                post={post}
                copyLinkLabel={labels.copyLinkLabel}
                copiedLabel={labels.copiedLabel}
              />
            ))
          )}
        </div>

        {aside ? <div className="w-full lg:w-[422px] lg:shrink-0">{aside}</div> : null}
      </div>
    </section>
  );
}
