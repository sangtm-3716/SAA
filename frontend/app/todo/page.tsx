import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/todo/sign-out-button";

/**
 * The middleware guard (lib/supabase/middleware.ts) redirects an
 * unauthenticated request before this component ever renders, but that is a
 * redirect convenience, not the authorization boundary. The real gate is
 * the getUser() check below — it revalidates the JWT against the auth
 * server, unlike getSession() which only trusts an unverified cookie.
 */
export default async function TodoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const t = await getTranslations("todo");

  return (
    <main
      data-testid="todo-page"
      className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 p-8"
    >
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p>
        {t("signedInAs")}{" "}
        <span data-testid="signed-in-email">{user.email}</span>
      </p>
      <SignOutButton />
    </main>
  );
}
