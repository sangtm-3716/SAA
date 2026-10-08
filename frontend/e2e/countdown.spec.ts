import { test, expect } from '@playwright/test';

test.describe('Countdown / Prelaunch Page (/countdown)', () => {
  test.describe('Access Control', () => {
    test('TC-e6a59553: Unauthenticated user can access /countdown (public route)', async ({
      page,
    }) => {
      // Navigate and capture response to verify status 200 (not 404)
      const response = await page.goto('/countdown');
      expect(response?.status()).toBe(200);

      // Verify a countdown-specific element is visible to prove it's the countdown page
      const countdownPage = page.getByTestId('countdown-page');
      await expect(countdownPage).toBeVisible();
    });
  });

  test.describe('Layout & Components', () => {
    test('TC-400e248f: Days unit displays two-digit LED-style display with uppercase white label', async ({
      page,
    }) => {
      await page.goto('/countdown');

      const daysUnit = page.getByTestId('countdown-days');
      await expect(daysUnit).toBeVisible();

      const daysValue = page.getByTestId('countdown-days-value');
      const daysLabel = page.getByTestId('countdown-days-label');

      // Assert value is visible and matches two-digit format
      await expect(daysValue).toBeVisible();
      const valueText = await daysValue.textContent();
      expect(valueText).toMatch(/^\d{2}$/);

      // Assert label is visible and reads 'DAYS'
      await expect(daysLabel).toBeVisible();
      await expect(daysLabel).toContainText('DAYS');

      // Verify label color is white
      const labelColor = await daysLabel.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      // White can be 'rgb(255, 255, 255)', 'white', or similar
      expect(labelColor.toLowerCase()).toMatch(/(white|255.*255.*255)/);
    });

    test('TC-25d9ddaa: Hours unit displays two-digit LED-style display with uppercase white label', async ({
      page,
    }) => {
      await page.goto('/countdown');

      const hoursUnit = page.getByTestId('countdown-hours');
      await expect(hoursUnit).toBeVisible();

      const hoursValue = page.getByTestId('countdown-hours-value');
      const hoursLabel = page.getByTestId('countdown-hours-label');

      await expect(hoursValue).toBeVisible();
      const valueText = await hoursValue.textContent();
      expect(valueText).toMatch(/^\d{2}$/);

      await expect(hoursLabel).toBeVisible();
      await expect(hoursLabel).toContainText('HOURS');

      const labelColor = await hoursLabel.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      expect(labelColor.toLowerCase()).toMatch(/(white|255.*255.*255)/);
    });

    test('TC-68cf8e17: Minutes unit displays two-digit LED-style display with uppercase white label', async ({
      page,
    }) => {
      await page.goto('/countdown');

      const minutesUnit = page.getByTestId('countdown-minutes');
      await expect(minutesUnit).toBeVisible();

      const minutesValue = page.getByTestId('countdown-minutes-value');
      const minutesLabel = page.getByTestId('countdown-minutes-label');

      await expect(minutesValue).toBeVisible();
      const valueText = await minutesValue.textContent();
      expect(valueText).toMatch(/^\d{2}$/);

      await expect(minutesLabel).toBeVisible();
      await expect(minutesLabel).toContainText('MINUTES');

      const labelColor = await minutesLabel.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      expect(labelColor.toLowerCase()).toMatch(/(white|255.*255.*255)/);
    });

    test('TC-37fd89d1: All labels are uppercase and white', async ({ page }) => {
      await page.goto('/countdown');

      const daysLabel = page.getByTestId('countdown-days-label');
      const hoursLabel = page.getByTestId('countdown-hours-label');
      const minutesLabel = page.getByTestId('countdown-minutes-label');

      // All labels must be visible first
      await expect(daysLabel).toBeVisible();
      await expect(hoursLabel).toBeVisible();
      await expect(minutesLabel).toBeVisible();

      // Verify text is uppercase
      const daysText = await daysLabel.textContent();
      const hoursText = await hoursLabel.textContent();
      const minutesText = await minutesLabel.textContent();

      expect(daysText).toBe(daysText?.toUpperCase());
      expect(hoursText).toBe(hoursText?.toUpperCase());
      expect(minutesText).toBe(minutesText?.toUpperCase());

      // All should be white
      for (const label of [daysLabel, hoursLabel, minutesLabel]) {
        const color = await label.evaluate((el) => {
          return window.getComputedStyle(el).color;
        });
        expect(color.toLowerCase()).toMatch(/(white|255.*255.*255)/);
      }
    });

    test('TC-Implicit: Background element is present', async ({ page }) => {
      await page.goto('/countdown');

      const background = page.getByTestId('countdown-background');
      await expect(background).toBeVisible();
    });

    test('TC-Implicit: Title displays localized text', async ({ page }) => {
      await page.goto('/countdown');

      const title = page.getByTestId('countdown-title');
      await expect(title).toBeVisible();

      // Default locale is Vietnamese per clarifications
      await expect(title).toContainText('Sự kiện sẽ bắt đầu sau');
    });
  });

  test.describe('Values & Formatting', () => {
    test('TC-c715cb38: All displayed values are formatted with two digits', async ({
      page,
    }) => {
      await page.goto('/countdown');

      const daysValue = page.getByTestId('countdown-days-value');
      const hoursValue = page.getByTestId('countdown-hours-value');
      const minutesValue = page.getByTestId('countdown-minutes-value');

      // All must be visible first
      await expect(daysValue).toBeVisible();
      await expect(hoursValue).toBeVisible();
      await expect(minutesValue).toBeVisible();

      const daysText = await daysValue.textContent();
      const hoursText = await hoursValue.textContent();
      const minutesText = await minutesValue.textContent();

      expect(daysText).toMatch(/^\d{2}$/);
      expect(hoursText).toMatch(/^\d{2}$/);
      expect(minutesText).toMatch(/^\d{2}$/);
    });

    test('TC-Implicit: Values respect min/max constraints', async ({ page }) => {
      await page.goto('/countdown');

      const daysValue = page.getByTestId('countdown-days-value');
      const hoursValue = page.getByTestId('countdown-hours-value');
      const minutesValue = page.getByTestId('countdown-minutes-value');

      // Assert presence FIRST. Without this, a missing element yields null and a
      // `|| '0'` fallback would parse to 0 and satisfy every bound below — the
      // test would pass against a 404.
      await expect(hoursValue).toBeVisible();
      await expect(minutesValue).toBeVisible();
      await expect(daysValue).toBeVisible();

      const hours = parseInt(await hoursValue.innerText(), 10);
      const minutes = parseInt(await minutesValue.innerText(), 10);

      // Only the UPPER bounds carry information: a parsed 2-digit string can
      // never be negative, so a `>= 0` assertion is a tautology.
      expect(hours).toBeLessThanOrEqual(23);
      expect(minutes).toBeLessThanOrEqual(59);
      expect(Number.isNaN(hours)).toBe(false);
      expect(Number.isNaN(minutes)).toBe(false);
    });
  });

  test.describe('Localization', () => {
    test('TC-Implicit: Default locale is Vietnamese', async ({ page, context }) => {
      await page.goto('/countdown');

      const title = page.getByTestId('countdown-title');
      await expect(title).toBeVisible();

      // Vietnamese text should be present
      await expect(title).toContainText('Sự kiện sẽ bắt đầu sau');
    });

    test('TC-Implicit: Switching to English via NEXT_LOCALE cookie updates title', async ({
      page,
      context,
    }) => {
      // Set the NEXT_LOCALE cookie to English
      await context.addCookies([
        {
          name: 'NEXT_LOCALE',
          value: 'en',
          url: 'http://localhost:3000',
        },
      ]);

      await page.goto('/countdown');

      const title = page.getByTestId('countdown-title');
      await expect(title).toBeVisible();

      // English text should be present
      await expect(title).toContainText('Event starts in');
    });

    test('TC-Implicit: Language selector button updates locale', async ({
      page,
      context,
    }) => {
      await page.goto('/countdown');

      // Verify default Vietnamese
      const title = page.getByTestId('countdown-title');
      await expect(title).toBeVisible();
      await expect(title).toContainText('Sự kiện sẽ bắt đầu sau');

      // Open language selector if present
      const langSelector = page.getByTestId('language-selector');
      if (await langSelector.isVisible()) {
        await langSelector.click();

        const enOption = page.getByTestId('language-option-en');
        if (await enOption.isVisible()) {
          await enOption.click();

          // Wait for potential redirect/reload
          await page.waitForTimeout(500);

          // Check cookie was set
          const cookies = await context.cookies();
          const nextLocaleCookie = cookies.find((c) => c.name === 'NEXT_LOCALE');
          expect(nextLocaleCookie?.value).toBe('en');

          // Verify title changed to English
          await expect(title).toContainText('Event starts in');
        }
      }
    });
  });

  test.describe('Real-time Updates', () => {
    test('@locked TC-840dd6be: Display values update automatically over time', async ({
      page,
    }) => {
      // Needs headroom: a minute rollover can be up to 60s away.
      test.setTimeout(90_000);
      await page.goto('/countdown');

      const minutesValue = page.getByTestId('countdown-minutes-value');
      await expect(minutesValue).toBeVisible();

      const initialMinutes = await minutesValue.textContent();

      // The design exposes no SECONDS unit, so the smallest observable change
      // is one minute. Polling for a few seconds could only pass by luck —
      // landing on a minute boundary — so wait for a real rollover, which is
      // guaranteed within 60s. Slow, but it is the only honest way to prove the
      // hook is genuinely ticking rather than rendering once and freezing.
      await expect(minutesValue).not.toHaveText(initialMinutes ?? '', {
        timeout: 70_000,
      });
    });
  });

  test.describe('Navigation Lock', () => {
    // Supabase being DOWN is not only a limitation here — it is the exact
    // condition the fail-open rule exists for, so this one is fully testable now
    // and guards the worst failure mode in the feature: an unreadable
    // event_settings turning every route into a redirect loop.
    test('Lock fails OPEN when the event start cannot be read', async ({
      page,
    }) => {
      // Supabase is not running, so the event-start read cannot succeed.
      const response = await page.goto('/login');

      // /login must still be reachable. If the lock failed CLOSED it would
      // bounce here to /countdown, and with /countdown itself unreadable the
      // whole app would be unreachable.
      expect(response?.status()).toBe(200);
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByTestId('google-login-button')).toBeVisible();
    });

    test('@locked Countdown route is never caught by its own lock', async ({ page }) => {
      // A guard that redirects to /countdown must exempt /countdown, or it
      // redirect-loops into ERR_TOO_MANY_REDIRECTS.
      const response = await page.goto('/countdown');
      expect(response?.status()).toBe(200);
      await expect(page).toHaveURL(/\/countdown$/);
      await expect(page.getByTestId('countdown-page')).toBeVisible();
    });

    test('@locked TC-Implicit: Navigation to /todo redirects to /countdown when countdown is active', async ({
      page,
    }) => {
      // With EVENT_STARTS_AT set to far-future on the locked server,
      // the countdown is guaranteed to be active (> 0)
      // Navigating to /todo should redirect to /countdown
      await page.goto('/todo', { waitUntil: 'networkidle' });

      // Verify redirected to countdown
      await expect(page).toHaveURL(/\/countdown$/);
      const countdownPage = page.getByTestId('countdown-page');
      await expect(countdownPage).toBeVisible();
    });

    test('@locked TC-Implicit: Auth routes are not blocked by countdown lock', async ({
      page,
    }) => {
      // With EVENT_STARTS_AT set to far-future, the countdown is active
      // But /auth/* routes should NOT be redirected to /countdown
      // This test verifies the lock allows auth routes to proceed
      // (Note: /auth/callback returns 404 without valid OAuth state, but the key
      // is that the middleware does not redirect it to /countdown)
      await page.goto('/auth/callback', { waitUntil: 'networkidle' });

      // goto() FOLLOWS redirects, so response.status() is the FINAL status and
      // `not.toBe(307)` would pass regardless — a tautology. The real invariant
      // is where we LANDED: the lock must not have swallowed the auth route.
      // /auth/callback with no OAuth code legitimately redirects to
      // /login?error=auth; what must never happen is landing on /countdown.
      // The bypass is proven by the auth handler having RUN, not by the final
      // landing page. With the lock active the chain is:
      //   /auth/callback (bypassed, handler runs, no OAuth code)
      //     -> /login?error=auth
      //     -> lock catches /login -> /countdown?error=auth
      // The surviving `error=auth` is the evidence the handler executed. A
      // BROKEN bypass would short-circuit /auth/callback straight to
      // /countdown with no query string at all.
      await expect(page).toHaveURL(/error=auth/);
    });

    test('TC-Implicit: Navigation lock is released when countdown reaches zero', async ({
      page,
    }) => {
      // Requires time-travel or waiting for actual countdown
      test.fixme(
        true,
        'Cannot advance to zero-countdown state without controlling server time (requires running Supabase)'
      );
    });
  });

  test.describe('Error Handling', () => {
    test('TC-Implicit: Malformed or missing target datetime gracefully displays "00"', async ({
      page,
    }) => {
      // This test depends on the implementation handling a missing/invalid
      // event_settings table entry. We cannot inject that error state
      // without a running Supabase backend.
      test.fixme(
        true,
        'Cannot inject invalid event_settings without running Supabase'
      );
    });
  });

  test.describe('Redirect Guard (Unlocked Server)', () => {
    test('TC-Implicit: Unauthenticated /todo redirects to /login when countdown is zero', async ({
      page,
    }) => {
      // This test runs on the UNLOCKED server (port 3000, no EVENT_STARTS_AT)
      // When countdown is not active (zero), the normal redirect flow applies:
      // unauthenticated /todo → /login
      // This requires running on the unlocked server where the lock is disabled
      test.fixme(
        true,
        'This test must run on the unlocked server (port 3000). Mark as unskipped for the normal chromium project.'
      );
    });
  });
});
