import Link from "next/link";
import { MaskedIcon } from "@/components/awards/masked-icon";

/**
 * Kudos live-board hero — mm:2940:13436 (Frame 487), inside "Bìa"
 * (mm:2940:13434) on the "Sun* Kudos - Live board" screen.
 *
 * Purely presentational: wording and link targets come in as props so the
 * page can wire real copy/localization and real compose/search routes
 * without touching this markup. `KudosBackground` renders the keyvisual
 * artwork behind this content (mm:2940:13432) — this component only paints
 * the eyebrow line, the KUDOS wordmark, and the two navigational pills.
 *
 * The 1152px content frame (mm:2940:13437, "A_KV Kudos") centers inside the
 * 1440px artboard (144px gutter either side — mm:2940:13436's own
 * `padding: 0 144px`), so it renders as `max-w-[1152px] mx-auto` rather
 * than a fixed-width block, per code-rules.md "Containered layout". This
 * screen's artboard is 1440px (not 1512px like the homepage), so the gutter
 * figure differs from `HomeHero` even though the idiom is identical.
 *
 * The two pills (mm:2940:13449 "A.1_Button ghi nhận" / mm:2940:13450 "Tìm
 * kiếm sunner") are fixed at 738px / 381px in Figma — a ~2:1 ratio inside
 * the 1152px row (738 + 32 gap + 381 ≈ 1152). Below `lg` there is no design
 * reference, so they stack full-width (code-rules has no mobile frame to
 * transcribe here); at `sm` and up they keep that ~2:1 proportion via flex
 * ratios instead of a hardcoded px width, so the row stays fluid between
 * breakpoints rather than only being correct at exactly 1440px.
 */

interface KudosHeroProps {
  eyebrow: string;
  composePlaceholder: string;
  searchPlaceholder: string;
  composeHref: string;
  searchHref: string;
}

const CTA_TRANSITION =
  "transition-colors duration-200 ease-out motion-reduce:transition-none";
const CTA_FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E]";
const PILL_BASE = `flex w-full items-center gap-4 rounded-[68px] border border-[#998C5F] bg-[#FFEA9E]/10 px-4 py-6 hover:bg-[#FFEA9E]/20 ${CTA_TRANSITION} ${CTA_FOCUS_RING}`;

export function KudosHero({
  eyebrow,
  composePlaceholder,
  searchPlaceholder,
  composeHref,
  searchHref,
}: KudosHeroProps) {
  return (
    // mm:2940:13436 (Frame 487)
    <section data-testid="kudos-hero" className="relative z-10 w-full">
      <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-16 px-4 sm:px-6 md:px-9 lg:px-12 xl:px-0">
        {/* mm:2940:13437 (A_KV Kudos) */}
        <div className="flex flex-col gap-[10px]">
          {/* mm:2940:13438 (Group 424) */}
          {/* mm:2940:13439 */}
          <p className="text-left text-2xl leading-[1.2] font-bold text-[#FFEA9E] sm:text-3xl lg:text-[36px] lg:leading-[44px]">
            {eyebrow}
          </p>
          {/* mm:2940:13440 (MM_MEDIA_Kudos logo) */}
          {/* eslint-disable-next-line @next/next/no-img-element -- static multi-colour wordmark asset, no responsive variants needed */}
          <img
            src="/kudos/kudos-logo.svg"
            alt="KUDOS"
            width={593}
            height={106}
            className="h-auto w-full max-w-[593px]"
          />
        </div>

        {/* mm:2940:13448 (Button chuc nang) */}
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
          {/* mm:2940:13449 (A.1_Button ghi nhận) */}
          <Link href={composeHref} className={`${PILL_BASE} sm:flex-[2]`}>
            {/* mm:I2940:13449;186:2758 (Frame 483) */}
            {/* mm:I2940:13449;186:2759 (MM_MEDIA_Pen) */}
            <MaskedIcon src="/home/icon-pen.svg" className="text-white" />
            {/* mm:I2940:13449;186:2760 */}
            <span className="flex-1 text-center text-base leading-6 font-bold tracking-[0.15px] text-white">
              {composePlaceholder}
            </span>
          </Link>

          {/* mm:2940:13450 (Tìm kiếm sunner) */}
          <Link href={searchHref} className={`${PILL_BASE} sm:flex-1`}>
            {/* mm:I2940:13450;186:2758 (Frame 483) */}
            {/* mm:I2940:13450;186:2759 (MM_MEDIA_Search) */}
            <MaskedIcon src="/kudos/icon-search.svg" className="text-white" />
            {/* mm:I2940:13450;186:2760 */}
            <span className="flex-1 text-center text-base leading-6 font-bold tracking-[0.15px] text-white">
              {searchPlaceholder}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
