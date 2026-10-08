import { digitalNumbers } from "./fonts";

/**
 * Single LED-style glass tile holding one digit character.
 *
 * mm:186:2619 (Group 5 / Group 4 — INSTANCE, same componentId reused twice
 * per unit) — one tile per digit: node I*;186:2616 is the glass panel
 * (border + translucent gradient + blur), node I*;186:2617 is the digit
 * glyph in the "Digital Numbers" font.
 */
export function CountdownDigitBox({ digit }: { digit: string }) {
  return (
    // mm:186:2616
    <div className="flex h-[123px] w-[77px] items-center justify-center rounded-xl border-[0.75px] border-[#FFEA9E]/50 bg-gradient-to-b from-white to-white/10 backdrop-blur-2xl">
      {/* mm:186:2617 */}
      <span
        className={`${digitalNumbers.className} text-[74px] leading-none text-white`}
      >
        {digit}
      </span>
    </div>
  );
}
