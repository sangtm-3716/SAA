import type { ReactNode } from "react";
import { MaskedIcon } from "@/components/awards/masked-icon";
import type { BoardStats, GiftClaim } from "@/lib/kudos/types";
import { GiftClaimList } from "./gift-claim-list";

/** One "label .... value" row shared by all five stat rows — component `256:6756`. */
function StatRow({ label, value, icon }: { label: string; value: number; icon?: ReactNode }) {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <span className="text-right text-[22px] leading-7 font-bold text-white">{label}</span>
      <span className="flex items-center gap-2">
        {icon}
        <span className="text-right text-[32px] leading-10 font-bold text-[#FFEA9E]">{value}</span>
      </span>
    </div>
  );
}

/**
 * mm:2940:13488 (D_Thống menu phải) — the right rail: the stats box
 * (mm:2940:13489, D.1) and the gift-claim list (mm:2940:13510, D.3).
 * Fixed 422px on large screens like the design, full width below `lg`
 * where it drops under the feed; sticks under the viewport top on large
 * screens so it tracks the feed as it scrolls.
 */
export function BoardStatsRail({
  stats,
  giftClaims,
  labels,
}: {
  stats: BoardStats;
  giftClaims: GiftClaim[];
  labels: {
    received: string;
    sent: string;
    hearts: string;
    boxesOpened: string;
    boxesUnopened: string;
    openBoxCta: string;
    giftTitle: string;
  };
}) {
  return (
    <aside className="flex w-full flex-col items-start gap-6 lg:max-w-[422px] lg:sticky lg:top-24">
      {/* mm:2940:13489 (D.1_Thống kê tổng quat) */}
      <div className="flex w-full flex-col items-start gap-2.5 rounded-[17px] border border-[#998C5F] bg-[#00070C] p-6">
        <div className="flex w-full flex-col items-center justify-center gap-4">
          {/* mm:2940:13491 (D.1.2_Số kudos nhận được) */}
          <StatRow label={labels.received} value={stats.received} />
          {/* mm:2940:13492 (D.1.3_Số kudos đã gửi) */}
          <StatRow label={labels.sent} value={stats.sent} />
          {/* mm:3241:14882 (D.1.4_Số tim) — the heart icon carries a static
              "x2" multiplier badge baked into the design (mm:3241:14931/14933);
              no separate asset was downloaded for it, so it's composited here
              from the already-fetched heart icon plus the literal "x2" text. */}
          <StatRow
            label={labels.hearts}
            value={stats.hearts}
            icon={
              <span className="relative inline-flex size-8 shrink-0 items-center justify-center">
                <MaskedIcon src="/kudos/icon-heart.svg" size={32} className="text-[#D4271D]" />
                <span
                  aria-hidden
                  className="absolute text-[10px] font-bold text-white"
                  style={{ WebkitTextStroke: "0.5px #000" }}
                >
                  x2
                </span>
              </span>
            }
          />
          {/* mm:2940:13494 (D.1.5_phân cách nội dung) */}
          <div className="h-px w-full bg-[#2E3940]" />
          {/* mm:2940:13495 (D.1.6_Số secret box đã mở) */}
          <StatRow label={labels.boxesOpened} value={stats.secretBoxesOpened} />
          {/* mm:2940:13496 (D.1.7_Số secret box chưa mở) */}
          <StatRow label={labels.boxesUnopened} value={stats.secretBoxesUnopened} />
          {/* mm:2940:13497 (D.1.8_Button mở quà) */}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FFEA9E] p-4 text-[22px] leading-7 font-bold text-[#00101A] transition-colors duration-200 ease-out hover:bg-[#FFF3C4] motion-reduce:transition-none"
          >
            {labels.openBoxCta}
            <MaskedIcon src="/kudos/icon-gift.svg" size={24} />
          </button>
        </div>
      </div>

      {/* mm:2940:13510 (D.3_10 SUNNER nhận quà) */}
      <GiftClaimList title={labels.giftTitle} claims={giftClaims} />
    </aside>
  );
}
