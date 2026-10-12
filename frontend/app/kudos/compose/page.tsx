import type { Metadata } from "next";
import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { normalizeLocale } from "@/i18n/locale";
import { montserrat } from "@/lib/fonts";
import { SiteHeader } from "@/components/awards/site-header";
import { getComposeOptions } from "@/lib/kudos/compose-queries";
import { excludeSelf, getCurrentSunner } from "@/lib/kudos/current-sunner";
import { ComposeBackdrop } from "@/components/kudos/compose/compose-backdrop";
import { ComposeCard } from "@/components/kudos/compose/compose-card";
import type { ComposeCardLabels } from "@/components/kudos/compose/compose-labels";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("kudosCompose");
  return { title: `SAA 2025 – ${t("metaTitle")}` };
}

const KUDOS_HREF = "/kudos";

/**
 * mm:520:11602 ("Viết Kudo")
 * https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2
 *
 * The compose target behind the Kudos board's "ghi nhận" pill
 * (`KudosHero`'s `composeHref`). Figma draws it as a modal sitting over the
 * board, but as its own screen — mask, keyvisual and all — so it is a route
 * rather than an overlay on `/kudos`: the board's three sections each read
 * Supabase, and keeping them mounted behind an 80% veil would pay for data
 * nobody can see.
 *
 * Open to everyone: sign-in does not work in this deployment, so the sender is
 * the mocked current user from `lib/kudos/current-sunner.ts` rather than a
 * session. That Sunner is also filtered out of the recipient list, since a
 * self-Kudo is rejected by both the RPC and the `kudos_posts_no_self` CHECK.
 *
 * The three pickers' options are read behind their own `<Suspense>` boundary.
 * Awaiting `getComposeOptions()` in the page body instead makes the WHOLE
 * route blocking — "uncached data during prerendering", the same trap
 * `app/kudos/page.tsx` documents for its three Supabase-backed sections.
 * Isolated, the shell, the header and the backdrop render immediately and
 * only the card waits on the database.
 *
 * `lib/kudos/compose-queries.ts` is fail-open, so a dead Supabase yields
 * empty menus and a form that still works through its free-text paths rather
 * than a 500.
 */
export default async function KudosComposePage() {
  const [t, locale] = await Promise.all([getTranslations("kudosCompose"), getLocale()]);

  const labels = {
    heading: t("heading"),

    recipientLabel: t("recipientLabel"),
    recipientPlaceholder: t("recipientPlaceholder"),
    noRecipients: t("noRecipients"),

    awardLabel: t("awardLabel"),
    awardPlaceholder: t("awardPlaceholder"),
    awardHint: t("awardHint"),
    awardFreeTextHint: t("awardFreeTextHint"),

    bodyPlaceholder: t("bodyPlaceholder"),
    mentionHint: t("mentionHint"),
    guidelines: t("guidelines"),
    linkPrompt: t("linkPrompt"),
    linkPlaceholder: t("linkPlaceholder"),
    tools: {
      bold: t("toolBold"),
      italic: t("toolItalic"),
      strikethrough: t("toolStrikethrough"),
      numberList: t("toolNumberList"),
      link: t("toolLink"),
      quote: t("toolQuote"),
    },

    hashtagLabel: t("hashtagLabel"),
    addHashtag: t("addHashtag"),
    hashtagInputLabel: t("hashtagInputLabel"),
    hashtagPlaceholder: t("hashtagPlaceholder"),
    removeHashtag: t("removeHashtag"),
    createHashtag: t("createHashtag"),
    noHashtags: t("noHashtags"),

    imageLabel: t("imageLabel"),
    addImage: t("addImage"),
    removeImage: t("removeImage"),
    imageAlt: t("imageAlt"),

    maxFive: t("maxFive"),

    anonymous: t("anonymous"),
    cancel: t("cancel"),
    submit: t("submit"),
    submitting: t("submitting"),
  };

  return (
    <div
      data-testid="kudos-compose-page"
      className={`${montserrat.className} relative flex min-h-screen flex-col overflow-x-hidden bg-[#00101A]`}
    >
      {/* mm:520:11606 (Header) — the mask is drawn over it on the canvas, and
          the card starts at y10, above the header's own band. So it is taken
          out of flow: it sits under the backdrop's z-index (reading dimmed,
          as on the canvas) and the card passes in front of it rather than
          starting below it. */}
      <div className="absolute inset-x-0 top-0 z-10">
        <SiteHeader locale={normalizeLocale(locale)} activeHref={KUDOS_HREF} />
      </div>

      {/* mm:520:11603 + mm:520:11605 + mm:520:11646 */}
      <ComposeBackdrop />

      {/* mm:520:11647 — centred on the artboard (x357 of 1440, 752 wide) with
          only 10px of air above and below it on the 1024px frame. `grid` with
          `place-items-center` rather than a centred flex row: once the card
          outgrows the viewport the grid track grows with it and the page
          scrolls, where flex centring would crop the top of the card instead. */}
      <main className="relative z-30 grid min-h-screen w-full place-items-center px-4 py-2.5 sm:px-6">
        <Suspense fallback={<CardSkeleton />}>
          <ComposeCardWithOptions labels={labels} />
        </Suspense>
      </main>
    </div>
  );
}

/**
 * The only part of the screen that touches the database. Split out purely so
 * the `<Suspense>` boundary above has something to suspend on.
 */
async function ComposeCardWithOptions({ labels }: { labels: ComposeCardLabels }) {
  const [options, currentSunner] = await Promise.all([getComposeOptions(), getCurrentSunner()]);
  return (
    <ComposeCard
      cancelHref={KUDOS_HREF}
      guidelinesHref={`${KUDOS_HREF}#community-standards`}
      options={{
        ...options,
        recipients: excludeSelf(options.recipients, currentSunner?.id ?? null),
      }}
      labels={labels}
    />
  );
}

/** Holds the card's footprint so the page does not jump when it resolves. */
function CardSkeleton() {
  return (
    <div
      aria-hidden
      className="h-[900px] w-full max-w-[752px] rounded-3xl bg-[#FFF8E1]/60"
    />
  );
}
