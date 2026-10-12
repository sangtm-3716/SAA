import Link from "next/link";
import type { HomeAwardTile } from "@/lib/home/home-award-tiles";
import { MaskedIcon } from "@/components/awards/masked-icon";

/**
 * mm:2167:9075 (mms_C2.1_Top Talent Award) and its five siblings
 * (2167:9076/9077/9079/9080/9081) — same `214:1032` component, one instance
 * per award.
 *
 * A 336x336 ring plate (shared `MM_MEDIA_Award BG` asset, mix-blend-mode
 * screen per mm:I2167:9075;214:1019) with the award-name PNG centred over it
 * at its own intrinsic aspect ratio, followed by a title, a one-line
 * description, and a "Chi tiết" text link with an up-right arrow
 * (mm:…;214:1023, mms_C2.x.4_Button-IC).
 */
export function AwardTile({
  tile,
  detailLabel,
}: {
  tile: HomeAwardTile;
  detailLabel: string;
}) {
  const { title, description, nameImage, nameImageWidth, nameImageHeight, href } =
    tile;

  return (
    <div
      data-testid={`home-award-tile-${tile.id}`}
      className="flex w-full flex-col gap-6 transition-transform duration-200 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* mm:…;214:1019 (mms_C2.x.1_Picture-Award) */}
      <div className="relative aspect-square w-full">
        {/* mm:…;81:2442 (MM_MEDIA_Award BG) — 24px radius, 0.955px #FFEA9E hairline, gold bloom */}
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed shared ring artwork, no responsive variants needed */}
        <img
          src="/home/award-ring.png"
          alt=""
          aria-hidden
          className="mix-blend-screen size-full rounded-[24px] border-[0.955px] border-[#FFEA9E] object-cover shadow-[0_4px_4px_0_rgba(0,0,0,0.25),0_0_6px_0_#FAE287]"
        />

        {/* mm:…;214:666 (Awards-Name) — centred inside the ring at its own aspect ratio */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative"
            style={{
              width: `${(nameImageWidth / 336) * 100}%`,
              aspectRatio: `${nameImageWidth} / ${nameImageHeight}`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- award-name overlay, intrinsic size varies per tile */}
            <img
              src={nameImage}
              alt={title}
              className="size-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* mm:…;214:1020 (Frame 490) */}
      <div className="flex flex-col gap-1">
        {/* mm:…;214:1021 (mms_C2.x.2_*) — 24px/32px, weight 400, #FFEA9E */}
        <h3 className="text-2xl leading-8 font-normal text-[#FFEA9E]">
          {title}
        </h3>
        {/* mm:…;214:1022 (mms_C2.x.3_*) — 16px/24px, weight 400, .5px, white */}
        <p className="text-base leading-6 font-normal tracking-[0.5px] text-white">
          {description}
        </p>
        {/* mm:…;214:1023 (mms_C2.x.4_Button-IC) — text_link buttonType */}
        <Link
          href={href}
          className="group/link flex w-fit items-center gap-1 py-4 text-base leading-6 font-medium tracking-[0.15px] text-white transition-colors duration-200 ease-out hover:text-[#FFEA9E] focus-visible:text-[#FFEA9E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] motion-reduce:transition-none"
        >
          {detailLabel}
          {/* mm:…;186:1441 (MM_MEDIA_Up) */}
          <MaskedIcon
            src="/awards/icon-arrow-up-right.svg"
            className="transition-transform duration-200 ease-out group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover/link:translate-x-0 motion-reduce:group-hover/link:translate-y-0"
          />
        </Link>
      </div>
    </div>
  );
}
