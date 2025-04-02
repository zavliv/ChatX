import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Extend Next.js configurations for core web vitals and TypeScript support.
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Add your custom rules and overrides here.
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      // Add additional custom rules if needed.
    },
  },
];
