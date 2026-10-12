"use client";

import { useEffect, useRef, useState } from "react";
import type { FilterOption } from "@/lib/kudos/types";
import { MaskedIcon } from "@/components/awards/masked-icon";

/**
 * mm:2940:13459 ("B.1.1_ButtonHashtag") / mm:2940:13460 ("B.1.2_Button Phong
 * ban") — the trigger prints a fixed label ("Hashtag" / "Phòng ban"), not the
 * selected value. The open panel has no MoMorph spec on this screen, so its
 * chrome follows the project's established dropdown idiom from
 * `components/login/language-selector.tsx` (role="listbox"/"option",
 * click-outside close, Escape + focus restore, roving arrow-key focus).
 */
export function KudosFilterSelect({
  label,
  allLabel,
  options,
  value,
  onChange,
}: {
  /** mm:…;186:2760 — the static trigger text, e.g. "Hashtag". */
  label: string;
  /** The "clear filter" row shown above every option. */
  allLabel: string;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const allValues: Array<string | null> = [null, ...options.map((option) => option.value)];
  const testId = label.toLowerCase().replace(/\s+/g, "-");

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Opening moves focus to the currently active row, mirroring
  // language-selector.tsx's behaviour for the same reason: a keyboard user
  // tabbing from the trigger should land inside the open panel.
  useEffect(() => {
    if (!open) return;
    const activeIndex = allValues.indexOf(value);
    optionRefs.current[activeIndex === -1 ? 0 : activeIndex]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close({ restoreFocus }: { restoreFocus: boolean }) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }

  function handleSelect(next: string | null) {
    onChange(next);
    close({ restoreFocus: true });
  }

  function handleOptionKeyDown(event: React.KeyboardEvent, index: number) {
    const { key } = event;
    if (key !== "ArrowDown" && key !== "ArrowUp" && key !== "Home" && key !== "End") return;
    event.preventDefault();
    const count = allValues.length;
    const nextIndex =
      key === "Home"
        ? 0
        : key === "End"
          ? count - 1
          : key === "ArrowDown"
            ? (index + 1) % count
            : (index - 1 + count) % count;
    optionRefs.current[nextIndex]?.focus();
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          close({ restoreFocus: true });
        }
      }}
    >
      {/* mm:2940:13459 / mm:2940:13460 */}
      <button
        ref={triggerRef}
        type="button"
        data-testid={`kudos-filter-trigger-${testId}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-2 rounded border border-[#998C5F] bg-[rgba(255,234,158,0.10)] p-4 text-white transition-colors duration-200 ease-out hover:bg-[rgba(255,234,158,0.20)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none"
      >
        {/* mm:…;186:2760 */}
        <span className="text-base leading-6 font-bold tracking-[0.15px]">{label}</span>
        {/* mm:…;186:2761 (MM_MEDIA_Down) */}
        <MaskedIcon
          src="/kudos/icon-chevron-down.svg"
          size={24}
          className={`text-white transition-transform duration-200 ease-out motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          data-testid={`kudos-filter-listbox-${testId}`}
          role="listbox"
          aria-label={label}
          className="absolute right-0 z-30 mt-2 flex min-w-[160px] flex-col rounded-lg border border-[#998C5F] bg-[#00070C] p-1.5 shadow-lg"
        >
          <button
            ref={(node) => {
              optionRefs.current[0] = node;
            }}
            type="button"
            data-testid={`kudos-filter-option-${testId}-all`}
            role="option"
            aria-selected={value === null}
            onClick={() => handleSelect(null)}
            onKeyDown={(event) => handleOptionKeyDown(event, 0)}
            className={`w-full cursor-pointer rounded-sm px-4 py-3 text-left text-white transition-colors duration-150 ease-out hover:bg-[#FFEA9E]/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none ${
              value === null ? "bg-[#FFEA9E]/20" : ""
            }`}
          >
            <span className="text-base leading-6 font-bold tracking-[0.15px]">{allLabel}</span>
          </button>
          {options.map((option, i) => {
            const index = i + 1;
            const isActive = option.value === value;
            return (
              <button
                key={option.value}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                type="button"
                data-testid={`kudos-filter-option-${testId}-${option.value}`}
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(option.value)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                className={`w-full cursor-pointer rounded-sm px-4 py-3 text-left text-white transition-colors duration-150 ease-out hover:bg-[#FFEA9E]/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none ${
                  isActive ? "bg-[#FFEA9E]/20" : ""
                }`}
              >
                <span className="text-base leading-6 font-bold tracking-[0.15px]">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
