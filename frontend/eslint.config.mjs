import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The E2E harness runs a second dev server with NEXT_DIST_DIR=.next-locked
    // (see playwright.config.ts). It is build output exactly like `.next`, so
    // it must be ignored too — otherwise lint walks the generated chunks and
    // drowns real findings in hundreds of errors.
    ".next-locked/**",
  ]),
]);

export default eslintConfig;
