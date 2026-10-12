import Link from "next/link";

/**
 * mm:354:4323 (Footer)
 *
 * Site-wide navigation footer: logo, four links, copyright. Distinct from
 * `components/login/site-footer`, which is the login screen's fixed,
 * link-free strip and has its own binding e2e contract — the two must not
 * be merged.
 *
 * `Award Information` is the current page and carries the design's 10%
 * gold wash (mm:I354:4323;342:1411) rather than a hover state.
 */
export function AwardsFooter({
  criteriaLabel,
  copyright,
  activeHref,
}: {
  criteriaLabel: string;
  copyright: string;
  activeHref?: string;
}) {
  const links = [
    // "/" — the SAA homepage is the About SAA 2025 page; see site-header.tsx.
    { href: "/", label: "About SAA 2025" },
    { href: "/awards", label: "Award Information" },
    { href: "/kudos", label: "Sun* Kudos" },
    { href: "/criteria", label: criteriaLabel },
  ];

  return (
    <footer
      data-testid="awards-footer"
      className="mt-20 flex w-full flex-col items-center justify-between gap-8 border-t border-[#2E3940] px-4 py-10 sm:px-6 md:px-9 lg:flex-row lg:gap-6 lg:px-[90px]"
    >
      {/* mm:I354:4323;342:1407 (Frame 488) */}
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-10 xl:gap-20">
        {/* mm:I354:4323;342:1408 (LOGO) */}
        <Link href="/" aria-label="Sun* Annual Awards 2025">
          <img
            src="/awards/footer-logo.png"
            alt=""
            width={69}
            height={64}
            className="h-16 w-[69px] object-contain"
          />
        </Link>

        {/* mm:I354:4323;342:1409 (Frame 476) */}
        <nav className="flex flex-wrap items-center justify-center gap-2 lg:flex-nowrap lg:gap-6 xl:gap-12">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={href === activeHref ? "page" : undefined}
              className={`rounded p-4 text-center text-base leading-6 font-bold whitespace-nowrap text-white ${
                href === activeHref
                  ? "bg-[rgba(255,234,158,0.1)]"
                  : "hover:text-[#FFEA9E]"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* mm:I354:4323;342:1413 — 16px/24px, centred, white */}
      <p className="text-center text-base leading-6 font-bold text-white lg:whitespace-nowrap">
        {copyright}
      </p>
    </footer>
  );
}
