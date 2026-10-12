"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MAX_HASHTAGS, type HashtagOption } from "@/lib/kudos/compose-types";
import { CloseTinyIcon, PlusIcon } from "./compose-icons";

/**
 * "Hashtag" — mm:I520:11647;520:9890 (mms_E_Frame 536).
 *
 * Figma draws only the "+ Hashtag / Tối đa 5" button, never a chosen tag, so
 * the chip is this implementation's own: it borrows the geometry of the image
 * thumbnail's remove badge (mm:I520:11647;662:9287 — a #D4271D circle with the
 * tiny cross) so added tags read as part of the same family rather than a new
 * visual idea.
 *
 * Tags are offered from `public.hashtags` but NOT restricted to it — the
 * design shows no closed list, and `create_kudos_post` creates unknown labels
 * on demand, matching them to existing tags by slug so "Tận tâm" and "tan tam"
 * stay one tag rather than two.
 *
 * The chosen tags are submitted as repeated `hashtag` inputs, which is what
 * `formData.getAll("hashtag")` in the action reads.
 */
export function HashtagPicker({
  options,
  labels,
  invalid,
  describedBy,
}: {
  options: HashtagOption[];
  labels: {
    title: string;
    max: string;
    add: string;
    inputLabel: string;
    placeholder: string;
    remove: string;
    create: string;
    empty: string;
  };
  invalid?: boolean;
  describedBy?: string;
}) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const atLimit = chosen.length >= MAX_HASHTAGS;

  const suggestions = useMemo(() => {
    const taken = new Set(chosen.map((label) => label.toLowerCase()));
    const q = query.trim().toLowerCase();
    return options
      .filter((option) => !taken.has(option.label.toLowerCase()))
      .filter((option) => (q ? option.label.toLowerCase().includes(q) : true));
  }, [options, chosen, query]);

  // An exact match must not offer "create" as well, or the same tag appears
  // twice in the menu under two different actions.
  const canCreate =
    query.trim().length > 0 &&
    !options.some((option) => option.label.toLowerCase() === query.trim().toLowerCase()) &&
    !chosen.some((label) => label.toLowerCase() === query.trim().toLowerCase());

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function add(label: string) {
    const value = label.trim();
    if (!value || atLimit) return;
    if (chosen.some((existing) => existing.toLowerCase() === value.toLowerCase())) return;
    setChosen((current) => [...current, value]);
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <div ref={rootRef} className="relative flex flex-wrap items-center gap-2">
      {/* What the action reads: `formData.getAll("hashtag")`. */}
      {chosen.map((label) => (
        <input key={label} type="hidden" name="hashtag" value={label} />
      ))}

      {chosen.map((label) => (
        <span
          key={`chip-${label}`}
          className="flex h-12 items-center gap-2 rounded-lg border border-[#998C5F] bg-white px-3 text-sm leading-[22px] font-bold tracking-[0.5px] text-[#00101A]"
        >
          #{label}
          <button
            type="button"
            aria-label={`${labels.remove}: ${label}`}
            onClick={() => setChosen((current) => current.filter((item) => item !== label))}
            className="flex size-5 items-center justify-center rounded-full bg-[#D4271D] text-white transition-colors duration-200 ease-out hover:bg-[#B01F17] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4271D] motion-reduce:transition-none"
          >
            <CloseTinyIcon className="size-[13px]" />
          </button>
        </span>
      ))}

      {/* mm:I520:11647;662:8911 — "+ Hashtag / Tối đa 5" */}
      {!atLimit && (
        <button
          type="button"
          aria-label={labels.add}
          aria-expanded={open}
          aria-describedby={describedBy}
          onClick={() => {
            setOpen((value) => !value);
            window.setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className={`flex h-12 shrink-0 items-center gap-1 rounded-lg border bg-white px-2 py-1 transition-colors duration-200 ease-out hover:bg-[#FFEA9E]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#998C5F] motion-reduce:transition-none ${
            invalid ? "border-[#CF1322]" : "border-[#998C5F]"
          }`}
        >
          <PlusIcon className="size-6 text-[#00101A]" />
          <span className="flex flex-col items-start text-left">
            <span className="text-sm leading-[22px] font-bold tracking-[0.5px] text-[#00101A]">
              {labels.title}
            </span>
            <span className="text-[11px] leading-4 font-bold tracking-[0.5px] text-[#999]">
              {labels.max}
            </span>
          </span>
        </button>
      )}

      {open && !atLimit && (
        <div className="absolute top-14 left-0 z-50 w-72 max-w-full rounded-lg border border-[#998C5F] bg-white p-2 shadow-lg">
          <input
            ref={inputRef}
            type="text"
            value={query}
            aria-label={labels.inputLabel}
            placeholder={labels.placeholder}
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                // This input lives inside the compose <form>; without this,
                // Enter would submit the Kudo instead of adding the tag.
                event.preventDefault();
                add(query);
              }
              if (event.key === "Escape") setOpen(false);
            }}
            className="mb-1 h-10 w-full rounded border border-[#998C5F] px-3 text-sm font-bold text-[#00101A] outline-none placeholder:text-[#999] focus-visible:border-[#00101A]"
          />
          <div role="listbox" aria-label={labels.title} className="max-h-48 overflow-y-auto">
            {canCreate && (
              <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => add(query)}
                  className="w-full rounded px-3 py-2 text-left text-sm font-bold text-[#00101A] hover:bg-[#FFF8E1]"
                >
                  {labels.create} <span className="text-[#E46060]">#{query.trim()}</span>
                </button>
            )}
            {suggestions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => add(option.label)}
                  className="w-full rounded px-3 py-2 text-left text-sm font-bold text-[#00101A] hover:bg-[#FFF8E1]"
                >
                  #{option.label}
                </button>
            ))}
            {!canCreate && suggestions.length === 0 && (
              <p className="px-3 py-2 text-sm font-bold text-[#999]">{labels.empty}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
