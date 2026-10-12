"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CaretDownIcon } from "./compose-icons";

/**
 * The field shared by "Người nhận" (mm:I520:11647;520:9873) and "Danh hiệu"
 * (mm:I520:11647;1688:10437). Both are the same Figma component (186:2757) —
 * a white 56px box with a #998C5F hairline and the solid caret pinned right —
 * and they differ only in what a value means:
 *
 *   `freeText: false` (Người nhận) — the visible box is a search field and
 *      the submitted value is the SELECTED id, carried by a hidden input.
 *      Typing something nobody is called must not post a Kudo to nobody.
 *   `freeText: true` (Danh hiệu) — the typed string IS the value, and the
 *      list is only a shortcut. The field's own helper text reads "Ví dụ: …",
 *      and `create_kudos_post` accepts any title, so forcing a choice here
 *      would contradict both.
 *
 * Options are filtered in the browser rather than re-queried per keystroke:
 * `lib/kudos/compose-queries.ts` fetches the featured Sunners once, which is
 * dozens of rows, so a round-trip per character would buy nothing.
 */

export interface ComboOption {
  value: string;
  label: string;
  /** Second line in the list — the employee code, or the department. */
  secondary?: string | null;
  avatarUrl?: string | null;
}

interface ComboBoxProps {
  name: string;
  options: ComboOption[];
  placeholder: string;
  ariaLabel: string;
  freeText?: boolean;
  invalid?: boolean;
  emptyLabel: string;
  /** Rendered under the box; used for the "no Sunners loaded" case. */
  describedBy?: string;
}

function normalise(value: string): string {
  // Matching ignores diacritics so "Duong" finds "Dương" — on a Vietnamese
  // name list, requiring exact tone marks makes the search nearly unusable.
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
}

export function ComboBox({
  name,
  options,
  placeholder,
  ariaLabel,
  freeText = false,
  invalid = false,
  emptyLabel,
  describedBy,
}: ComboBoxProps) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ComboOption | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = normalise(query.trim());
    if (!q) return options;
    return options.filter(
      (option) =>
        normalise(option.label).includes(q) ||
        (option.secondary ? normalise(option.secondary).includes(q) : false),
    );
  }, [options, query]);

  // Closing on an outside click rather than on blur: blur fires before the
  // option's own click lands, which would close the list and swallow the pick.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function choose(option: ComboOption) {
    setSelected(option);
    setQuery(option.label);
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => {
        if (matches.length === 0) return 0;
        return (current + step + matches.length) % matches.length;
      });
      return;
    }
    if (event.key === "Enter" && open && matches[active]) {
      // Only swallow Enter when it is picking an option — otherwise it must
      // keep reaching the form so the keyboard can still submit.
      event.preventDefault();
      choose(matches[active]);
      return;
    }
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative w-full min-w-0 flex-1">
      {/* For the id-carrying variant the visible box is only a search field,
          so the value the server reads travels separately. */}
      {!freeText && <input type="hidden" name={name} value={selected?.value ?? ""} />}

      <input
        type="text"
        name={freeText ? name : undefined}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
          // A stale id must never survive an edited query, or the form would
          // post the person you had picked before you changed your mind.
          if (!freeText) setSelected(null);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className={`h-14 w-full rounded-lg border bg-white pr-14 pl-6 text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] transition-colors duration-200 ease-out outline-none placeholder:text-[#999] focus-visible:border-[#00101A] motion-reduce:transition-none ${
          invalid ? "border-[#CF1322]" : "border-[#998C5F] hover:border-[#00101A]/40"
        }`}
      />

      {/* mm:I520:11647;520:9873;186:2761 (MM_MEDIA_Down) */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={() => setOpen((value) => !value)}
        className="absolute top-0 right-0 flex h-14 w-14 items-center justify-center text-[#00101A]"
      >
        <CaretDownIcon className="size-6" />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          className="absolute top-[60px] left-0 z-50 max-h-64 w-full overflow-y-auto rounded-lg border border-[#998C5F] bg-white py-1 shadow-lg"
        >
          {matches.length === 0 ? (
            <p className="px-6 py-3 text-base leading-6 font-bold text-[#999]">{emptyLabel}</p>
          ) : (
            matches.map((option, index) => (
              <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected?.value === option.value}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(option)}
                  className={`flex w-full items-center gap-3 px-6 py-2.5 text-left transition-colors duration-150 ease-out motion-reduce:transition-none ${
                    index === active ? "bg-[#FFF8E1]" : "bg-white"
                  }`}
                >
                  {option.avatarUrl !== undefined && (
                    /* eslint-disable-next-line @next/next/no-img-element -- 32px list avatar, no responsive variants needed */
                    <img
                      src={option.avatarUrl ?? "/kudos/avatar-sunner.png"}
                      alt=""
                      width={32}
                      height={32}
                      className="size-8 shrink-0 rounded-full object-cover"
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base leading-6 font-bold text-[#00101A]">
                      {option.label}
                    </span>
                    {option.secondary && (
                      <span className="block truncate text-sm leading-5 font-bold text-[#999]">
                        {option.secondary}
                      </span>
                    )}
                  </span>
                </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
