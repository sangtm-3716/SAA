import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getEventStartsAt } from "@/lib/event/event-settings";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

const PROTECTED_PREFIX = "/todo";
const LOGIN_PATH = "/login";
const COUNTDOWN_PATH = "/countdown";
const AUTH_PREFIX = "/auth/";

/**
 * Refreshes the Supabase session on every matched request and enforces the
 * route guards. The response-object handling here is the single most
 * common way this pattern breaks: whichever response object `setAll` last
 * built is the one holding the refreshed tokens, so it — and only it — must
 * be the one eventually returned (or have its cookies copied onto a
 * redirect). Returning an earlier response silently drops the refresh and
 * signs the user out on a later request.
 *
 * Nothing may run between `createServerClient(...)` and the `getClaims()`
 * call below — interleaved logic can trigger a token refresh whose `setAll`
 * lands after the response has already been read.
 *
 * Routing decisions — the countdown lock below, then the two auth guards —
 * all happen strictly AFTER `getClaims()`. The lock runs first among them
 * and is checked before the `/todo` guard. It must not run earlier: a
 * short-circuit ahead of `getClaims()` would skip the session refresh on
 * every locked request, silently expiring sessions across a multi-week
 * prelaunch window. A `null` instant (env unset, DB unreachable, read
 * failure of any kind — see lib/event/event-settings.ts) always means
 * UNLOCKED — the lock fails open, never closed.
 */
function isCountdownBypassed(pathname: string): boolean {
  return (
    pathname === COUNTDOWN_PATH ||
    pathname.startsWith(`${COUNTDOWN_PATH}/`) ||
    pathname.startsWith(AUTH_PREFIX)
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Nothing may run between client construction and this call — see the
  // function doc comment above.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const { pathname } = request.nextUrl;

  const startsAt = await getEventStartsAt();
  const isLocked = startsAt !== null && Date.parse(startsAt) > Date.now();

  if (isLocked && !isCountdownBypassed(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = COUNTDOWN_PATH;
    const redirect = NextResponse.redirect(redirectUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });
    return redirect;
  }

  if (!user && pathname.startsWith(PROTECTED_PREFIX)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = LOGIN_PATH;
    const redirect = NextResponse.redirect(redirectUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });
    return redirect;
  }

  if (user && pathname === LOGIN_PATH) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = PROTECTED_PREFIX;
    const redirect = NextResponse.redirect(redirectUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });
    return redirect;
  }

  return supabaseResponse;
}
