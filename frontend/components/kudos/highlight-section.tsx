import { connection } from "next/server";
import { getFilterOptions, getHighlightPosts } from "@/lib/kudos/queries";
import { withMyReactions } from "@/lib/kudos/reactions";
import type { KudosFilters } from "@/lib/kudos/types";
import { HighlightCarousel } from "./highlight-carousel";

/**
 * Request-time read for the HIGHLIGHT KUDOS carousel (mm:2940:13451).
 *
 * The `connection()` opt-in and the Supabase reads live in this leaf so the
 * page can wrap just this subtree in `<Suspense>`; calling them from the page
 * body would make the entire route blocking rather than prerendered.
 *
 * Both queries are fail-open, so a stopped Supabase yields an empty carousel
 * rather than a 500.
 */
export async function HighlightSection({
  filters,
  labels,
}: {
  /**
   * The page's `searchParams` promise, awaited HERE rather than in the page
   * body — reading it up there would make the whole route blocking instead
   * of letting only this section stream.
   */
  filters: Promise<KudosFilters>;
  labels: {
    eyebrow: string;
    heading: string;
    hashtagLabel: string;
    departmentLabel: string;
    allLabel: string;
    detailLabel: string;
    copyLinkLabel: string;
    anonymousLabel: string;
    likeLabel: string;
    unlikeLabel: string;
  };
}) {
  await connection();

  const { hashtag, department } = await filters;

  const [posts, options] = await Promise.all([
    getHighlightPosts({ hashtag, department }).then(withMyReactions),
    getFilterOptions(),
  ]);

  return (
    <HighlightCarousel
      posts={posts}
      hashtagOptions={options.hashtags}
      departmentOptions={options.departments}
      selectedHashtag={hashtag ?? null}
      selectedDepartment={department ?? null}
      labels={labels}
    />
  );
}
