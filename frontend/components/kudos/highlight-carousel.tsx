"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FilterOption, KudosPost } from "@/lib/kudos/types";
import { HighlightCard } from "./highlight-card";
import { KudosFilterSelect } from "./kudos-filter-select";
import { NavButton } from "./carousel-nav-button";

/**
 * mm:2940:13451 ("B_Highlight") — header + filters + a 3-up peeking carousel
 * (edge-faded neighbours at `lg+`) + the bottom `n/total` pager. Local state
 * `posts` arrives ALREADY ranked and filtered — it is the 5 most-hearted
 * Kudos for the current filter, resolved in SQL (see `getHighlightPosts`).
 * The two dropdowns therefore write to the URL rather than filtering an
 * array here: "top 5 of the filtered set" cannot be recovered from a top-5
 * that was already narrowed, so the ranking has to be re-run server-side.
 * Paging is local and wraps.
 */
export interface HighlightCarouselLabels {
  eyebrow: string; // mm:2940:13454 — "Sun* Annual Awards 2025"
  heading: string; // mm:2940:13457 — "HIGHLIGHT KUDOS"
  hashtagLabel: string; // mm:…;186:2760 — "Hashtag"
  departmentLabel: string; // mm:…;186:2760 — "Phòng ban"
  allLabel: string; // the "clear filter" row shown at the top of each dropdown
  detailLabel: string; // mm:…;186:1439 — "Xem chi tiết"
  copyLinkLabel: string; // mm:…;186:1439 — "Copy Link"
  anonymousLabel: string; // mm:…;256:4735 fallback name for a masked anonymous sender
  /** mm:…;256:5175 — accessible names for the heart's two states. */
  likeLabel: string;
  unlikeLabel: string;
}

export function HighlightCarousel({
  posts,
  hashtagOptions,
  departmentOptions,
  selectedHashtag,
  selectedDepartment,
  labels,
}: {
  posts: KudosPost[];
  hashtagOptions: FilterOption[];
  departmentOptions: FilterOption[];
  selectedHashtag: string | null;
  selectedDepartment: string | null;
  labels: HighlightCarouselLabels;
}) {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Writes one filter to the query string, preserving the other. `scroll:
   * false` keeps the viewport where it is — the reader is looking at this
   * carousel, and jumping to the top of the page on every filter change
   * would lose their place.
   */
  function applyFilter(key: "hashtag" | "department", value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    setIndex(0);
    router.push(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
  }

  const filteredPosts = posts;
  const pageCount = filteredPosts.length;
  const safeIndex = pageCount === 0 ? 0 : index % pageCount;
  const current = filteredPosts[safeIndex];
  const previous = pageCount > 0 ? filteredPosts[(safeIndex - 1 + pageCount) % pageCount] : undefined;
  const next = pageCount > 0 ? filteredPosts[(safeIndex + 1) % pageCount] : undefined;

  function goTo(delta: number) {
    if (pageCount === 0) return;
    setIndex((value) => (value + delta + pageCount) % pageCount);
  }

  function handleTrackKeyDown(event: React.KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    goTo(event.key === "ArrowLeft" ? -1 : 1);
  }

  return (
    // mm:2940:13451 (B_Highlight)
    <section data-testid="kudos-highlight-carousel" className="w-full">
      <div className="flex w-full flex-col items-start gap-10">
        {/* mm:2940:13452 (B.1_header) */}
        <div className="mx-auto flex w-full max-w-[1152px] flex-col items-start gap-4 px-4 sm:px-6 md:px-9 lg:px-12 xl:px-0">
          {/* mm:2940:13454 */}
          <p className="text-2xl leading-8 font-bold text-white">{labels.eyebrow}</p>
          {/* mm:2940:13455 (Rectangle 26) */}
          <div className="h-px w-full bg-[#2E3940]" />
          {/* mm:2940:13456 (Frame 488) */}
          <div className="flex w-full flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            {/* mm:2940:13457 */}
            <h2 className="text-[34px] leading-10 font-bold tracking-[-0.25px] text-[#FFEA9E] sm:text-[44px] sm:leading-[52px] lg:text-[57px] lg:leading-[64px]">
              {labels.heading}
            </h2>
            {/* mm:2940:13458 (Buttons) */}
            <div className="flex flex-row items-center gap-2">
              {/* mm:2940:13459 (B.1.1_ButtonHashtag) */}
              <KudosFilterSelect
                label={labels.hashtagLabel}
                allLabel={labels.allLabel}
                options={hashtagOptions}
                value={selectedHashtag}
                onChange={(next) => applyFilter("hashtag", next)}
              />
              {/* mm:2940:13460 (B.1.2_Button Phong ban) */}
              <KudosFilterSelect
                label={labels.departmentLabel}
                allLabel={labels.allLabel}
                options={departmentOptions}
                value={selectedDepartment}
                onChange={(next) => applyFilter("department", next)}
              />
            </div>
          </div>
        </div>

        {/* mm:2940:13461 (B.2_HIGHLIGHT KUDOS) */}
        <div className="relative w-full overflow-hidden">
          <div
            role="group"
            aria-roledescription="carousel"
            aria-label={labels.heading}
            tabIndex={0}
            onKeyDown={handleTrackKeyDown}
            data-testid="kudos-highlight-track"
            className="flex w-full items-center justify-center gap-6 px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFEA9E] sm:px-6"
          >
            {[
              { post: previous, peek: true },
              { post: current, peek: false },
              { post: next, peek: true },
            ].map(
              ({ post, peek }, slot) =>
                post &&
                (!peek || pageCount > 1) && (
                  <HighlightCard
                    key={`${slot}-${post.id}`}
                    post={post}
                    copyLinkLabel={labels.copyLinkLabel}
                    detailLabel={labels.detailLabel}
                    anonymousLabel={labels.anonymousLabel}
                    heartLabels={{ like: labels.likeLabel, unlike: labels.unlikeLabel }}
                    className={peek ? "hidden shrink-0 lg:flex" : "shrink-0"}
                  />
                ),
            )}
          </div>

          {/* mm:2940:13469 (Frame 528) / mm:2940:13467 (Frame 527) — edge fade + large prev/next, desktop only */}
          <NavButton direction="left" size={80} iconSize={60} edge testId="kudos-highlight-prev" disabled={pageCount === 0} onClick={() => goTo(-1)} />
          <NavButton direction="right" size={80} iconSize={60} edge testId="kudos-highlight-next" disabled={pageCount === 0} onClick={() => goTo(1)} />
        </div>

        {/* mm:2940:13471 (B.5_slide) */}
        <div className="flex w-full flex-row items-center justify-center gap-8">
          {/* mm:2940:13472 (B.5.1_Button lùi) / mm:I2940:13472;186:1420 */}
          <NavButton direction="left" size={48} iconSize={28} disabled={pageCount === 0} onClick={() => goTo(-1)} />
          {/* mm:2940:13473 (B.5.2_số trang) */}
          <p data-testid="kudos-highlight-page" aria-live="polite" className="text-[28px] leading-9 font-bold text-[#999999]">
            {pageCount === 0 ? "0/0" : `${safeIndex + 1}/${pageCount}`}
          </p>
          {/* mm:2940:13474 (B.5.3_Button tiến) / mm:I2940:13474;186:1420 */}
          <NavButton direction="right" size={48} iconSize={28} disabled={pageCount === 0} onClick={() => goTo(1)} />
        </div>
      </div>
    </section>
  );
}
