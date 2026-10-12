"use client";

import { useActionState } from "react";
import { createKudosPostAction } from "@/lib/kudos/compose-action";
import { COMPOSE_IDLE, type ComposeField, type ComposeOptions } from "@/lib/kudos/compose-types";
import { FieldLabel, FieldRow } from "./compose-fields";
import { ComboBox } from "./combo-box";
import { ComposeActions } from "./compose-actions";
import { ComposeEditor } from "./compose-editor";
import { HashtagPicker } from "./hashtag-picker";
import { ImagePicker } from "./image-picker";
import type { ComposeCardLabels } from "./compose-labels";

/**
 * The "Viết KUDO" card — mm:520:11647, the whole of the compose screen's
 * foreground, and the form that actually posts a Kudo.
 *
 * A 752px cream (#FFF8E1) panel with 40px of padding, a 24px radius and a
 * uniform 32px rhythm between its six blocks; inside, the Content frame
 * (mm:I520:11647;520:9874) tightens to 24px. The panel is fixed-width in
 * Figma, so it is `max-w-[752px] w-full` here and its padding relaxes to 20px
 * below `sm` — at a literal 752px it would overflow every phone.
 *
 * Submission goes through `createKudosPostAction` via `useActionState`, so
 * the form posts without a client-side fetch and a rejected submission comes
 * back as a `ComposeState` naming the offending field. Errors are rendered
 * beside the control that caused them rather than collected into one banner,
 * because "Tối đa 5" means nothing if it is not next to the thing that has
 * six of something.
 */
export function ComposeCard({
  labels,
  options,
  cancelHref,
  guidelinesHref,
}: {
  labels: ComposeCardLabels;
  options: ComposeOptions;
  cancelHref: string;
  guidelinesHref: string;
}) {
  const [state, formAction, pending] = useActionState(createKudosPostAction, COMPOSE_IDLE);

  const errorFor = (field: ComposeField) =>
    state.status === "error" && state.field === field ? state.message : null;

  return (
    <form
      action={formAction}
      data-testid="kudos-compose-card"
      className="flex w-full max-w-[752px] flex-col gap-8 rounded-3xl bg-[#FFF8E1] p-5 sm:p-10"
    >
      {/* mm:I520:11647;520:9870 */}
      <h1 className="text-center text-2xl leading-8 font-bold text-[#00101A] sm:text-[32px] sm:leading-10">
        {labels.heading}
      </h1>

      {/* A failure with no field of its own — an expired session, or a
          rejection this form does not know how to attribute. */}
      {errorFor("form") && (
        <p role="alert" className="rounded-lg bg-[#CF1322]/10 px-4 py-3 text-base font-bold text-[#CF1322]">
          {errorFor("form")}
        </p>
      )}

      {/* mm:I520:11647;520:9871 (mms_B_Chọn người nhận) */}
      <div className="flex w-full flex-col gap-1">
        <FieldRow label={labels.recipientLabel} required>
          <ComboBox
            name="recipientId"
            options={options.recipients.map((person) => ({
              value: person.id,
              label: person.name,
              secondary: person.departmentName
                ? `${person.code} · ${person.departmentName}`
                : person.code,
              avatarUrl: person.avatarUrl,
            }))}
            placeholder={labels.recipientPlaceholder}
            ariaLabel={labels.recipientLabel}
            emptyLabel={labels.noRecipients}
            invalid={Boolean(errorFor("recipient"))}
            describedBy={errorFor("recipient") ? "error-recipient" : undefined}
          />
        </FieldRow>
        <FieldError id="error-recipient" message={errorFor("recipient")} />
      </div>

      {/* mm:I520:11647;1688:10448 (Frame 552) — the only row with helper text,
          so the label is offset to stay centred on the 56px field rather than
          riding up level with the hint. */}
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
        <span className="sm:mt-3.5">
          <FieldLabel required>{labels.awardLabel}</FieldLabel>
        </span>
        <div className="flex w-full min-w-0 flex-1 flex-col gap-1.5">
          <ComboBox
            name="title"
            freeText
            options={options.awardTitles.map((title) => ({
              value: title.id,
              label: title.label,
            }))}
            placeholder={labels.awardPlaceholder}
            ariaLabel={labels.awardLabel}
            emptyLabel={labels.awardFreeTextHint}
            invalid={Boolean(errorFor("title"))}
            describedBy={errorFor("title") ? "error-title" : undefined}
          />
          <FieldError id="error-title" message={errorFor("title")} />
          {/* mm:I520:11647;1688:10447 — two lines, hard-wrapped in Figma */}
          <p className="text-base leading-6 font-bold tracking-[0.15px] whitespace-pre-line text-[#999]">
            {labels.awardHint}
          </p>
        </div>
      </div>

      {/* mm:I520:11647;520:9874 (Content) */}
      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full flex-col gap-1">
          <ComposeEditor
            placeholder={labels.bodyPlaceholder}
            hint={labels.mentionHint}
            guidelinesLabel={labels.guidelines}
            guidelinesHref={guidelinesHref}
            linkPromptLabel={labels.linkPrompt}
            linkPlaceholder={labels.linkPlaceholder}
            invalid={Boolean(errorFor("message"))}
            errorId={errorFor("message") ? "error-message" : undefined}
            toolLabels={labels.tools}
          />
          <FieldError id="error-message" message={errorFor("message")} />
        </div>

        {/* mm:I520:11647;520:9890 (mms_E_Frame 536) */}
        <div className="flex w-full flex-col gap-1">
          <FieldRow label={labels.hashtagLabel} required align="start">
            <HashtagPicker
              options={options.hashtags}
              invalid={Boolean(errorFor("hashtags"))}
              describedBy={errorFor("hashtags") ? "error-hashtags" : undefined}
              labels={{
                title: labels.hashtagLabel,
                max: labels.maxFive,
                add: labels.addHashtag,
                inputLabel: labels.hashtagInputLabel,
                placeholder: labels.hashtagPlaceholder,
                remove: labels.removeHashtag,
                create: labels.createHashtag,
                empty: labels.noHashtags,
              }}
            />
          </FieldRow>
          <FieldError id="error-hashtags" message={errorFor("hashtags")} />
        </div>

        {/* mm:I520:11647;520:9896 (mms_F_Frame 537) */}
        <div className="flex w-full flex-col gap-1">
          <FieldRow label={labels.imageLabel}>
            <ImagePicker
              invalid={Boolean(errorFor("images"))}
              describedBy={errorFor("images") ? "error-images" : undefined}
              labels={{
                title: labels.imageLabel,
                max: labels.maxFive,
                add: labels.addImage,
                remove: labels.removeImage,
                alt: labels.imageAlt,
              }}
            />
          </FieldRow>
          <FieldError id="error-images" message={errorFor("images")} />
        </div>
      </div>

      {/* mm:I520:11647;520:14099 (mms_G_Gửi ẩn danh) */}
      <label className="flex w-full cursor-pointer items-center gap-4">
        <input
          type="checkbox"
          name="isAnonymous"
          className="size-6 shrink-0 appearance-none rounded border border-[#999] bg-white transition-colors duration-200 ease-out checked:border-[#00101A] checked:bg-[#00101A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#998C5F] motion-reduce:transition-none"
        />
        <span className="text-lg leading-7 font-bold text-[#999] sm:text-[22px]">
          {labels.anonymous}
        </span>
      </label>

      {/* mm:I520:11647;520:9905 (mms_H_Frame 538) */}
      <ComposeActions
        cancelLabel={labels.cancel}
        submitLabel={pending ? labels.submitting : labels.submit}
        cancelHref={cancelHref}
        pending={pending}
      />
    </form>
  );
}

function FieldError({ id, message }: { id: string; message: string | null }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm leading-5 font-bold text-[#CF1322]">
      {message}
    </p>
  );
}
