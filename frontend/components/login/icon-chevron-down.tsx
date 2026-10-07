import type { SVGProps } from "react";

/**
 * mm:I662:14391;186:1696;186:1821;186:1441 (MM_MEDIA_Down)
 * Single-color icon — fill converted to currentColor so the parent can set
 * the exact Figma color (white) via className/style.
 */
export function IconChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
    </svg>
  );
}
