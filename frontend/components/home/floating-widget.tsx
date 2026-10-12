import Link from "next/link";
import { MaskedIcon } from "@/components/awards/masked-icon";

/**
 * mm:5022:15169 (mms_6_Widget Button) — the floating pill on the right edge
 * of the Homepage SAA screen, holding two quick-action icon buttons: "viết
 * kudos" (pen, mm:I5022:15169;214:3839;186:1763) and "thể lệ SAA" (kudos
 * mark, mm:I5022:15169;214:3839;186:1766;214:3762).
 *
 * In the 1512px-wide Figma artboard this sits at `top: 830px; right: 19px`
 * absolute inside the hero section ("Bìa"), which is itself ~4220px tall.
 * The spec calls for it to "float above content on scroll", so it renders
 * `fixed` to the viewport (not tied to that document-flow offset) rather
 * than `absolute` inside the page — the 19px right inset is kept verbatim,
 * the vertical anchor is re-based to the viewport centre so it tracks
 * scrolling instead of a single in-page position.
 *
 * The pen icon is a plain white-fill mono glyph (`icon-pen.svg`) recoloured
 * via `MaskedIcon` to #00101A, matching the dark ink of the "/" divider
 * beside it (mm:I5022:15169;214:3839;186:1568, `color: rgba(0,16,26,1)`) on
 * the gold (#FFEA9E) pill. The kudos mark is multi-colour, so it renders as
 * a plain `<img>` per code-rules.md 2a instead of a masked icon.
 *
 * Hidden below `sm` so it never overlaps the narrow mobile reading column.
 *
 * Figma records no `on_click` for either icon, so the destinations are taken
 * from the two routes the site footer already publishes for the same two
 * topics: `/kudos` for the Kudos action and `/criteria` for the SAA rules.
 */
export function FloatingWidget({
  writeKudosLabel,
  writeKudosHref = "/kudos",
  rulesLabel,
  rulesHref = "/criteria",
}: {
  writeKudosLabel: string;
  writeKudosHref?: string;
  rulesLabel: string;
  rulesHref?: string;
}) {
  return (
    // mm:5022:15169 (mms_6_Widget Button)
    <div
      data-testid="floating-widget"
      className="fixed top-1/2 right-0 z-50 hidden -translate-y-1/2 sm:right-[19px] sm:block"
    >
      {/* mm:I5022:15169;214:3839 (Button) */}
      <div
        className="flex items-center gap-2 rounded-full bg-[#FFEA9E] p-4 shadow-[0_4px_4px_0_rgba(0,0,0,0.25),0_0_6px_0_#FAE287]"
      >
        {/* mm:I5022:15169;214:3839;186:1935 (icon viết kudos) */}
        <Link
          href={writeKudosHref}
          aria-label={writeKudosLabel}
          className="flex items-center gap-2 rounded-full p-1 transition-colors duration-200 ease-out hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00101A] motion-reduce:transition-none"
        >
          {/* mm:I5022:15169;214:3839;186:1763 (MM_MEDIA_Pen) */}
          <MaskedIcon src="/home/icon-pen.svg" className="text-[#00101A]" />
          {/* mm:I5022:15169;214:3839;186:1568 — "/" divider, 24px/32px bold */}
          <span aria-hidden className="text-2xl leading-8 font-bold text-[#00101A]">
            /
          </span>
        </Link>

        {/* mm:I5022:15169;214:3839;186:1766 (icon thể lệ saa) */}
        <Link
          href={rulesHref}
          aria-label={rulesLabel}
          className="flex items-center rounded-full p-1 transition-colors duration-200 ease-out hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00101A] motion-reduce:transition-none"
        >
          {/* mm:I5022:15169;214:3839;186:1766;214:3762 (MM_MEDIA_Kudos Logo) — multi-colour, plain img */}
          {/* eslint-disable-next-line @next/next/no-img-element -- small multi-colour glyph, no responsive variants needed */}
          <img
            src="/home/icon-kudos-mark.svg"
            alt=""
            width={20}
            height={18}
            className="h-[18px] w-5"
          />
        </Link>
      </div>
    </div>
  );
}
