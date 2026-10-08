import type { AwardCategory } from "@/lib/awards/award-categories";
import { AwardThumbnail } from "./award-thumbnail";
import { MaskedIcon } from "./masked-icon";

/**
 * mm:313:8467 / 313:8468 / … (mms_D.1–D.6)
 *
 * One award card: a 336px plate beside a 480px content column holding the
 * title, body copy, a quantity row and one or two prize rows, each pair
 * separated by a 1px #2E3940 rule.
 *
 * The plate alternates sides down the page — image-left on the odd cards
 * (D.1, D.3, D.5) and image-right on the even ones (D.2, D.4, D.6), which
 * matches the two component variants in the Figma component set 214:2647.
 * On narrow viewports every card stacks plate-first so the reading order
 * stays consistent regardless of which variant it is.
 *
 * Paragraphs are split on blank lines because two of the six descriptions
 * (Signature 2025 and MVP) carry a real paragraph break in the design.
 */
export function AwardCard({
  category,
  labels,
  reversed,
  showDivider,
}: {
  category: AwardCategory;
  labels: { quantity: string; prize: string; or: string };
  reversed: boolean;
  showDivider: boolean;
}) {
  const {
    id,
    navLabel,
    title,
    description,
    quantity,
    quantityUnit,
    prizes,
    nameImage,
  } = category;

  return (
    <article
      id={id}
      data-testid={`award-card-${id}`}
      className="flex scroll-mt-24 flex-col gap-20"
    >
      {/* mm:…;214:2803 (Frame 506) / 214:2928 (Frame 507) */}
      <div
        className={`flex flex-col gap-10 lg:flex-row lg:items-start ${
          reversed ? "lg:flex-row-reverse" : ""
        }`}
      >
        <AwardThumbnail
          title={title}
          plateName={navLabel}
          nameImage={nameImage}
        />

        {/* mm:…;214:2526 (mms_D.x.2_Content) */}
        <div className="flex flex-1 flex-col gap-8 lg:max-w-[480px]">
          {/* mm:…;214:2527 (content) */}
          <div className="flex flex-col gap-6">
            {/* mm:…;214:2528 (Frame 442) */}
            <h2 className="flex items-center gap-4 text-2xl leading-8 font-bold text-[#FFEA9E]">
              <MaskedIcon src="/awards/icon-target.svg" />
              {title}
            </h2>
            {/* mm:…;214:2531 — 16px/24px, .5px, justified, white */}
            <div className="flex flex-col gap-4 text-justify text-base leading-6 font-bold tracking-[0.5px] text-white">
              {description.split("\n\n").map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* mm:…;214:2532 (Rectangle 8) */}
          <div className="h-px w-full bg-[#2E3940]" />

          {/* mm:…;214:2533 — "Số lượng giải thưởng:" */}
          <div className="flex flex-wrap items-center gap-4">
            <h3 className="flex items-center gap-4 text-2xl leading-8 font-bold text-[#FFEA9E]">
              <MaskedIcon src="/awards/icon-diamond.svg" />
              {labels.quantity}
            </h3>
            {/* mm:…;214:3552 (Số lượng) — figure 36px, unit 14px beside it */}
            <p className="flex items-center gap-2 font-bold text-white">
              <span className="text-4xl leading-11">{quantity}</span>
              <span className="max-w-[80px] text-sm leading-5 tracking-[0.1px]">
                {quantityUnit}
              </span>
            </p>
          </div>

          {/* mm:…;214:2539 */}
          <div className="h-px w-full bg-[#2E3940]" />

          {/* mm:…;214:2540 (Frame 444) — one block per prize tier */}
          {prizes.map((prize, index) => (
            <div key={prize.value} className="flex flex-col gap-4">
              {/* mm:313:8499 — the "Hoặc" separator on Signature 2025 */}
              {index > 0 ? (
                <p className="text-sm leading-5 font-bold tracking-[0.1px] text-white">
                  {labels.or}
                </p>
              ) : null}
              {/* mm:…;214:2542 (Frame 497) */}
              <h3 className="flex items-center gap-4 text-2xl leading-8 font-bold text-[#FFEA9E]">
                <MaskedIcon src="/awards/icon-license.svg" />
                {labels.prize}
              </h3>
              {/* mm:…;214:2546 — 36px/44px white */}
              <p className="text-4xl leading-11 font-bold text-white">
                {prize.value}
              </p>
              {/* mm:…;214:2547 — 14px/20px, .1px */}
              {prize.note ? (
                <p className="text-sm leading-5 font-bold tracking-[0.1px] text-white">
                  {prize.note}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* mm:…;214:2771 (Rectangle 14) — omitted after the last card */}
      {showDivider ? <div className="h-px w-full bg-[#2E3940]" /> : null}
    </article>
  );
}
