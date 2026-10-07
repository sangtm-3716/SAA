import { getTranslations } from "next-intl/server";

/**
 * mm:662:14447 (mms_D_Footer)
 * Fixed at the bottom of the viewport; purely informational (no <a>/<button>
 * descendants) per the binding contract. Async server component — reads its
 * own copy via `getTranslations` rather than threading a prop down from
 * `app/login/page.tsx`.
 */
export async function SiteFooter() {
  const t = await getTranslations("common");

  return (
    <footer
      data-testid="site-footer"
      className="fixed inset-x-0 bottom-0 z-20 flex w-full items-center justify-center border-t border-[#2E3940] bg-[#00101A] px-4 py-6 sm:px-6 md:px-9 lg:px-12 xl:px-16"
    >
      {/* mm:I662:14447;342:1413 */}
      <p className="text-center text-base leading-6 text-white">
        {t("footer")}
      </p>
    </footer>
  );
}
