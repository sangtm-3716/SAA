/**
 * The text transforms behind the compose editor's formatting toolbar —
 * mm:I520:11647;520:9877 (mms_C_Chức năng).
 *
 * Kept as pure functions over (text, selection) rather than reaching into a
 * DOM node, so the fiddly part — where the caret lands afterwards — is
 * unit-testable without a browser. The component owns the textarea; this
 * module owns the arithmetic.
 *
 * The output is Markdown, which is what `kudos_posts.message` stores and what
 * `components/kudos/message-text.tsx` renders back on the board. Markdown
 * rather than HTML on purpose: the message is user input rendered on a public
 * board, and storing markup would make every read path responsible for
 * sanitising it. Markdown stays inert text until something chooses to format
 * it, and that renderer builds React nodes rather than setting innerHTML.
 */

export type MarkdownAction =
  | "bold"
  | "italic"
  | "strikethrough"
  | "numberList"
  | "link"
  | "quote";

export interface InputSelection {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

/** Wraps the selection in `marker`, or unwraps it when already wrapped. */
function toggleWrap(input: InputSelection, marker: string): InputSelection {
  const { value, selectionStart, selectionEnd } = input;
  const selected = value.slice(selectionStart, selectionEnd);

  const before = value.slice(Math.max(0, selectionStart - marker.length), selectionStart);
  const after = value.slice(selectionEnd, selectionEnd + marker.length);

  // Already wrapped just outside the selection — pressing the button again
  // should remove the markers, not nest a second pair.
  if (before === marker && after === marker) {
    return {
      value:
        value.slice(0, selectionStart - marker.length) +
        selected +
        value.slice(selectionEnd + marker.length),
      selectionStart: selectionStart - marker.length,
      selectionEnd: selectionEnd - marker.length,
    };
  }

  return {
    value: value.slice(0, selectionStart) + marker + selected + marker + value.slice(selectionEnd),
    // With no selection the caret sits BETWEEN the markers, ready to type.
    selectionStart: selectionStart + marker.length,
    selectionEnd: selectionEnd + marker.length,
  };
}

/**
 * Applies `prefix` to every line the selection touches, or removes it when
 * every touched line already has it. Line-based rather than selection-based:
 * quoting half a line is not a thing Markdown can express.
 */
function togglePrefix(
  input: InputSelection,
  prefixFor: (index: number) => string,
  matcher: RegExp,
): InputSelection {
  const { value, selectionStart, selectionEnd } = input;

  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const lineEndIndex = value.indexOf("\n", selectionEnd);
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;

  const block = value.slice(lineStart, lineEnd);
  const lines = block.split("\n");
  const allPrefixed = lines.every((line) => matcher.test(line));

  const next = lines
    .map((line, index) => (allPrefixed ? line.replace(matcher, "") : prefixFor(index) + line))
    .join("\n");

  return {
    value: value.slice(0, lineStart) + next + value.slice(lineEnd),
    selectionStart: lineStart,
    selectionEnd: lineStart + next.length,
  };
}

/**
 * `url` is supplied by the component (from a prompt) so this stays pure and
 * testable. An empty url still produces a well-formed link skeleton with the
 * caret inside the parentheses.
 */
function insertLink(input: InputSelection, url: string, placeholder: string): InputSelection {
  const { value, selectionStart, selectionEnd } = input;
  const selected = value.slice(selectionStart, selectionEnd) || placeholder;
  const snippet = `[${selected}](${url})`;

  return {
    value: value.slice(0, selectionStart) + snippet + value.slice(selectionEnd),
    // Select the url slot when there is none yet, otherwise sit after the link.
    selectionStart: url ? selectionStart + snippet.length : selectionStart + selected.length + 3,
    selectionEnd: url ? selectionStart + snippet.length : selectionStart + selected.length + 3,
  };
}

export function applyMarkdown(
  input: InputSelection,
  action: MarkdownAction,
  options: { url?: string; linkPlaceholder?: string } = {},
): InputSelection {
  switch (action) {
    case "bold":
      return toggleWrap(input, "**");
    case "italic":
      return toggleWrap(input, "*");
    case "strikethrough":
      return toggleWrap(input, "~~");
    case "quote":
      return togglePrefix(input, () => "> ", /^> /);
    case "numberList":
      return togglePrefix(input, (index) => `${index + 1}. `, /^\d+\.\s/);
    case "link":
      return insertLink(input, options.url ?? "", options.linkPlaceholder ?? "link");
    default:
      return input;
  }
}
