import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  // Overridable build directory. Next refuses to run two dev servers that share
  // one `.next`, and the E2E suite needs two concurrently: an unlocked server
  // plus one with EVENT_STARTS_AT set, to exercise the countdown navigation
  // lock. Defaults to `.next`, so normal dev and build are unaffected.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
