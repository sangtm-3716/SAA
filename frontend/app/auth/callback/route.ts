import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TODO_PATH = "/todo";
const LOGIN_ERROR_PATH = "/login?error=auth";

/**
 * Exchanges the OAuth `code` for a session and lands the user on /todo.
 * Every failure path — a provider error, a missing code, or a failed
 * exchange (expired/replayed/invalid code) — redirects to
 * `/login?error=auth` rather than surfacing a stack trace. The opaque
 * `error=auth` marker is deliberate: never forward the provider's
 * `error_description`, which can carry reflected content.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const providerError = searchParams.get("error");

  if (providerError) {
    console.error("OAuth callback received provider error:", providerError);
    return NextResponse.redirect(new URL(LOGIN_ERROR_PATH, origin));
  }

  if (!code) {
    console.error("OAuth callback missing required 'code' parameter");
    return NextResponse.redirect(new URL(LOGIN_ERROR_PATH, origin));
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("OAuth code exchange failed:", error.message);
      return NextResponse.redirect(new URL(LOGIN_ERROR_PATH, origin));
    }

    return NextResponse.redirect(new URL(TODO_PATH, origin));
  } catch (err) {
    console.error(
      "Unexpected error during OAuth code exchange:",
      err instanceof Error ? err.message : "unknown error"
    );
    return NextResponse.redirect(new URL(LOGIN_ERROR_PATH, origin));
  }
}
