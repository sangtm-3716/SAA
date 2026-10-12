"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_IMAGES } from "@/lib/kudos/compose-types";
import { CloseTinyIcon, PlusIcon } from "./compose-icons";

/**
 * "Image" — mm:I520:11647;520:9896 (mms_F_Frame 537).
 *
 * Up to five 80x80 thumbnails plus the "+ Image / Tối đa 5" button. The tile
 * geometry, its #FFEA9E inner hairline and the #D4271D remove badge come
 * straight from the Figma nodes; this replaced an earlier static strip that
 * rendered the design's mock image five times.
 *
 * ## Why the hidden file input is written to
 *
 * Picked files live in React state so one can be removed without clearing the
 * rest — but a `<form action={...}>` submits whatever is in the DOM input, and
 * `input.files` is read-only. `DataTransfer` is the only way to construct a
 * `FileList`, so an effect mirrors state into the input before any submit.
 * The alternative — building FormData by hand in an onSubmit — would move the
 * whole form off the declarative action path for one field's sake.
 *
 * Previews use `URL.createObjectURL`, revoked when the file is dropped or the
 * component unmounts; without that every re-pick leaks a blob for the lifetime
 * of the document.
 */

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

interface PickedImage {
  id: string;
  file: File;
  previewUrl: string;
}

export function ImagePicker({
  labels,
  invalid,
  describedBy,
}: {
  labels: { title: string; max: string; add: string; remove: string; alt: string };
  invalid?: boolean;
  describedBy?: string;
}) {
  const [images, setImages] = useState<PickedImage[]>([]);
  const formInputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);

  // Mirror state into the input the form actually submits.
  useEffect(() => {
    const input = formInputRef.current;
    if (!input) return;
    const transfer = new DataTransfer();
    images.forEach(({ file }) => transfer.items.add(file));
    input.files = transfer.files;
  }, [images]);

  // Revoke on unmount only — removing a single image revokes its own URL in
  // the remove handler, so this cleanup must not depend on `images`.
  useEffect(() => {
    const urls = images.map((image) => image.previewUrl);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount-only cleanup
  }, []);

  const atLimit = images.length >= MAX_IMAGES;

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    if (picked.length === 0) return;

    setImages((current) => {
      const room = MAX_IMAGES - current.length;
      const accepted = picked.slice(0, room).map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      return [...current, ...accepted];
    });

    // Reset so re-picking the SAME file still fires a change event.
    event.target.value = "";
  }

  function remove(id: string) {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((image) => image.id !== id);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* The field the server reads. Kept out of the tab order and off-screen
          rather than `display:none`, so assistive tech is not told about an
          input the visible button already represents. */}
      <input
        ref={formInputRef}
        type="file"
        name="image"
        multiple
        accept={ACCEPT}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
        onChange={() => {
          /* written to programmatically; picking happens on the other input */
        }}
      />

      <input
        ref={pickerRef}
        type="file"
        multiple
        accept={ACCEPT}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
        onChange={onPick}
      />

      {images.map((image) => (
        // mm:I520:11647;662:9197 (mms_F.2_Image)
        <div key={image.id} className="relative size-20 shrink-0 rounded border border-[#998C5F] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview of a user-picked file; next/image cannot optimise an object URL */}
          <img
            src={image.previewUrl}
            alt={`${labels.alt}: ${image.file.name}`}
            width={80}
            height={80}
            className="size-full rounded border border-[#FFEA9E] object-cover"
          />
          {/* mm:I520:11647;662:9197;662:9287 (Button) */}
          <button
            type="button"
            aria-label={`${labels.remove}: ${image.file.name}`}
            onClick={() => remove(image.id)}
            className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-[#D4271D] text-white transition-colors duration-200 ease-out hover:bg-[#B01F17] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4271D] motion-reduce:transition-none"
          >
            <CloseTinyIcon className="size-[17px]" />
          </button>
        </div>
      ))}

      {/* mm:I520:11647;662:9133 — "+ Image / Tối đa 5" */}
      {!atLimit && (
        <button
          type="button"
          aria-label={labels.add}
          aria-describedby={describedBy}
          onClick={() => pickerRef.current?.click()}
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
    </div>
  );
}
