"use client";

import { useState } from "react";
import { MaskedIcon } from "@/components/awards/masked-icon";
import type { KudosPost } from "@/lib/kudos/types";
import { SunnerChip } from "./sunner-chip";

/**
 * mm:I3127:21871;256:5229 — formats `createdAt` as `HH:mm - MM/DD/YYYY`
 * using UTC getters, never `toLocaleString`/`Intl`, so server and client
 * render the identical string regardless of either runtime's local
 * timezone (a locale-dependent format here would hydrate mismatched).
 */
function formatKudosTimestamp(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const hh = pad(date.getUTCHours());
  const mm = pad(date.getUTCMinutes());
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  return `${hh}:${mm} - ${month}/${day}/${date.getUTCFullYear()}`;
}

/** mm:I3127:21871;256:5174 — manual thousands separator, no `Intl` locale call. */
function formatHeartCount(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * One kudos post — mm:3127:21871 (C.3_KUDO Post), component `256:5231`.
 * 680px card, 24px radius, `#FFF8E1` fill, 40/40/16/40 padding.
 */
export function KudosPostCard({
  post,
  copyLinkLabel,
  copiedLabel,
}: {
  post: KudosPost;
  copyLinkLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopyLink() {
    const url = `${window.location.origin}/kudos#${post.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    // mm:3127:21871 (C.3_KUDO Post)
    <article
      id={post.id}
      className="flex w-full max-w-[680px] flex-col items-start gap-4 rounded-3xl bg-[#FFF8E1] px-10 pt-10 pb-4"
    >
      {/* mm:I3127:21871;256:4857 (Info user) */}
      <div className="flex w-full flex-row flex-wrap items-start justify-between gap-6">
        <SunnerChip sunner={post.sender} />
        {/* mm:I3127:21871;256:5161 (C.3.2_Icon sent) */}
        <div className="flex shrink-0 items-start py-4">
          <MaskedIcon src="/kudos/icon-send.svg" size={32} className="text-[#00101A]" />
        </div>
        <SunnerChip sunner={post.recipient} />
      </div>

      {/* mm:I3127:21871;256:5192 (Rectangle 14) */}
      <div className="h-px w-full bg-[#FFEA9E]" />

      {/* mm:I3127:21871;256:5645 (Content) */}
      <div className="flex w-full flex-col items-start gap-4">
        {/* mm:I3127:21871;256:5229 (C.3.4_Time) */}
        <p className="w-full text-base leading-6 font-bold tracking-[0.5px] text-[#999999]">
          {formatKudosTimestamp(post.createdAt)}
        </p>

        {post.title ? (
          /* mm:I3127:21871;2234:33038 (title row) */
          <div className="flex w-full flex-row items-center justify-between gap-2">
            {/* mm:I3127:21871;2234:33039 */}
            <p className="text-base leading-6 font-bold tracking-[0.5px] text-[#00101A]">
              {post.title}
            </p>
            {/* mm:I3127:21871;2234:33040 (MM_MEDIA_Pen) */}
            <MaskedIcon src="/home/icon-pen.svg" size={32} className="shrink-0 text-[#00101A]" />
          </div>
        ) : null}

        {/* mm:I3127:21871;662:11382 (message panel) */}
        <div className="w-full rounded-xl border border-[#FFEA9E] bg-[rgba(255,234,158,0.40)] px-6 py-4">
          {/* mm:I3127:21871;256:5156 */}
          <p className="text-xl leading-8 font-bold text-justify text-[#00101A]">{post.message}</p>
        </div>

        {post.imageUrls.length > 0 ? (
          /* mm:I3127:21871;256:5176 (C.3.6_Image đính kèm) */
          <div className="flex w-full flex-row items-center gap-4 overflow-x-auto">
            {post.imageUrls.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="flex size-[88px] shrink-0 items-center justify-center rounded-[18px] border border-[#998C5F] bg-white"
              >
                {/* mm:I3127:21871;256:5177;513:8436 (MM_MEDIA_Sample Image) */}
                <img src={url} alt="" className="size-[88px] rounded border border-[#FFEA9E] object-cover" />
              </div>
            ))}
          </div>
        ) : null}

        {post.hashtags.length > 0 ? (
          /* mm:I3127:21871;256:5158 (C.3.7_Hash tag) */
          <p className="w-full text-base leading-6 font-bold tracking-[0.5px] text-[#D4271D]">
            {post.hashtags.map((tag) => `#${tag}`).join(" ")}
          </p>
        ) : null}
      </div>

      {/* mm:I3127:21871;256:7496 (Rectangle 15) */}
      <div className="h-px w-full bg-[#FFEA9E]" />

      {/* mm:I3127:21871;256:5194 (C.4_Button) */}
      <div className="flex w-full flex-row items-center justify-between">
        {/* mm:I3127:21871;256:5175 (C.4.1_Hearts) */}
        <div className="flex items-center gap-1">
          {/* mm:I3127:21871;256:5174 */}
          <span className="text-2xl leading-8 font-bold text-[#00101A]">
            {formatHeartCount(post.hearts)}
          </span>
          {/* mm:I3127:21871;256:5171 (MM_MEDIA_Heart) */}
          <MaskedIcon src="/kudos/icon-heart.svg" size={32} className="text-[#D4271D]" />
        </div>

        {/* mm:I3127:21871;256:5216 (C.4.2_Copy link button) */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex w-[144px] items-center gap-1 rounded p-4 text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] transition-colors duration-200 ease-out hover:bg-[#FFEA9E]/40 motion-reduce:transition-none"
        >
          {copied ? copiedLabel : copyLinkLabel}
          {/* mm:I3127:21871;256:5216;186:1441 (MM_MEDIA_Link) */}
          <MaskedIcon src="/kudos/icon-link.svg" size={24} className="shrink-0 text-[#00101A]" />
        </button>
      </div>
    </article>
  );
}
