import Link from "next/link";
import { CloseIcon, SendIcon } from "./compose-icons";

/**
 * The card footer — mm:I520:11647;520:9905 (mms_H_Frame 538).
 *
 * Two buttons, 60px tall, 24px apart, on a 146px / 502px split of the 672px
 * column. They are NOT the same component: Hủy is the outlined secondary
 * (186:2757 — #998C5F hairline over a 10%-opacity #FFEA9E wash, 4px radius,
 * 16px label) and Gửi is the filled primary (186:1567 — solid #FFEA9E, 8px
 * radius, 22px label). The differing radii are the design's, not a slip.
 *
 * Hủy is a link rather than a button: cancelling a compose returns to the
 * Kudos board, which is navigation, and a link keeps that working without
 * client JavaScript. Gửi is the form's submit.
 */
export function ComposeActions({
  cancelLabel,
  submitLabel,
  cancelHref,
  pending = false,
}: {
  cancelLabel: string;
  submitLabel: string;
  cancelHref: string;
  /** Disables submit while the action is in flight, so one click posts once. */
  pending?: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row sm:gap-6">
      {/* mm:I520:11647;520:9906 (mms_H.1_Button) */}
      <Link
        href={cancelHref}
        className="flex h-15 shrink-0 items-center justify-center gap-2 rounded border border-[#998C5F] bg-[#FFEA9E]/10 px-10 text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] transition-colors duration-200 ease-out hover:bg-[#FFEA9E]/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#998C5F] motion-reduce:transition-none"
      >
        {cancelLabel}
        {/* mm:I520:11647;520:9906;186:2761 (MM_MEDIA_Close) */}
        <CloseIcon className="size-6" />
      </Link>

      {/* mm:I520:11647;520:9907 (mms_H.2_Button) */}
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending || undefined}
        className="flex h-15 min-w-0 grow basis-0 items-center justify-center gap-2 rounded-lg bg-[#FFEA9E] p-4 text-[22px] leading-7 font-bold text-[#00101A] transition-colors duration-200 ease-out hover:bg-[#FFE27E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#FFEA9E] motion-reduce:transition-none"
      >
        {submitLabel}
        {/* mm:I520:11647;520:9907;186:1766 (MM_MEDIA_Send) */}
        <SendIcon className="size-6" />
      </button>
    </div>
  );
}
