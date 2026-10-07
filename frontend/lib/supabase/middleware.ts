import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

const PROTECTED_PREFIX = "/todo";
const LOGIN_PATH = "/login";

/**
 * Refreshes the Supabase session on every matched request and enforces the
 * two route guards. The response-object handling here is the single most
 * common way this pattern breaks: whichever response object `setAll` last
 * built is the one holding the refreshed tokens, so it — and only it — must
 * be the one eventually returned (or have its cookies copied onto a
 * redirect). Returning an earlier response silently drops the refresh and
 * signs the user out on a later request.
 *
 * Nothing may run between `createServerClient(...)` and the `getClaims()`
 * call below — interleaved logic can trigger a token refresh whose `setAll`
 * lands after the response has already been read.
 */
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
