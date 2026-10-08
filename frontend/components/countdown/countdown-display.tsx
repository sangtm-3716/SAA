import { CountdownUnit } from "./countdown-unit";
import { montserrat } from "./fonts";

export interface CountdownDisplayProps {
  title: string;
  days: string;
  hours: string;
  minutes: string;
  labels: { days: string; hours: string; minutes: string };
}

/**
 * Centred title + three countdown units.
 *
 * mm:2268:35136 (Countdown time) — title text followed by the three-unit
 * row. All content is plain strings, no internal state, so phase 07 can
 * inject live `useCountdown` output (and later i18n catalog strings) without
 * restructuring this component, per the binding integration contract in
 * phase-06.
 */
export function CountdownDisplay({
  title,
  days,
  hours,
  minutes,
  labels,
}: CountdownDisplayProps) {
  return (
    // mm:2268:35136
    <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-4 text-center">
      {/* mm:2268:35137 */}
      <h1
        data-testid="countdown-title"
        className={`${montserrat.className} text-4xl leading-[48px] font-bold text-white`}
      >
        {title}
      </h1>
      {/* mm:2268:35138 (Time) */}
      <div className="flex flex-row flex-wrap items-center justify-center gap-[60px]">
        <CountdownUnit testId="countdown-days" value={days} label={labels.days} />
        <CountdownUnit
          testId="countdown-hours"
          value={hours}
          label={labels.hours}
        />
        <CountdownUnit
          testId="countdown-minutes"
          value={minutes}
          label={labels.minutes}
        />
      </div>
    </div>
  );
}
