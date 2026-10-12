import type { Metadata } from "next";
import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { normalizeLocale } from "@/i18n/locale";
import { montserrat } from "@/lib/fonts";
import { SiteHeader } from "@/components/awards/site-header";
import { AwardsFooter } from "@/components/awards/awards-footer";
import { KudosBackground } from "@/components/kudos/kudos-background";
import { KudosHero } from "@/components/kudos/kudos-hero";
import { HighlightSection } from "@/components/kudos/highlight-section";
import { SpotlightSection } from "@/components/kudos/spotlight-section";
import { FeedSection } from "@/components/kudos/feed-section";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("kudos");
  return { title: `SAA 2025 – ${t("metaTitle")}` };
}

const PAGE_HREF = "/kudos";

// mm:2940:13431 (Sun* Kudos - Live board)
// https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
export default async function KudosPage({
  searchParams,
}: {
  searchParams: Promise<{ hashtag?: string; department?: string }>;
}) {
  // NOT awaited here. The Highlight section is a leaderboard ("the 5
  // most-hearted Kudos") whose filters must re-rank in SQL, so they are URL
  // state — but reading `searchParams` in the page body makes the WHOLE
  // route blocking ("accessed outside of <Suspense>"), exactly as a bare
  // `connection()` did. The promise is handed to `HighlightSection`, which
  // already sits inside its own boundary and awaits it there.
  const [t, tAwards, tCommon, locale] = await Promise.all([
    getTranslations("kudos"),
    getTranslations("awards"),
    getTranslations("common"),
    getLocale(),
  ]);

  return (
    <div
      data-testid="kudos-page"
      className={`${montserrat.className} relative flex min-h-screen flex-col overflow-x-hidden bg-[#00101A]`}
    >
      {/* mm:2940:13432 (Keyvisual + Cover) */}
      <KudosBackground />

      <SiteHeader locale={normalizeLocale(locale)} activeHref={PAGE_HREF} />

      {/* mm:2940:13434 (Bìa) */}
      <main className="relative z-10 flex w-full flex-col items-center gap-20 pt-10 pb-16 lg:gap-28 lg:pt-16 lg:pb-24">
        {/* mm:2940:13436 (Frame 487) + mm:2940:13448 (Button chuc nang) */}
        <KudosHero
          eyebrow={t("heroEyebrow")}
          composePlaceholder={t("composePlaceholder")}
          searchPlaceholder={t("searchPlaceholder")}
          composeHref="/kudos/compose"
          searchHref="/kudos/sunners"
        />

        {/*
          Each section below reads Supabase at request time, so each is
          isolated behind its own <Suspense> boundary. Without that, a single
          uncached read makes the WHOLE route blocking — the trap `/` hit with
          `connection()`. Isolated, the shell and the hero prerender and the
          three data sections stream in independently.
        */}
        <Suspense fallback={<SectionSkeleton height="h-[560px]" />}>
          <HighlightSection
            filters={searchParams}
            labels={{
              eyebrow: t("sectionEyebrow"),
              heading: t("highlightHeading"),
              hashtagLabel: t("hashtagFilter"),
              departmentLabel: t("departmentFilter"),
              allLabel: t("filterAll"),
              detailLabel: t("detail"),
              copyLinkLabel: t("copyLink"),
            }}
          />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-[720px]" />}>
          <SpotlightSection
            labels={{
              eyebrow: t("sectionEyebrow"),
              heading: t("spotlightHeading"),
              kudosSuffix: t("kudosSuffix"),
              searchPlaceholder: t("spotlightSearch"),
              activitySuffix: t("activitySuffix"),
            }}
          />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-[900px]" />}>
          <FeedSection
            feedLabels={{
              eyebrow: t("sectionEyebrow"),
              heading: t("allKudosHeading"),
              copyLinkLabel: t("copyLink"),
              copiedLabel: t("copied"),
            }}
            emptyLabel={t("emptyFeed")}
            railLabels={{
              received: t("statReceived"),
              sent: t("statSent"),
              hearts: t("statHearts"),
              boxesOpened: t("statBoxesOpened"),
              boxesUnopened: t("statBoxesUnopened"),
              openBoxCta: t("openBoxCta"),
              giftTitle: t("giftTitle"),
            }}
          />
        </Suspense>
      </main>

      {/* mm:2940:13522 (Header cuối) */}
      <AwardsFooter
        criteriaLabel={tAwards("footerCriteria")}
        copyright={tCommon("footer")}
        activeHref={PAGE_HREF}
      />
    </div>
  );
}

/**
 * Reserves the section's approximate height while it streams, so the page
 * does not jump as each boundary resolves.
 */
function SectionSkeleton({ height }: { height: string }) {
  return (
    <div
      aria-hidden
      className={`mx-auto w-full max-w-[1224px] px-4 sm:px-6 md:px-9 lg:px-12 xl:px-0 ${height}`}
    />
  );
}
