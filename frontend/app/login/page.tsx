import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { normalizeLocale } from "@/i18n/locale";
import { montserrat } from "@/components/login/fonts";
import { LoginHeader } from "@/components/login/login-header";
import { HeroSection } from "@/components/login/hero-section";
import { SiteFooter } from "@/components/login/site-footer";
import { LoginPageBackground } from "@/components/login/login-page-background";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("login");
  return { title: `SAA 2025 – ${t("metaTitle")}` };
}

const AUTH_ERROR_PARAM = "auth";

// mm:662:14387 (Login)
export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const [t, locale, params] = await Promise.all([
    getTranslations("login"),
    getLocale(),
    searchParams,
  ]);

  const errorMessage =
    params.error === AUTH_ERROR_PARAM ? t("error") : undefined;

  return (
    <div
      className={`${montserrat.className} relative flex min-h-screen flex-col overflow-x-hidden bg-[#00101A] font-bold pb-28`}
    >
      <LoginPageBackground />
      <LoginHeader locale={normalizeLocale(locale)} />
      <HeroSection errorMessage={errorMessage} />
      <SiteFooter />
    </div>
  );
}
