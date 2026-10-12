import { MaskedIcon } from "@/components/awards/masked-icon";

/**
 * Prev/next control for the HIGHLIGHT KUDOS carousel (mm:2940:13471,
 * B.5_slide). Split out of `highlight-carousel.tsx` to keep that file inside
 * the project's 200-line budget.
 */
/** Shared prev/next button; `edge` wraps it in the mm:2940:13469/2940:13467 gradient fade panel. */
export function NavButton({
  direction,
  size,
  iconSize,
  disabled,
  onClick,
  testId,
  edge = false,
}: {
  direction: "left" | "right";
  size: number;
  iconSize: number;
  disabled: boolean;
  onClick: () => void;
  testId?: string;
  edge?: boolean;
}) {
  const button = (
    // mm:I2940:13470;186:1420 / mm:I2940:13468;186:1420 / mm:I2940:13472;186:1420 / mm:I2940:13474;186:1420
    <button
      type="button"
      aria-label={direction === "left" ? "previous" : "next"}
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      style={{ height: size, width: size }}
      className={`flex cursor-pointer items-center justify-center rounded transition-colors duration-200 ease-out hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none ${edge ? "pointer-events-auto" : ""}`}
    >
      <MaskedIcon src={`/kudos/icon-arrow-${direction}.svg`} size={iconSize} className="text-white" />
    </button>
  );
  if (!edge) return button;
  const side = direction === "left" ? "left-0 justify-start bg-gradient-to-r pl-4" : "right-0 justify-end bg-gradient-to-l pr-4";
  return (
    <div className={`pointer-events-none absolute inset-y-0 hidden w-32 items-center from-[#00101A] to-transparent lg:flex xl:w-48 ${side}`}>
      {button}
    </div>
  );
}
