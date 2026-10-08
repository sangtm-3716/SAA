import { CountdownDigitBox } from "./countdown-digit-box";
import { montserrat } from "./fonts";

/**
 * One countdown unit (days/hours/minutes): a row of per-digit LED tiles plus
 * an uppercase label underneath.
 *
 * mm:2268:35139 (1_Days) / mm:2268:35144 (2_Hours) / mm:2268:35149
 * (3_Minutes) — structurally identical, so a single prop-driven component
 * covers all three. `value` and `label` are plain strings so phase 07 can
 * swap in live `useCountdown` output without touching this markup, per the
 * binding integration contract.
 */
export function CountdownUnit({
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
    // mm:2268:35139
    <div
      data-testid={testId}
      className="flex flex-col items-start gap-[21px]"
    >
      {/* mm:2268:35140 */}
      <div
        data-testid={`${testId}-value`}
        className="flex flex-row items-center gap-[21px]"
      >
        {digits.map((digit, index) => (
          <CountdownDigitBox key={index} digit={digit} />
        ))}
      </div>
      {/* mm:2268:35143 */}
      <span
        data-testid={`${testId}-label`}
        className={`${montserrat.className} text-4xl leading-[48px] font-bold uppercase text-white`}
      >
        {label}
      </span>
    </div>
  );
}
