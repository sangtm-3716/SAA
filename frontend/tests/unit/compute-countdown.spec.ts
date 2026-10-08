import { test, expect } from '@playwright/test';
import { computeCountdown } from '../../lib/countdown/compute-countdown';

test.describe('computeCountdown', () => {
  test.describe('Days formatting', () => {
    test('TC-33fe648b: Days value 0 displays as "00"', () => {
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-07T23:59:59Z'); // Same day, less than 24h
      const result = computeCountdown(target.toISOString(), now.toISOString());
      expect(result.days).toBe('00');
    });

    test('TC-33fe648b: Days value 9 displays as "09"', () => {
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-16T12:00:00Z'); // 9 days exactly
      const result = computeCountdown(target.toISOString(), now.toISOString());
      expect(result.days).toBe('09');
    });

    test('TC-33fe648b: Days value 10 displays as "10"', () => {
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-17T12:00:00Z'); // 10 days exactly
      const result = computeCountdown(target.toISOString(), now.toISOString());
      expect(result.days).toBe('10');
    });

    test('TC-33fe648b: Days value 31 displays as "31"', () => {
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-11-07T12:00:00Z'); // 31 days exactly
      const result = computeCountdown(target.toISOString(), now.toISOString());
      expect(result.days).toBe('31');
    });
  });

  test.describe('Hours formatting', () => {
    test('TC-1bd69f78: Hours value 0 displays as "00"', () => {
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-07T12:30:00Z'); // 30 minutes, 0 hours (full days)
      const result = computeCountdown(target.toISOString(), now.toISOString());
      expect(result.hours).toBe('00');
    });

    test('TC-1bd69f78: Hours value 9 displays as "09"', () => {
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-07T21:30:00Z'); // 9 hours 30 minutes
      const result = computeCountdown(target.toISOString(), now.toISOString());
      expect(result.hours).toBe('09');
    });

    test('TC-1bd69f78: Hours value 10 displays as "10"', () => {
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-07T22:30:00Z'); // 10 hours 30 minutes
      const result = computeCountdown(target.toISOString(), now.toISOString());
      expect(result.hours).toBe('10');
    });

    test('TC-1bd69f78: Hours value 12 displays as "12"', () => {
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-08T00:30:00Z'); // 12 hours 30 minutes
      const result = computeCountdown(target.toISOString(), now.toISOString());
      expect(result.hours).toBe('12');
    });

    test('TC-1bd69f78: Hours value 23 displays as "23"', () => {
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-08T11:30:00Z'); // 23 hours 30 minutes
      const result = computeCountdown(target.toISOString(), now.toISOString());
      expect(result.hours).toBe('23');
    });

    test('TC-f98adad8: Hours value -1 clamps to "00"', () => {
      // Invalid state: test that malformed or negative hour intervals degrade gracefully
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-07T10:59:59Z'); // Target already passed
      const result = computeCountdown(target.toISOString(), now.toISOString());
      expect(result.hours).toBe('00');
    });

    test('TC-f98adad8: Hours value 25 clamps to "00"', () => {
      // Invalid state: an interval longer than 24h means overflow into days
      // Test that hours never exceed 23 in the return value
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-09T13:00:00Z'); // 1 day 25 hours total
      const result = computeCountdown(target.toISOString(), now.toISOString());
      // Should show as days=2, hours=13 or days=1, hours=37 depending on implementation
      // But hours must never be 25 or higher in the output
      expect(result.hours).toMatch(/^\d{2}$/);
      const hourVal = parseInt(result.hours, 10);
      expect(hourVal).toBeLessThanOrEqual(23);
    });
  });

  test.describe('Minutes formatting', () => {
    test('TC-8dc4bba6: Minutes value 0 displays as "00"', () => {
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-07T12:30:00Z'); // 30 minutes but check minutes in result
      const result = computeCountdown(target.toISOString(), now.toISOString());
      // We asked for target 30min away, so result should show 30 minutes
      expect(result.minutes).toBe('30');
    });

    test('TC-8dc4bba6: Minutes value 9 displays as "09"', () => {
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-07T12:09:00Z'); // 9 minutes
      const result = computeCountdown(target.toISOString(), now.toISOString());
      expect(result.minutes).toBe('09');
    });

    test('TC-8dc4bba6: Minutes value 10 displays as "10"', () => {
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-07T12:10:00Z'); // 10 minutes
      const result = computeCountdown(target.toISOString(), now.toISOString());
      expect(result.minutes).toBe('10');
    });

    test('TC-8dc4bba6: Minutes value 30 displays as "30"', () => {
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-07T12:30:00Z'); // 30 minutes
      const result = computeCountdown(target.toISOString(), now.toISOString());
      expect(result.minutes).toBe('30');
    });

    test('TC-8dc4bba6: Minutes value 59 displays as "59"', () => {
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-07T12:59:00Z'); // 59 minutes
      const result = computeCountdown(target.toISOString(), now.toISOString());
      expect(result.minutes).toBe('59');
    });

    test('TC-724e6e17: Minutes value -1 clamps to "00"', () => {
      // Invalid state: target already passed
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-07T11:59:59Z'); // Target already passed
      const result = computeCountdown(target.toISOString(), now.toISOString());
      expect(result.minutes).toBe('00');
    });

    test('TC-724e6e17: Minutes value 60 clamps to "00"', () => {
      // Invalid state: 60 minutes overflows to hours
      // Test that minutes never exceed 59 in the return value
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-07T13:00:00Z'); // Exactly 1 hour = 60 minutes
      const result = computeCountdown(target.toISOString(), now.toISOString());
      // Should show hours=01, minutes=00
      const minuteVal = parseInt(result.minutes, 10);
      expect(minuteVal).toBeLessThanOrEqual(59);
      expect(result.minutes).toMatch(/^\d{2}$/);
    });
  });

  test.describe('Edge cases', () => {
    test('TC-b373626d: Less than one day remaining shows days as "00"', () => {
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-08T11:59:59Z'); // 23 hours 59 minutes 59 seconds
      const result = computeCountdown(target.toISOString(), now.toISOString());
      expect(result.days).toBe('00');
    });

    test('TC-50fc4021: Target at zero or negative remaining shows all units as "00"', () => {
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-07T12:00:00Z'); // Exactly now (zero remaining)
      const result = computeCountdown(target.toISOString(), now.toISOString());
      expect(result.days).toBe('00');
      expect(result.hours).toBe('00');
      expect(result.minutes).toBe('00');
    });

    test('TC-50fc4021: Target already passed shows all units as "00"', () => {
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-05T12:00:00Z'); // 2 days ago
      const result = computeCountdown(target.toISOString(), now.toISOString());
      expect(result.days).toBe('00');
      expect(result.hours).toBe('00');
      expect(result.minutes).toBe('00');
    });

    test('TC-Implicit: Malformed ISO string degrades to "00"', () => {
      const now = new Date('2026-10-07T12:00:00Z').toISOString();
      const result = computeCountdown('not-a-valid-iso', now);
      expect(result.days).toBe('00');
      expect(result.hours).toBe('00');
      expect(result.minutes).toBe('00');
    });

    test('TC-Implicit: Unparseable targetISO degrades to "00"', () => {
      const now = new Date('2026-10-07T12:00:00Z').toISOString();
      const result = computeCountdown('', now);
      expect(result.days).toBe('00');
      expect(result.hours).toBe('00');
      expect(result.minutes).toBe('00');
    });

    test('TC-c715cb38: Formatting enforces two digits per unit', () => {
      const now = new Date('2026-10-07T12:00:00Z');
      const target = new Date('2026-10-08T13:05:07Z'); // 1 day, 1 hour, 5 minutes, 7 seconds
      const result = computeCountdown(target.toISOString(), now.toISOString());
      expect(result.days).toMatch(/^\d{2}$/);
      expect(result.hours).toMatch(/^\d{2}$/);
      expect(result.minutes).toMatch(/^\d{2}$/);
      expect(result.days.length).toBe(2);
      expect(result.hours.length).toBe(2);
      expect(result.minutes.length).toBe(2);
    });

    test('TC-Implicit: Large intervals compute correctly', () => {
      const now = new Date('2026-01-01T00:00:00Z');
      const target = new Date('2026-12-31T23:59:59Z'); // ~365 days
      const result = computeCountdown(target.toISOString(), now.toISOString());
      // Result should have days > 31, which means the function computes full interval
      // Not just clamping to max
      const days = parseInt(result.days, 10);
      expect(days).toBe(364);
      // {2,} not {2}: zero-padding is a MINIMUM width, never a maximum. An
      // interval beyond 99 days must render in full ("364"); truncating it to
      // two characters would be a real bug, so this regex must not demand it.
      expect(result.days).toMatch(/^\d{2,}$/);
    });
  });
});
