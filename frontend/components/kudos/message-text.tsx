import type { ReactNode } from "react";
import { safeHref } from "@/lib/kudos/safe-link";

/**
 * Renders a Kudo message, which the compose editor writes as Markdown
 * (`lib/kudos/markdown-input.ts`, driven by mm:I520:11647;520:9877).
 *
 * The board previously printed `post.message` raw, which was correct while
 * nothing could produce markup. Now that the toolbar exists, raw printing
 * would show literal `**asterisks**` on every formatted Kudo.
 *
 * Scope is deliberately exactly what the six toolbar buttons can emit —
 * bold, italic, strikethrough, links, numbered lists, block quotes — and
 * nothing else. This is not a Markdown implementation and should not grow
 * into one; if the editor ever gains a button, add the matching case here.
 *
 * ## Safety
 *
 * The message is user input rendered on a public board, so this builds React
 * elements and NEVER touches `dangerouslySetInnerHTML`. A link's href is
 * additionally restricted to http/https — without that check, a message
 * containing `[click](javascript:…)` would render a working XSS vector.
 */

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|\[[^\]]*\]\([^)]*\))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).filter(Boolean).map((part, index) => {
    const key = `${keyPrefix}-${index}`;

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("~~") && part.endsWith("~~") && part.length > 4) {
      return <s key={key}>{part.slice(2, -2)}</s>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }

    const link = /^\[([^\]]*)\]\(([^)]*)\)$/.exec(part);
    if (link) {
      const href = safeHref(link[2].trim());
      const label = link[1] || link[2];
      if (!href) return <span key={key}>{label}</span>;
      return (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="underline underline-offset-2"
        >
          {label}
        </a>
      );
    }

    return <span key={key}>{part}</span>;
  });
}

export function MessageText({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");

  return (
    <p className={className}>
      {lines.map((line, index) => {
        const key = `line-${index}`;
        const quote = line.startsWith("> ");
        const numbered = /^\d+\.\s/.exec(line);
        const body = quote ? line.slice(2) : line;

        return (
          <span key={key} className={quote ? "block border-l-2 border-current/30 pl-3 italic" : "block"}>
            {numbered ? <span>{numbered[0]}</span> : null}
            {renderInline(numbered ? body.slice(numbered[0].length) : body, key)}
            {/* A trailing empty line would otherwise collapse to nothing. */}
            {body === "" ? " " : null}
          </span>
        );
      })}
    </p>
  );
}
