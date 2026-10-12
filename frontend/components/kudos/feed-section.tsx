import { connection } from "next/server";
import { getKudosFeed } from "@/lib/kudos/queries";
import { getBoardStats, getGiftClaims } from "@/lib/kudos/rail-queries";
import { KudosFeed } from "./kudos-feed";
import { BoardStatsRail } from "./board-stats-rail";

/**
 * Request-time read for the ALL KUDOS feed and its right rail
 * (mm:2940:13475 / mm:2940:13488).
 *
 * The rail is passed into `KudosFeed` as its `aside` so the C.1 header rule
 * spans both columns exactly as the design draws it, instead of being boxed
 * into the narrower card column.
 *
 * Isolated behind its own `<Suspense>` boundary at the page level; see
 * `highlight-section.tsx` for why the `connection()` call belongs in the leaf.
 */
export async function FeedSection({
  feedLabels,
  railLabels,
  emptyLabel,
}: {
  feedLabels: {
    eyebrow: string;
    heading: string;
    copyLinkLabel: string;
    copiedLabel: string;
  };
  railLabels: {
    received: string;
    sent: string;
    hearts: string;
    boxesOpened: string;
    boxesUnopened: string;
    openBoxCta: string;
    giftTitle: string;
  };
  emptyLabel: string;
}) {
  await connection();

  const [posts, stats, giftClaims] = await Promise.all([
    getKudosFeed({}, 8),
    getBoardStats(),
    getGiftClaims(),
  ]);

  return (
    <KudosFeed
      posts={posts}
      labels={feedLabels}
      emptyLabel={emptyLabel}
      aside={
        <BoardStatsRail
          stats={stats}
          giftClaims={giftClaims}
          labels={railLabels}
        />
      }
    />
  );
}
