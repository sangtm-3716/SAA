/**
 * Shapes for the "Viết Kudo" compose screen — MoMorph screen `ihQ26W78P2`.
 *
 * Kept out of `lib/kudos/types.ts` so the board's read model and the compose
 * write model stay separable; like that module, nothing here imports Supabase.
 */

/** One option in the "Người nhận" picker — mm:I520:11647;520:9873. */
export interface RecipientOption {
  id: string;
  name: string;
  /** The employee code, shown as a secondary line so two people sharing a name stay distinguishable. */
  code: string;
  avatarUrl: string | null;
  departmentName: string | null;
}

/** One suggestion in the "Danh hiệu" dropdown — mm:I520:11647;1688:10437. */
export interface AwardTitleOption {
  id: string;
  label: string;
}

/** One suggestion in the "+ Hashtag" picker — mm:I520:11647;662:8911. */
export interface HashtagOption {
  id: string;
  label: string;
  slug: string;
}

/** Everything the compose form needs to render its three pickers. */
export interface ComposeOptions {
  recipients: RecipientOption[];
  awardTitles: AwardTitleOption[];
  hashtags: HashtagOption[];
}

/** The design caps both the hashtag and the image list at five ("Tối đa 5"). */
export const MAX_HASHTAGS = 5;
export const MAX_IMAGES = 5;

/** Mirrors the length checks inside `public.create_kudos_post`. */
export const MAX_TITLE_LENGTH = 120;
export const MAX_MESSAGE_LENGTH = 2000;

/**
 * The field a failed submit belongs to, so the form can put the message next
 * to the control that caused it rather than in one anonymous banner.
 */
export type ComposeField = "recipient" | "title" | "message" | "hashtags" | "images" | "form";

export interface ComposeState {
  status: "idle" | "error";
  field: ComposeField;
  /** Already-translated, ready to render. Empty when `status` is "idle". */
  message: string;
}

export const COMPOSE_IDLE: ComposeState = { status: "idle", field: "form", message: "" };

/**
 * Error identifiers raised by `public.create_kudos_post`, mapped to the field
 * they belong to and the message that explains them. The RPC raises these as
 * bare strings (`RAISE EXCEPTION 'recipient_is_self'`), so this table is the
 * contract between the function and the form — adding a check there means
 * adding a row here, or the user gets the generic fallback.
 */
export const RPC_ERRORS: Record<string, { field: ComposeField; key: string }> = {
  sender_not_found: { field: "form", key: "errorSenderNotFound" },
  recipient_required: { field: "recipient", key: "errorRecipientRequired" },
  recipient_is_self: { field: "recipient", key: "errorRecipientIsSelf" },
  title_required: { field: "title", key: "errorTitleRequired" },
  title_too_long: { field: "title", key: "errorTitleTooLong" },
  message_required: { field: "message", key: "errorMessageRequired" },
  message_too_long: { field: "message", key: "errorMessageTooLong" },
  hashtag_required: { field: "hashtags", key: "errorHashtagRequired" },
  too_many_hashtags: { field: "hashtags", key: "errorTooManyHashtags" },
  too_many_images: { field: "images", key: "errorTooManyImages" },
};
