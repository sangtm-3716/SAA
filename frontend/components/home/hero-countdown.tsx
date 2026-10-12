import { digitalNumbers } from "@/components/countdown/fonts";

/**
 * Homepage hero countdown — mm:2167:9035 (mms_B1_Countdown time), inside the
 * hero (mm:2167:9031 "Frame 487").
 *
 * A SMALLER sibling of the dedicated `/countdown` page's LED tiles
 * (`components/countdown/countdown-digit-box.tsx` / `countdown-unit.tsx`):
 * this tile is 51x82 with an 8px radius and a 49.152px glyph
 * (mm:I2167:9040;186:2616 / mm:I2167:9040;186:2617), versus the countdown
 * page's 77x123 tile with a 12px radius and a 74px glyph. The two screens
 * are deliberately NOT the same component — this file owns the homepage
 * variant only and never edits the countdown page's files.
 *
 * Mobile sizes (the base, unprefixed Tailwind classes) are a restrained
 * proportional scale-down — the Figma file has no mobile frame for this
 * screen to match exactly. The `lg:` breakpoint carries the literal desktop
 * values queried from the node tree.
 */

interface HeroCountdownProps {
  /** mm:2167:9036 — verbatim Figma placeholder copy, e.g. "Comming soon" */
  countdownLabel: string;
  days: string;
  hours: string;
  minutes: string;
  unitLabels: {
    days: string;
    hours: string;
    minutes: string;
  };
}

function HeroDigitTile({ digit }: { digit: string }) {
  return (
    // mm:I2167:9040;186:2616 (Rectangle 1 — glass tile, shared shape for every digit instance)
    <div className="flex h-16 w-10 items-center justify-center rounded-lg border-[0.5px] border-[#FFEA9E]/50 bg-gradient-to-b from-white to-white/10 backdrop-blur-[16.64px] lg:h-[82px] lg:w-[51px]">
      {/* mm:I2167:9040;186:2617 */}
      <span
        // 49.152/82 is the design's glyph-to-tile ratio; 38/64 keeps the
        // same proportion on the smaller mobile tile. At 24px the digit
        // floated in the middle of the tile instead of filling it.
        className={`${digitalNumbers.className} text-[38px] leading-none text-white lg:text-[49.152px]`}
      >
        {digit}
      </span>
    </div>
  );
}

function HeroCountdownUnit({
  value,
  label,
  testId,
}: {
  value: string;
  label: string;
  testId: string;
}) {
  const digits = value.split("");

  return (
    // mm:2167:9038 (mms_B1.3.1_Days — structurally shared with Hours/Minutes)
    <div
      data-testid={testId}
      className="flex flex-col items-start justify-center gap-[14px]"
    >
      {/* mm:2167:9039 (Frame 485) */}
      <div
        data-testid={`${testId}-value`}
        className="flex flex-row items-center gap-[14px]"
      >
        {digits.map((digit, index) => (
          <HeroDigitTile key={index} digit={digit} />
        ))}
      </div>
      {/* mm:2167:9042 (DAYS / mm:2167:9047 HOURS / mm:2167:9052 MINUTES) */}
      <span
        data-testid={`${testId}-label`}
        className="text-base leading-6 font-bold text-white uppercase lg:text-2xl lg:leading-8"
      >
        {label}
      </span>
    </div>
  );
}

export function HeroCountdown({
  countdownLabel,
  days,
  hours,
  minutes,
  unitLabels,
}: HeroCountdownProps) {
  return (
    // mm:2167:9035 (mms_B1_Countdown time)
    <div className="flex flex-col items-start gap-4">
      {/* mm:2167:9036 (mms_B1.2_Coming soon) */}
      <span className="text-lg leading-7 font-bold text-white lg:text-2xl lg:leading-8">
        {countdownLabel}
      </span>
      {/* mm:2167:9037 (mms_B1.3_Countdown) */}
      <div className="flex flex-row flex-wrap items-center gap-10">
        <HeroCountdownUnit
          value={days}
          label={unitLabels.days}
          testId="hero-countdown-days"
        />
        <HeroCountdownUnit
          value={hours}
          label={unitLabels.hours}
          testId="hero-countdown-hours"
        />
        <HeroCountdownUnit
          value={minutes}
          label={unitLabels.minutes}
          testId="hero-countdown-minutes"
        />
      </div>
    </div>
  );
}
