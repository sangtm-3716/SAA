"use server";

import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/env";
import { getCurrentSunner } from "./current-sunner";
import {
  MAX_HASHTAGS,
  MAX_IMAGES,
  MAX_MESSAGE_LENGTH,
  MAX_TITLE_LENGTH,
  RPC_ERRORS,
  type ComposeField,
  type ComposeState,
} from "./compose-types";

/**
 * The write path behind the "Viết Kudo" form — MoMorph screen `ihQ26W78P2`.
 *
 * Deliberately NOT fail-open. Every other module under `lib/kudos/` swallows
 * failures and renders an empty board, which is right for a read: a missing
 * card is better than a 500. A write is the opposite — silently discarding
 * someone's Kudo and redirecting them to a board that does not contain it is
 * the worst possible outcome, so every failure here surfaces on the form.
 *
 * ## No session
 *
 * Sign-in does not work in this deployment, so there is nothing to read an
 * identity from: the sender comes from `getCurrentSunner()`, a mocked stand-in
 * (see that module), and is passed to the RPC as a parameter. Anyone can
 * therefore post as that Sunner. That is the accepted trade-off of a demo with
 * no accounts; it is not a model to carry into anything real.
 *
 * Because there is no session, this uses the plain publishable-key client
 * rather than the cookie-bound `lib/supabase/server.ts` — there are no cookies
 * worth carrying, and the RPC and bucket policies are both granted to `anon`.
 *
 * Validation is duplicated between this function and `create_kudos_post`, and
 * that is intentional rather than sloppy: the RPC is the real boundary (it is
 * reachable by anything that can talk to the database), while the checks here
 * exist to turn a failure into a message attached to the right field, and to
 * avoid uploading five images for a submission the database will reject.
 */

const BUCKET = "kudos-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // mirrors the bucket's file_size_limit
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Uploads need far longer than the 2.5s `kudosClient()` allows for a read —
 * five 5MB files over a slow link would abort mid-write.
 */
const WRITE_TIMEOUT_MS = 30_000;

function writeClient() {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(WRITE_TIMEOUT_MS) }),
    },
  });
}

function fail(field: ComposeField, message: string): ComposeState {
  return { status: "error", field, message };
}

export async function createKudosPostAction(
  _previous: ComposeState,
  formData: FormData,
): Promise<ComposeState> {
  const t = await getTranslations("kudosCompose");

  const sender = await getCurrentSunner();
  if (!sender) {
    // The mocked Sunner could not be read — Supabase is down, or the seed has
    // not run. Either way there is nobody to attribute the Kudo to.
    return fail("form", t("errorSenderNotFound"));
  }

  const recipientId = String(formData.get("recipientId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const isAnonymous = formData.get("isAnonymous") === "on";

  const hashtags = Array.from(
    new Set(
      formData
        .getAll("hashtag")
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  );

  const images = formData
    .getAll("image")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (!recipientId) return fail("recipient", t("errorRecipientRequired"));
  if (recipientId === sender.id) return fail("recipient", t("errorRecipientIsSelf"));
  if (!title) return fail("title", t("errorTitleRequired"));
  if (title.length > MAX_TITLE_LENGTH) {
    return fail("title", t("errorTitleTooLong", { max: MAX_TITLE_LENGTH }));
  }
  if (!message) return fail("message", t("errorMessageRequired"));
  if (message.length > MAX_MESSAGE_LENGTH) {
    return fail("message", t("errorMessageTooLong", { max: MAX_MESSAGE_LENGTH }));
  }
  if (hashtags.length === 0) return fail("hashtags", t("errorHashtagRequired"));
  if (hashtags.length > MAX_HASHTAGS) {
    return fail("hashtags", t("errorTooManyHashtags", { max: MAX_HASHTAGS }));
  }
  if (images.length > MAX_IMAGES) {
    return fail("images", t("errorTooManyImages", { max: MAX_IMAGES }));
  }

  for (const image of images) {
    if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
      return fail("images", t("errorImageType", { name: image.name }));
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return fail("images", t("errorImageTooLarge", { name: image.name, max: 5 }));
    }
  }

  const supabase = writeClient();

  // Uploaded before the post row exists, so a failed upload costs nothing but
  // orphaned objects — whereas inserting first and failing here would leave a
  // published Kudo missing the pictures its author attached.
  const uploadedPaths: string[] = [];
  const imageUrls: string[] = [];

  for (const image of images) {
    // Foldered by sender and named with a UUID so two people attaching
    // `photo.png` at the same moment cannot collide.
    const path = `${sender.id}/${randomUUID()}.${EXTENSION_BY_TYPE[image.type]}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, image, { contentType: image.type, upsert: false });

    if (error) {
      await cleanUpUploads(supabase, uploadedPaths);
      return fail("images", t("errorImageUpload", { name: image.name }));
    }

    uploadedPaths.push(path);
    imageUrls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
  }

  const { data: newPostId, error } = await supabase.rpc("create_kudos_post", {
    p_sender_id: sender.id,
    p_recipient_id: recipientId,
    p_title: title,
    p_message: message,
    p_hashtags: hashtags,
    p_image_urls: imageUrls,
    p_is_anonymous: isAnonymous,
  });

  if (error) {
    // The post was rejected, so its uploads are garbage. Removing them here
    // keeps the bucket from accumulating files no row will ever reference.
    await cleanUpUploads(supabase, uploadedPaths);

    // Postgres wraps the raised identifier in its own message text, so this
    // matches on substring rather than equality.
    const code = Object.keys(RPC_ERRORS).find((key) => error.message.includes(key));
    if (!code) return fail("form", t("errorUnknown"));

    const { field, key } = RPC_ERRORS[code];
    return fail(
      field,
      t(key as Parameters<typeof t>[0], {
        max: code === "too_many_images" ? MAX_IMAGES : MAX_HASHTAGS,
      }),
    );
  }

  // The board reads this route's data at request time; without this the new
  // Kudo would not appear until the next uncached render.
  revalidatePath("/kudos");

  // Land ON the new Kudo, not at the top of the board.
  //
  // The ALL KUDOS feed is the third section down: a freshly posted Kudo is the
  // first card there, but that is ~2500px below the fold on a 1440x1024
  // screen. Redirecting to bare `/kudos` therefore looks exactly like a failed
  // submit — you are returned to a board with no sign of what you just wrote.
  // Every feed card renders `id={post.id}` (the Copy Link button already
  // builds `/kudos#<id>` from it), so the id the RPC hands back is all that is
  // needed to scroll the author to their own post.
  //
  // Outside any try/catch on purpose: `redirect` signals by throwing, and
  // catching it would turn a success into a form error.
  redirect(typeof newPostId === "string" ? `/kudos#${newPostId}` : "/kudos");
}

/** Best-effort: a failed cleanup must not mask the error that triggered it. */
async function cleanUpUploads(
  supabase: ReturnType<typeof writeClient>,
  paths: string[],
): Promise<void> {
  if (paths.length === 0) return;
  try {
    await supabase.storage.from(BUCKET).remove(paths);
  } catch {
    // Orphaned objects are a housekeeping problem, not a user-facing one.
  }
}
