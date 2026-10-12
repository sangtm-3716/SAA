"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { applyMarkdown, type MarkdownAction } from "@/lib/kudos/markdown-input";
import { MAX_MESSAGE_LENGTH } from "@/lib/kudos/compose-types";
import {
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  NumberListIcon,
  QuoteIcon,
  StrikethroughIcon,
} from "./compose-icons";

/**
 * The Kudo body editor — mm:I520:11647;520:9875 ("Nhập kudo").
 *
 * Three stacked parts:
 *   mm:I520:11647;520:9877  (mms_C_Chức năng)  — the formatting toolbar
 *   mm:I520:11647;520:9886  (mms_D_text filed) — the 200px body field
 *   mm:I520:11647;520:9887  (mms_D.1_Gợi ý)    — the @-mention hint line
 *
 * The toolbar and the body share one visual box: in Figma the toolbar rounds
 * its OUTER top corners only (`8px 0 0 0` on the first cell, `0 8px 0 0` on
 * the last) and the body rounds `0 0 8px 8px`, with each cell drawing a full
 * 1px #998C5F border. Rendered literally that doubles every seam, so adjoining
 * edges are pulled together with `-ml-px` / `-mt-px` — one hairline per seam,
 * geometry unchanged. The radius itself sits on the ROW rather than its first
 * and last cells, because below `sm` the eight cells wrap and per-cell radii
 * would then land mid-row.
 *
 * The buttons write Markdown into the textarea through
 * `lib/kudos/markdown-input.ts`; the caret is restored in a layout effect so
 * typing continues where the transform left it rather than jumping to the end.
 */

const TOOL_CELL =
  "flex h-10 shrink-0 items-center justify-center border border-[#998C5F] px-4 py-2.5 text-[#00101A] transition-colors duration-200 ease-out hover:bg-[#FFEA9E]/40 focus-visible:relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#00101A] motion-reduce:transition-none";

interface ComposeEditorProps {
  placeholder: string;
  hint: string;
  guidelinesLabel: string;
  guidelinesHref: string;
  linkPromptLabel: string;
  linkPlaceholder: string;
  errorId?: string;
  invalid?: boolean;
  toolLabels: Record<MarkdownAction, string>;
}

const TOOLS: { key: MarkdownAction; Icon: (props: { className?: string }) => React.ReactElement }[] = [
  { key: "bold", Icon: BoldIcon },
  { key: "italic", Icon: ItalicIcon },
  { key: "strikethrough", Icon: StrikethroughIcon },
  { key: "numberList", Icon: NumberListIcon },
  { key: "link", Icon: LinkIcon },
  { key: "quote", Icon: QuoteIcon },
];

export function ComposeEditor({
  placeholder,
  hint,
  guidelinesLabel,
  guidelinesHref,
  linkPromptLabel,
  linkPlaceholder,
  errorId,
  invalid,
  toolLabels,
}: ComposeEditorProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Set by a toolbar press, consumed once by the layout effect below. A ref
  // rather than state: restoring a caret must not trigger another render.
  const pendingSelection = useRef<[number, number] | null>(null);

  useLayoutEffect(() => {
    const selection = pendingSelection.current;
    if (!selection || !textareaRef.current) return;
    pendingSelection.current = null;
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(selection[0], selection[1]);
  });

  function runAction(action: MarkdownAction) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // `window.prompt` is a deliberate plainness: the design has no link dialog
    // to transcribe, and inventing one would be designing past the spec.
    const url = action === "link" ? (window.prompt(linkPromptLabel) ?? "") : undefined;

    const next = applyMarkdown(
      {
        value,
        selectionStart: textarea.selectionStart,
        selectionEnd: textarea.selectionEnd,
      },
      action,
      { url, linkPlaceholder },
    );

    setValue(next.value);
    pendingSelection.current = [next.selectionStart, next.selectionEnd];
  }

  return (
    // mm:I520:11647;520:9875 (Nhập kudo) — gap 4px between the box and the hint
    <div className="flex w-full flex-col gap-1">
      {/* mm:I520:11647;520:9876 (Nhập nội dung) */}
      <div className="flex w-full flex-col">
        {/* mm:I520:11647;520:9877 (mms_C_Chức năng) */}
        <div className="flex w-full flex-wrap items-center overflow-hidden rounded-t-lg">
          {TOOLS.map(({ key, Icon }, index) => (
            <button
              key={key}
              type="button"
              aria-label={toolLabels[key]}
              title={toolLabels[key]}
              onClick={() => runAction(key)}
              className={`${TOOL_CELL} ${index === 0 ? "" : "-ml-px"}`}
            >
              <Icon className="size-6" />
            </button>
          ))}
          {/* mm:I520:11647;3053:11619 — fills the rest of the toolbar row */}
          <a
            href={guidelinesHref}
            className={`${TOOL_CELL} -ml-px min-w-0 grow basis-0 text-base leading-6 font-bold tracking-[0.15px] text-[#E46060] underline underline-offset-2 hover:bg-[#E46060]/10`}
          >
            {guidelinesLabel}
          </a>
        </div>

        {/* mm:I520:11647;520:9886 (mms_D_text filed) */}
        <textarea
          ref={textareaRef}
          id="kudo-body"
          name="message"
          rows={8}
          maxLength={MAX_MESSAGE_LENGTH}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={errorId}
          className={`-mt-px h-50 min-h-30 w-full resize-y rounded-b-lg border bg-white py-0 pr-6 pl-6 text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] transition-colors duration-200 ease-out outline-none placeholder:text-[#999] focus-visible:border-[#00101A] motion-reduce:transition-none ${
            invalid ? "border-[#CF1322]" : "border-[#998C5F]"
          }`}
        />
      </div>

      {/* mm:I520:11647;520:9888 — centred under the box on the 672px column */}
      <p className="text-center text-base leading-6 font-bold tracking-[0.5px] text-[#00101A]">
        {hint}
      </p>
    </div>
  );
}
