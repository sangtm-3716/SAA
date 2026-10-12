"use client";

import { BADGE_IMAGE, BADGE_LABEL, type KudosPost, type KudosSunner } from "@/lib/kudos/types";
import { MaskedIcon } from "@/components/awards/masked-icon";
import { MessageText } from "./message-text";
import { HeartButton } from "./heart-button";

/**
 * mm:2940:13464 / mm:2940:13465 / mm:2940:13466 ("KUDO - Highlight", instance
 * `335:9620`) — the compact carousel card rendered three-up in
 * `highlight-carousel.tsx`. This is NOT the big feed card at mm:3127:21871;
 * that one belongs to phase 06's `kudos-post-card.tsx` — do not confuse them.
 */
export function HighlightCard({
  post,
  copyLinkLabel,
  detailLabel,
  anonymousLabel,
  heartLabels,
  className = "",
}: {
  post: KudosPost;
  /** mm:…;186:1439 — "Copy Link". */
  copyLinkLabel: string;
  /** mm:…;186:1439 — "Xem chi tiết". */
  detailLabel: string;
  /** mm:…;256:4735 fallback name shown when `post.sender` is masked anonymous. */
  anonymousLabel: string;
  /** mm:I2940:13465;335:9462 — accessible names for the heart's two states. */
  heartLabels: { like: string; unlike: string };
  className?: string;
}) {
  async function handleCopyLink() {
    if (typeof window === "undefined") return;
    // Hash, not `?kudos=`: every feed card renders `id={post.id}`, so this
    // link actually jumps to the post on load. A query parameter would have
    // needed scroll handling that does not exist, and would also have
    // disagreed with the identical button on the feed card.
    const url = `${window.location.origin}/kudos#${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard permission can be denied by the browser; the design has no
      // error state for this card, so this fails silently.
    }
  }

  return (
    // mm:2940:13465 ("KUDO - Highlight")
    <article
      data-testid="kudos-highlight-card"
      className={`flex w-full max-w-[528px] flex-col gap-4 rounded-2xl border-4 border-[#FFEA9E] bg-[#FFF8E1] p-6 pb-4 ${className}`}
    >
      {/* mm:I2940:13465;335:9442 (Frame 482) */}
      <div className="flex w-full items-start justify-between gap-6">
        <PersonInfo sunner={post.sender} anonymousLabel={anonymousLabel} />
        {/* mm:I2940:13465;335:9444 (B.3.4_Icon mũi tên) */}
        <MaskedIcon src="/kudos/icon-send.svg" size={32} className="mt-4 shrink-0 text-[#00101A]" />
        <PersonInfo sunner={post.recipient} anonymousLabel={anonymousLabel} />
      </div>

      {/* mm:I2940:13465;335:9447 (Rectangle 14) */}
      <div className="h-px w-full bg-[#FFEA9E]" />

      {/* mm:I2940:13465;335:9448 (B.4_Nội dung lời cảm ơn) */}
      <div className="flex w-full flex-col items-end gap-4">
        {/* mm:I2940:13465;335:9449 (B.4.1_Thời gian đăng) */}
        <p className="w-full text-left text-base leading-6 font-bold tracking-[0.5px] text-[#999999]">
          {formatPostedAt(post.createdAt)}
        </p>
        {/* mm:I2940:13465;1810:19718 */}
        {post.title && (
          <p className="w-full text-center text-base leading-6 font-bold tracking-[0.5px] text-[#00101A]">
            {post.title}
          </p>
        )}
        {/* mm:I2940:13465;662:12221 (Frame 425) */}
        <div className="flex w-full items-center rounded-xl border border-[#FFEA9E] bg-[rgba(255,234,158,0.4)] px-6 py-4">
          {/* mm:I2940:13465;662:12223 */}
          <MessageText
            text={post.message}
            className="line-clamp-2 w-full text-justify text-xl leading-8 font-bold text-[#00101A]"
          />
        </div>
        {/* mm:I2940:13465;335:9459 (B.4.3_Hashtag) */}
        <p className="w-full truncate text-base leading-6 font-bold tracking-[0.5px] text-[#D4271D]">
          {post.hashtags.map((tag) => `#${tag}`).join(" ")}
        </p>
      </div>

      {/* mm:I2940:13465;335:9460 (Rectangle 15) */}
      <div className="h-px w-full bg-[#FFEA9E]" />

      {/* mm:I2940:13465;335:9461 (B.4.4_Action) */}
      <div className="flex w-full items-center justify-between gap-6">
        {/* mm:I2940:13465;335:9462 (Hearts) */}
        <HeartButton
          postId={post.id}
          hearts={post.hearts}
          heartedByMe={post.heartedByMe}
          formatCount={(value) => value.toLocaleString("vi-VN")}
          labels={heartLabels}
        />
        {/* mm:I2940:13465;335:9672 (Buttons) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex cursor-pointer items-center gap-1 rounded p-4 text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] transition-colors duration-200 ease-out hover:bg-black/5 motion-reduce:transition-none"
          >
            {copyLinkLabel}
            {/* mm:I2940:13465;335:9465;186:1441 (MM_MEDIA_Link) */}
            <MaskedIcon src="/kudos/icon-link.svg" size={24} className="text-[#00101A]" />
          </button>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1 rounded p-4 text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] transition-colors duration-200 ease-out hover:bg-black/5 motion-reduce:transition-none"
          >
            {detailLabel}
            {/* mm:I2940:13465;335:9663;186:1441 — componentId 186:2691 has no
                MM_MEDIA_ row on this screen (not exported); reuses the
                already-downloaded right-arrow glyph as the closest faithful
                match (see implementer report). */}
            <MaskedIcon src="/kudos/icon-arrow-right.svg" size={24} className="text-[#00101A]" />
          </button>
        </div>
      </div>
    </article>
  );
}

/**
 * mm:I2940:13465;335:9443 / mm:I2940:13465;335:9446 ("Infor", instance
 * `256:4830`) — one party. `sunner` is `null` for an anonymous sender
 * (`post.isAnonymous`): render the neutral avatar and `anonymousLabel` in
 * the name slot, with no code, dot separator, or badge pill.
 */
function PersonInfo({
  sunner,
  anonymousLabel,
}: {
  sunner: KudosSunner | null;
  anonymousLabel: string;
}) {
  return (
    <div className="flex w-0 flex-1 flex-col items-center gap-[13px]">
      {/* mm:…;256:4734 (MM_MEDIA_Avatar) */}
      {sunner?.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote avatar, no responsive variants
        <img
          src={sunner.avatarUrl}
          alt=""
          className="h-16 w-16 shrink-0 rounded-full border-[1.869px] border-white object-cover"
        />
      ) : sunner ? (
        <div
          aria-hidden
          className="h-16 w-16 shrink-0 rounded-full border-[1.869px] border-white bg-[#EEEEEE]"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- fixed local asset, no responsive variants
        <img
          src="/kudos/avatar-sunner.png"
          alt=""
          className="h-16 w-16 shrink-0 rounded-full border-[1.869px] border-white object-cover"
        />
      )}
      {/* mm:…;256:4737 (B.3.2_Thông tin người gửi) */}
      <div className="flex w-full flex-col items-center gap-0.5">
        {/* mm:…;256:4735 */}
        <p className="w-full truncate text-center text-base leading-6 font-bold tracking-[0.15px] text-[#00101A]">
          {sunner?.name ?? anonymousLabel}
        </p>
        {sunner ? (
          /* mm:…;256:4741 (Huy hiệu + Sao) */
          <div className="flex items-center justify-center gap-2.5">
            {/* mm:…;256:4751 */}
            <span className="text-sm leading-5 font-bold tracking-[0.1px] text-[#999999]">{sunner.code}</span>
            {/* mm:…;256:4754 (Ellipse 70) */}
            <span aria-hidden className="h-1 w-1 rounded-full bg-[#999999] opacity-40" />
            {/* mm:…;3106:17694 (danh hiệu) — the badge PNG already bakes in its label text. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed small badge glyph, no responsive variants needed */}
            <img src={BADGE_IMAGE[sunner.badge]} alt={BADGE_LABEL[sunner.badge]} className="h-[19px] w-auto" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** mm:…;335:9449 — displayed as `10:00 - 10/30/2025` per lib/kudos/types.ts. */
function formatPostedAt(iso: string): string {
  const date = new Date(iso);
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${hh}:${min} - ${month}/${day}/${date.getFullYear()}`;
}
