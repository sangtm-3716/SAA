import type { GiftClaim } from "@/lib/kudos/types";

/**
 * mm:2940:13510 (D.3_10 SUNNER nhận quà) — the gift-claim list card in the
 * right rail. Each row is an instance of component `256:7474`
 * (mm:2940:13516..13520). The design shows 5 rows at a time inside a
 * 384px-tall region (mm:2940:13514, Frame 547) next to a thin grey Figma
 * scrollbar mock (mm:2940:13521, Frame 545); the native scroll affordance
 * here stands in for that mock rather than reproducing it pixel-for-pixel.
 */
export function GiftClaimList({ title, claims }: { title: string; claims: GiftClaim[] }) {
  return (
    // mm:2940:13510
    <div className="flex w-full flex-col items-start gap-2.5 self-stretch rounded-[17px] border border-[#998C5F] bg-[#00070C] py-6 pr-4 pl-6">
      <div className="flex w-full flex-col items-center gap-4">
        {/* mm:2940:13513 (D.3.1_title) */}
        <p className="w-full text-center text-[22px] leading-7 font-bold whitespace-pre-line text-[#FFEA9E]">
          {title}
        </p>

        {/* mm:2940:13514 (Frame 547) */}
        <div className="flex max-h-[384px] w-full flex-col items-start gap-4 overflow-y-auto">
          {claims.map((claim) => (
            // mm:2940:13516 (D.3.2_Thông tin Sunner nhận quà)
            <div key={claim.id} className="flex w-full items-center gap-2">
              {/* mm:…;256:7460 (MM_MEDIA_Avatar) */}
              <img
                src={claim.avatarUrl ?? "/kudos/avatar-sunner.png"}
                alt={claim.sunnerName}
                width={64}
                height={64}
                className="size-16 shrink-0 rounded-full border-[1.869px] border-white object-cover"
              />
              {/* mm:…;256:7461 (Frame 520) */}
              <div className="flex min-w-0 flex-col items-start gap-0.5">
                {/* mm:…;256:7462 (Name) */}
                <p className="w-full truncate text-[22px] leading-7 font-bold text-[#FFEA9E]">
                  {claim.sunnerName}
                </p>
                {/* mm:…;256:7472 */}
                <p className="w-full truncate text-base leading-6 font-bold tracking-[0.15px] text-white">
                  {claim.rewardLabel}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
