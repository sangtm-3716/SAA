/**
 * mm:I313:8467;214:2525 (mms_D.1.1_Picture-Award) and its five siblings.
 *
 * A 336x336 glowing ring/podium plate with the award's name set across the
 * middle. The plate itself (`mm_media_Award-Thumb-Background`) is one shared
 * asset across all six cards and is downloaded to `/awards/award-ring.png`.
 *
 * The name is a separate `mm_media_Award-Name-*` overlay in Figma, but only
 * Top Talent's exports with a download URL — the other five resolve to null
 * in `get_media_files`, and the node-level renderer (`get_figma_image`) is
 * returning 500 for this file. Rather than invent five images, cards without
 * an exported overlay set the name as gold gradient type matched to the
 * exported one (same bevelled gold ramp, same glow). The award names
 * themselves still come from the design, not from imagination.
 */
export function AwardThumbnail({
  title,
  plateName,
  nameImage,
}: {
  /** Full award name — used as the plate's accessible label. */
  title: string;
  /**
   * Short form set across the plate. The design letters the plate with the
   * category's short name ("MVP"), not the card heading ("MVP (Most Valuable
   * Person)"), which would not fit inside the ring.
   */
  plateName: string;
  nameImage?: string;
}) {
  return (
    <div className="relative aspect-square w-full max-w-[336px] shrink-0 self-center lg:w-[336px] lg:self-start">
      {/* mm:…;81:2442 (mm_media_Award-Thumb-Background) — 24px radius,
          1px #FFEA9E hairline, outer gold bloom */}
      <img
        src="/awards/award-ring.png"
        alt=""
        aria-hidden
        width={336}
        height={336}
        className="size-full rounded-3xl border border-[#FFEA9E] object-cover shadow-[0_4px_4px_0_rgba(0,0,0,0.25),0_0_6px_0_#FAE287]"
      />

      {/* mm:…;214:666 (mm_media_Award-Name-*) — centred inside the ring */}
      <div className="absolute inset-0 flex items-center justify-center px-[14%]">
        {nameImage ? (
          <img
            src={nameImage}
            alt={title}
            className="w-[66%] object-contain drop-shadow-[0_0_6px_rgba(250,226,135,0.6)]"
          />
        ) : (
          <span
            aria-label={title}
            className="bg-gradient-to-b from-[#FFF6D0] via-[#E8B84B] to-[#9C6B22] bg-clip-text text-center text-xl leading-tight font-bold tracking-[0.02em] text-transparent uppercase drop-shadow-[0_0_6px_rgba(250,226,135,0.45)] sm:text-2xl"
            // Keeps the glow readable on the dark plate; the gradient fill
            // alone washes out at this size without it.
            style={{ WebkitTextStroke: "0.4px rgba(255,246,208,0.35)" }}
          >
            {plateName}
          </span>
        )}
      </div>
    </div>
  );
}
