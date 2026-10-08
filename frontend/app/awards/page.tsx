import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { normalizeLocale } from "@/i18n/locale";
import { montserrat } from "@/lib/fonts";
import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import { SiteHeader } from "@/components/awards/site-header";
import { AwardsHero } from "@/components/awards/awards-hero";
import { AwardCategoryNav } from "@/components/awards/award-category-nav";
import { AwardCard } from "@/components/awards/award-card";
import { KudosBlock } from "@/components/awards/kudos-block";
import { AwardsFooter } from "@/components/awards/awards-footer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("awards");
  return { title: `SAA 2025 – ${t("metaTitle")}` };
}

const PAGE_HREF = "/awards";

// mm:313:8436 (Hệ thống giải) — https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
export default async function AwardsPage() {
  const [t, tLogin, tCommon, locale] = await Promise.all([
    getTranslations("awards"),
    getTranslations("login"),
    getTranslations("common"),
    getLocale(),
  ]);

  const labels = {
    quantity: t("quantityLabel"),
    prize: t("prizeLabel"),
    or: t("or"),
  };

  return (
    <div
      className={`${montserrat.className} flex min-h-screen flex-col overflow-x-hidden bg-[#00101A]`}
    >
      <SiteHeader locale={normalizeLocale(locale)} activeHref={PAGE_HREF} />

      <AwardsHero
        subtitle={t("heroSubtitle")}
        title={t("heroTitle")}
        wordmarkAlt={tLogin("heroTitle")}
      />

      {/* mm:313:8458 (mms_B_Hệ thống giải thưởng) — 178px menu + 853px list */}
      <main className="mx-auto flex w-full max-w-[1152px] flex-col gap-10 px-4 pt-16 sm:px-6 md:px-9 lg:flex-row lg:justify-between lg:gap-10 lg:px-12 xl:px-0">
        <AwardCategoryNav categories={AWARD_CATEGORIES} />

        {/* mm:313:8466 (D.Danh sách giải thưởng) */}
        <div className="flex flex-col gap-20 lg:w-[853px]">
          {AWARD_CATEGORIES.map((category, index) => (
            <AwardCard
              key={category.id}
              category={category}
              labels={labels}
              reversed={index % 2 === 1}
              showDivider={index < AWARD_CATEGORIES.length - 1}
            />
          ))}
        </div>
      </main>

      <div className="mt-20 w-full px-4 sm:px-6 md:px-9 lg:px-12 xl:px-36">
        <KudosBlock
          eyebrow={t("kudosEyebrow")}
          title={t("kudosTitle")}
          ctaLabel={t("kudosCta")}
          ctaHref="/kudos"
        />
      </div>

      <AwardsFooter
        criteriaLabel={t("footerCriteria")}
        copyright={tCommon("footer")}
        activeHref={PAGE_HREF}
      />
    </div>
  );
}
