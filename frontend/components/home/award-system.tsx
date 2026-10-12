import { HOME_AWARD_TILES } from "@/lib/home/home-award-tiles";
import { AwardTile } from "./award-tile";

/**
 * mm:2167:9068 (Hệ thống giải thưởng) on screen `i87tDx10uM`, inside the
 * "Bìa" artboard (mm:2167:9030).
 *
 * mm:2167:9069 (mms_C1_Header Giải thưởng) — eyebrow + rule + heading.
 * mm:5005:14974 (mms_C2_Award list) — the 6-tile award grid, originally two
 * fixed 3-up rows (mm:2167:9074 Frame 491, mm:2167:9078 Frame 493). Flattened
 * into one responsive CSS grid here; at the design's 1224px content width
 * with a 108px column gap this reproduces the exact 3x336px row from Figma
 * (justify-content: space-between over three 336px tiles in a 1224px frame).
 */
export function AwardSystem({
  eyebrow,
  heading,
  detailLabel,
}: {
  /** mm:2167:9070 — "Sun* annual awards 2025" */
  eyebrow: string;
  /** mm:2167:9073 — "Hệ thống giải thưởng" */
  heading: string;
  /** mm:…;214:1023 label — "Chi tiết" */
  detailLabel: string;
}) {
  return (
    <section data-testid="home-award-system" className="w-full">
      <div className="mx-auto flex w-full max-w-[1224px] flex-col items-start gap-20 px-4 sm:px-6 md:px-9 lg:px-12 xl:px-0">
        {/* mm:2167:9069 (mms_C1_Header Giải thưởng) */}
        <div className="flex w-full flex-col items-start gap-4">
          {/* mm:2167:9070 — 24px/32px, weight 700, white */}
          <p className="text-2xl leading-8 font-bold text-white">{eyebrow}</p>
          {/* mm:2167:9071 (Rectangle 26) */}
          <div className="h-px w-full bg-[#2E3940]" />
          {/* mm:2167:9072 (Frame 488) */}
          <div className="flex w-full flex-row items-center gap-8">
            {/* mm:2167:9073 — 57px/64px, weight 700, -0.25px, #FFEA9E.
                The literal size lands at `lg`; below it the heading is
                stepped down, because at 57px "Hệ thống giải thưởng" breaks
                across three lines on a 375px screen. Figma has no mobile
                frame for this screen to copy these steps from. */}
            <h2 className="text-[34px] leading-10 font-bold tracking-[-0.25px] text-[#FFEA9E] sm:text-[44px] sm:leading-[52px] lg:text-[57px] lg:leading-[64px]">
              {heading}
            </h2>
          </div>
        </div>

        {/* mm:5005:14974 (mms_C2_Award list) */}
        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-[108px] lg:gap-y-20">
          {HOME_AWARD_TILES.map((tile) => (
            <AwardTile key={tile.id} tile={tile} detailLabel={detailLabel} />
          ))}
        </div>
      </div>
    </section>
  );
}
