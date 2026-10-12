import type { ReactNode } from "react";

/**
 * The label primitives of the "Viết Kudo" card — mm:520:11647.
 *
 * Four rows carry a label (mm component 416:5550 "Title"): Người nhận,
 * Danh hiệu, Hashtag, Image. In Figma each row is a `flex` with `gap: 16px`
 * and an AUTO-WIDTH label, so the controls deliberately do NOT line up in a
 * column — the row's field starts wherever its own label happens to end
 * (x559, x555, x521, x487 on the 1440px artboard). That stagger is visible in
 * the design and is reproduced here rather than regularised into a grid.
 *
 * Below `sm` there is no design reference, so the rows stack: a 22px label
 * beside a field leaves too little room for either on a phone.
 */

const LABEL_TEXT = "text-[22px] leading-7 font-bold text-[#00101A]";

/**
 * mm:416:5534 + mm:416:5547 — the label and its required marker. The asterisk
 * is a separate 16px/20px node in #CF1322 set in Noto Sans JP; it is left to
 * inherit Montserrat here, since a lone "*" glyph is identical between them
 * and loading a second family for one character is not worth the request.
 */
export function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <span className={`flex shrink-0 items-center gap-0.5 ${LABEL_TEXT}`}>
      {children}
      {required ? (
        <span aria-hidden className="self-start text-base leading-5 font-bold text-[#CF1322]">
          *
        </span>
      ) : null}
    </span>
  );
}

/**
 * A labelled row. `align` follows the Figma frame's own `align-items`:
 * `center` for Người nhận / Image, `start` for Hashtag, and `start` for
 * Danh hiệu, whose label is nudged down 14px so it centres on the 56px field
 * while the helper text below stays left-aligned with the field.
 */
export function FieldRow({
  label,
  required,
  align = "center",
  children,
}: {
  label: string;
  required?: boolean;
  align?: "center" | "start";
  children: ReactNode;
}) {
  return (
    <div
      // `items-start` while stacked: without it the column stretches its
      // children, and the shrink-to-fit add buttons ("+ Hashtag", "+ Image")
      // blow out to the full card width on a phone.
      className={`flex w-full flex-col items-start gap-2 sm:flex-row sm:gap-4 ${
        align === "center" ? "sm:items-center" : "sm:items-start"
      }`}
    >
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
    </div>
  );
}
