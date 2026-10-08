import { KUDOS_BODY } from "@/lib/awards/award-categories";
import { MaskedIcon } from "./masked-icon";

/**
 * mm:335:12023 (mms_D1_Sunkudos)
 *
 * Promotional block for the Sun* Kudos recognition programme: a 1152x500
 * rounded panel over a dark artwork background, with the copy on the left
 * and the Kudos logo on the right.
 *
 * Spec D2.1 gives the CTA an `on_click` that opens the Sun* Kudos page, so
 * it renders as a real link rather than a button — it navigates, and the
 * browser's own affordances (middle-click, open-in-new-tab) should work.
 *
 * The body's first line ("ĐIỂM MỚI CỦA SAA 2025") is a lead-in inside a
 * single Figma text node, kept on its own line as the design has it.
 */
export function KudosBlock({
  eyebrow,
  title,
  ctaLabel,
  ctaHref,
}: {
  eyebrow: string;
  title: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  const [lead, ...rest] = KUDOS_BODY.split("\n");

  return (
    <section
      data-testid="kudos-block"
      className="relative mx-auto w-full max-w-[1152px] overflow-hidden rounded-2xl bg-[#0F0F0F]"
    >
      {/* mm:I335:12023;313:8416 (MM_MEDIA_Kudos Background) */}
      <img
        src="/awards/kudos-background.png"
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover"
      />

      <div className="relative flex flex-col items-start gap-10 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:p-16">
        {/* mm:I335:12023;313:8419 (mms_D2_Content) */}
        <div className="flex max-w-[470px] flex-col gap-8">
          <div className="flex flex-col gap-4">
            {/* mm:…;313:8421 — 24px/32px white */}
            <p className="text-2xl leading-8 font-bold text-white">{eyebrow}</p>
            {/* mm:…;313:8422 — 57px/64px, -0.25px, gold */}
            <p className="text-4xl leading-tight font-bold tracking-[-0.25px] text-[#FFEA9E] xl:text-[57px] xl:leading-16">
              {title}
            </p>
            {/* mm:…;313:8423 — 16px/24px, .5px, justified */}
            <div className="flex flex-col text-justify text-base leading-6 font-bold tracking-[0.5px] text-white">
              <p>{lead}</p>
              <p>{rest.join("\n")}</p>
            </div>
          </div>

          {/* mm:…;313:8426 (mms_D2.1_Button-IC) — gold fill, 4px radius */}
          <a
            href={ctaHref}
            data-testid="kudos-cta"
            className="inline-flex w-fit items-center gap-2 rounded bg-[#FFEA9E] p-4 text-base leading-6 font-bold text-[#00101A] transition-colors hover:bg-[#FFF3C4]"
          >
            {ctaLabel}
            <MaskedIcon src="/awards/icon-arrow-up-right.svg" />
          </a>
        </div>

        {/* mm:I335:12023;329:2948 (MM_MEDIA_Logo/Kudos) — mark + wordmark
            ship together as one 383x74 vector, so no SVN-Gotham webfont. */}
        <img
          src="/awards/kudos-logo-mark.svg"
          alt="Sun* Kudos"
          width={383}
          height={74}
          className="w-[220px] max-w-full shrink-0 sm:w-[300px] lg:w-[383px]"
        />
      </div>
    </section>
  );
}
