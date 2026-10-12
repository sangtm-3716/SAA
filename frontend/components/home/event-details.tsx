/**
 * Event date / venue / livestream line — mm:2167:9053 (mms_B2_Thông tin sự
 * kiện), inside the hero (mm:2167:9031 "Frame 487").
 *
 * The date pair (mm:2167:9055 "Group 417") and venue pair (mm:2167:9058
 * "Group 418") are Figma GROUP nodes, not auto-layout frames, so neither
 * defines an `itemSpacing` token for the label→value gap. Measuring the
 * groups' own absolute child positions gives a 4px gap for the date pair
 * and a 6px gap for the venue pair — kept as the two distinct, exact
 * numbers from the design rather than forced to one shared value.
 */

interface EventDetailsProps {
  /** mm:2167:9056 — e.g. "Thời gian: " */
  eventDateLabel: string;
  /** mm:2167:9057 — e.g. "26/12/2025" */
  eventDate: string;
  /** mm:2167:9060 — e.g. "Địa điểm:" */
  eventVenueLabel: string;
  /** mm:2167:9059 — e.g. "Âu Cơ Art Center" */
  eventVenue: string;
  /** mm:2167:9061 — e.g. "Tường thuật trực tiếp qua sóng Livestream" */
  livestreamNote: string;
}

export function EventDetails({
  eventDateLabel,
  eventDate,
  eventVenueLabel,
  eventVenue,
  livestreamNote,
}: EventDetailsProps) {
  return (
    // mm:2167:9053 (mms_B2_Thông tin sự kiện)
    <div className="flex flex-col items-start gap-2">
      {/* mm:2167:9054 (Frame 522) */}
      <div className="flex flex-row flex-wrap items-center gap-x-[60px] gap-y-2">
        {/* mm:2167:9055 (Group 417) */}
        <div className="flex flex-row items-baseline gap-[4px]">
          {/* mm:2167:9056 */}
          <span className="text-sm leading-5 font-bold tracking-[0.15px] text-white lg:text-base lg:leading-6">
            {eventDateLabel}
          </span>
          {/* mm:2167:9057 */}
          <span className="text-lg leading-7 font-bold text-[#FFEA9E] lg:text-2xl lg:leading-8">
            {eventDate}
          </span>
        </div>
        {/* mm:2167:9058 (Group 418) */}
        <div className="flex flex-row items-baseline gap-[6px]">
          {/* mm:2167:9060 */}
          <span className="text-sm leading-5 font-bold tracking-[0.15px] text-white lg:text-base lg:leading-6">
            {eventVenueLabel}
          </span>
          {/* mm:2167:9059 */}
          <span className="text-lg leading-7 font-bold text-[#FFEA9E] lg:text-2xl lg:leading-8">
            {eventVenue}
          </span>
        </div>
      </div>
      {/* mm:2167:9061 */}
      <p className="text-sm leading-5 font-bold tracking-[0.5px] text-white lg:text-base lg:leading-6">
        {livestreamNote}
      </p>
    </div>
  );
}
