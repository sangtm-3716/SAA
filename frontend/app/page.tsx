import type { Metadata } from "next";
import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { normalizeLocale } from "@/i18n/locale";
import { montserrat } from "@/lib/fonts";
import { SiteHeader } from "@/components/awards/site-header";
import { KudosBlock } from "@/components/awards/kudos-block";
import { AwardsFooter } from "@/components/awards/awards-footer";
import { HomeBackground } from "@/components/home/home-background";
import { HomeHero } from "@/components/home/home-hero";
import { HeroCountdown } from "@/components/home/hero-countdown";
import { HeroCountdownSlot } from "@/components/home/hero-countdown-slot";
import { RootFurtherIntro } from "@/components/home/root-further-intro";
import { AwardSystem } from "@/components/home/award-system";
import { FloatingWidget } from "@/components/home/floating-widget";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return { title: `SAA 2025 – ${t("metaTitle")}` };
}

const PAGE_HREF = "/";

// mm:2167:9026 (Homepage SAA) — https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
export default async function HomePage() {
  const [t, tAwards, tCommon, tCountdown, locale] = await Promise.all([
    getTranslations("home"),
    getTranslations("awards"),
    getTranslations("common"),
    getTranslations("countdown"),
    getLocale(),
  ]);

  // The unit captions are the same three words the /countdown screen uses,
  // so they are read from that namespace rather than duplicated.
  const unitLabels = {
    days: tCountdown("days"),
    hours: tCountdown("hours"),
    minutes: tCountdown("minutes"),
  };

  const countdownLabel = t("countdownLabel");

  return (
    <div
      data-testid="home-page"
      className={`${montserrat.className} relative flex min-h-screen flex-col overflow-x-hidden bg-[#00101A]`}
    >
      {/* mm:2167:9027 + mm:2167:9029 (Keyvisual + Cover) */}
      <HomeBackground />

      <SiteHeader locale={normalizeLocale(locale)} activeHref={PAGE_HREF} />

      {/* mm:2167:9030 (Bìa) — column, 120px gap, 96px vertical padding */}
      <main className="relative z-10 flex w-full flex-col items-center gap-20 py-16 lg:gap-[120px] lg:py-24">
        {/* mm:2167:9031 (Frame 487) */}
        <HomeHero
          countdown={
            // Only the countdown reads request-time data; everything else on
            // this page prerenders. The fallback is the same markup showing
            // zeros, so the hero does not reflow when the real value streams
            // in. See `HeroCountdownSlot`.
            <Suspense
              fallback={
                <HeroCountdown
                  countdownLabel={countdownLabel}
                  days="00"
                  hours="00"
                  minutes="00"
                  unitLabels={unitLabels}
                />
              }
            >
              <HeroCountdownSlot
                countdownLabel={countdownLabel}
                unitLabels={unitLabels}
              />
            </Suspense>
          }
          eventDateLabel={t("eventDateLabel")}
          eventDate={t("eventDate")}
          eventVenueLabel={t("eventVenueLabel")}
          eventVenue={t("eventVenue")}
          livestreamNote={t("livestreamNote")}
          aboutAwardsLabel={t("aboutAwards")}
          aboutAwardsHref="/awards"
          aboutKudosLabel={t("aboutKudos")}
          aboutKudosHref="/kudos"
        />

        {/* mm:3204:10152 (Frame 486) */}
        <RootFurtherIntro />

        {/* mm:2167:9068 (Hệ thống giải thưởng) */}
        <AwardSystem
          eyebrow={t("awardsEyebrow")}
          heading={t("awardsHeading")}
          detailLabel={t("detailLabel")}
        />

        {/* mm:3390:10349 (mms_D1_Sunkudos) — the same block the /awards
            screen renders, reused rather than re-cut from Figma. */}
        <div className="w-full px-4 sm:px-6 md:px-9 lg:px-12 xl:px-36">
          <KudosBlock
            eyebrow={tAwards("kudosEyebrow")}
            title={tAwards("kudosTitle")}
            ctaLabel={tAwards("kudosCta")}
            ctaHref="/kudos"
          />
        </div>
      </main>

      {/* mm:5022:15169 (mms_6_Widget Button) — fixed to the viewport, so it
          sits outside <main>'s flow. */}
      <FloatingWidget
        writeKudosLabel={t("writeKudos")}
        rulesLabel={t("awardRules")}
      />

      {/* mm:5001:14800 (mms_7_Footer) */}
      <AwardsFooter
        criteriaLabel={tAwards("footerCriteria")}
        copyright={tCommon("footer")}
        activeHref={PAGE_HREF}
      />
    </div>
  );
}
