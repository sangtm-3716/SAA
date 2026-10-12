import { BADGE_IMAGE, BADGE_LABEL, type KudosSunner } from "@/lib/kudos/types";

/**
 * One party block on a kudos post card — mm:…;256:4858 (sender) /
 * mm:…;256:4860 (recipient), both instances of component `256:4830`.
 *
 * 64px round avatar, then a column holding the 16px/24px bold name and the
 * "Huy hiệu + Sao" row: the 14px/20px grey member code, a 4px dot
 * separator, and the badge pill. The pill ships as a baked PNG
 * (`BADGE_IMAGE`) rather than rebuilt from the gradient/text layers under
 * component set `3007:17505` — same approach `kudos-block.tsx` uses for
 * raster marks.
 */
export function SunnerChip({ sunner }: { sunner: KudosSunner }) {
  return (
    // mm:…;256:4830 (C.3.1 / C.3.3 — Thông tin người gửi/nhận)
    <div className="flex w-full max-w-[235px] flex-1 flex-col items-center justify-center gap-[13px]">
      {/* mm:…;256:4734 (MM_MEDIA_Avatar) */}
      <img
        src={sunner.avatarUrl ?? "/kudos/avatar-sunner.png"}
        alt={sunner.name}
        width={64}
        height={64}
        className="size-16 shrink-0 rounded-full border-[1.869px] border-white object-cover"
      />
      {/* mm:…;256:4737 (Frame 477) */}
      <div className="flex w-full flex-col items-center gap-0.5">
        {/* mm:…;256:4735 — 16px/24px, weight 700, .15px, #00101A */}
        <p className="w-full truncate text-center text-base leading-6 font-bold tracking-[0.15px] text-[#00101A]">
          {sunner.name}
        </p>
        {/* mm:…;256:4741 (Huy hiệu + Sao) — visual order is code, dot, badge */}
        <div className="flex items-center justify-center gap-2.5">
          {/* mm:…;256:4751 — 14px/20px, .1px, #999 */}
          <span className="text-sm leading-5 font-bold tracking-[0.1px] text-[#999999]">
            {sunner.code}
          </span>
          {/* mm:…;256:4754 (Ellipse 70) */}
          <span aria-hidden className="size-1 shrink-0 rounded-full bg-[#999999] opacity-40" />
          {/* mm:…;3106:17694 (MM_MEDIA_New/Rising/Legend Hero) */}
          <img src={BADGE_IMAGE[sunner.badge]} alt={BADGE_LABEL[sunner.badge]} className="h-5 w-auto" />
        </div>
      </div>
    </div>
  );
}
