import type { MarkdownAction } from "@/lib/kudos/markdown-input";

/**
 * Every string the compose card renders — MoMorph screen `ihQ26W78P2`.
 *
 * Separated from `compose-card.tsx` so `app/kudos/compose/page.tsx` (a server
 * component) can import the shape without reaching into a `"use client"`
 * module, and so adding a string is one edit in one place rather than a prop
 * threaded through four components.
 */
export interface ComposeCardLabels {
  heading: string;

  // mm:I520:11647;520:9871 (mms_B_Chọn người nhận)
  recipientLabel: string;
  recipientPlaceholder: string;
  noRecipients: string;

  // mm:I520:11647;1688:10448 (Frame 552)
  awardLabel: string;
  awardPlaceholder: string;
  awardHint: string;
  /** Shown in place of an empty menu: the field takes free text anyway. */
  awardFreeTextHint: string;

  // mm:I520:11647;520:9875 (Nhập kudo)
  bodyPlaceholder: string;
  mentionHint: string;
  guidelines: string;
  linkPrompt: string;
  linkPlaceholder: string;
  tools: Record<MarkdownAction, string>;

  // mm:I520:11647;520:9890 (mms_E_Frame 536)
  hashtagLabel: string;
  addHashtag: string;
  hashtagInputLabel: string;
  hashtagPlaceholder: string;
  removeHashtag: string;
  createHashtag: string;
  noHashtags: string;

  // mm:I520:11647;520:9896 (mms_F_Frame 537)
  imageLabel: string;
  addImage: string;
  removeImage: string;
  imageAlt: string;

  /** Shared by both pickers — the design prints "Tối đa 5" on each. */
  maxFive: string;

  // mm:I520:11647;520:14099 + mm:I520:11647;520:9905
  anonymous: string;
  cancel: string;
  submit: string;
  submitting: string;
}
