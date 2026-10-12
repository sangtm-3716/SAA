import type { ReactNode } from "react";
import Link from "next/link";
import { MaskedIcon } from "@/components/awards/masked-icon";
import { EventDetails } from "./event-details";

/**
 * Homepage hero — mm:2167:9031 (Frame 487), inside "Bìa" (mm:2167:9030).
 *
 * Purely presentational: countdown/event copy and CTA targets come in as
 * plain string props so the page can wire live data (and, eventually,
 * `useCountdown`) without touching this markup. The keyvisual background
 * and its "Cover" gradient (mm:2167:9027 / mm:2167:9029) belong to the page
 * root (`HomeBackground`), not this component — `relative z-10` just keeps
 * this content painting above those `absolute` layers regardless of DOM
 * order.
 *
 * The 1224px content frame centers inside the 1512px "Bìa" artboard
 * (144px of symmetric slack either side), so it renders as
 * `max-w-[1224px] mx-auto` rather than a fixed-width block — see
 * code-rules.md "Containered layout". Below `lg` there is no literal Figma
 * gutter to match, so `px-4`/`sm:px-6` are a restrained mobile-first
 * fallback.
 */

interface HomeHeroProps {
  /**
   * mm:2167:9035 (mms_B1_Countdown time) rendered as a slot rather than
   * raw digit props: the countdown has to tick, which makes it a client
   * component (`HeroCountdownTicker`), while everything else on this hero
   * stays a server component. Taking it as a `ReactNode` keeps that
   * boundary at the page level instead of pulling this whole section
   * across it.
   */
  countdown: ReactNode;
  eventDateLabel: string;
  eventDate: string;
  eventVenueLabel: string;
  eventVenue: string;
  livestreamNote: string;
  aboutAwardsLabel: string;
  aboutAwardsHref: string;
  aboutKudosLabel: string;
  aboutKudosHref: string;
}

const CTA_TRANSITION =
  "transition-colors duration-200 ease-out motion-reduce:transition-none";
const CTA_FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E]";

export function HomeHero({
  countdown,
  eventDateLabel,
  eventDate,
  eventVenueLabel,
  eventVenue,
  livestreamNote,
  aboutAwardsLabel,
  aboutAwardsHref,
  aboutKudosLabel,
  aboutKudosHref,
}: HomeHeroProps) {
  return (
    // mm:2167:9031 (Frame 487)
    <section data-testid="home-hero" className="relative z-10 w-full">
      <div className="mx-auto flex w-full max-w-[1224px] flex-col gap-10 px-4 sm:px-6 md:px-9 lg:px-12 xl:px-0">
        {/* mm:2167:9032 (Frame 482) */}
        <div>
          {/* mm:2788:12911 (MM_MEDIA_Root Further Logo) */}
          {/* eslint-disable-next-line @next/next/no-img-element -- static hero logo, no responsive variants needed */}
          <img
            src="/login/root-further-logo.png"
            alt="Root & Further"
            width={451}
            height={200}
            className="h-auto w-full max-w-[451px]"
          />
        </div>

        {/* mm:2167:9034 (Frame 523) */}
        <div className="flex flex-col gap-4">
          {countdown}
          <EventDetails
            eventDateLabel={eventDateLabel}
            eventDate={eventDate}
            eventVenueLabel={eventVenueLabel}
            eventVenue={eventVenue}
            livestreamNote={livestreamNote}
          />
        </div>

        {/* mm:2167:9062 (mms_B3_Call-To-Action) */}
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-10">
          {/* mm:2167:9063 (mms_B3.1_Button-IC About) */}
          <Link
            href={aboutAwardsHref}
            className={`flex w-full items-center justify-center gap-2 rounded-lg bg-[#FFEA9E] px-6 py-4 hover:brightness-95 sm:w-auto ${CTA_TRANSITION} ${CTA_FOCUS_RING}`}
          >
            {/* mm:I2167:9063;186:1935 (Frame 483) */}
            <span className="flex flex-row items-center gap-1">
              {/* mm:I2167:9063;186:1568 */}
              <span className="text-base leading-6 font-bold text-center text-[#00101A] lg:text-[22px] lg:leading-7">
                {aboutAwardsLabel}
              </span>
            </span>
            {/* mm:I2167:9063;186:1766 (MM_MEDIA_Up) */}
            <MaskedIcon
              src="/awards/icon-arrow-up-right.svg"
              className="text-[#00101A]"
            />
          </Link>

          {/* mm:2167:9064 (mms_B3.2_Button-IC Kudos) */}
          <Link
            href={aboutKudosHref}
            className={`flex w-full items-center justify-center gap-2 rounded-lg border border-[#998C5F] bg-[#FFEA9E]/10 px-6 py-4 hover:bg-[#FFEA9E]/20 sm:w-auto ${CTA_TRANSITION} ${CTA_FOCUS_RING}`}
          >
            {/* mm:I2167:9064;186:2758 (Frame 483) */}
            <span className="flex flex-row items-center gap-1">
              {/* mm:I2167:9064;186:2760 */}
              <span className="text-base leading-6 font-bold text-center text-white lg:text-[22px] lg:leading-7">
                {aboutKudosLabel}
              </span>
            </span>
            {/* mm:I2167:9064;186:2761 (MM_MEDIA_Up) */}
            <MaskedIcon
              src="/awards/icon-arrow-up-right.svg"
              className="text-white"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
