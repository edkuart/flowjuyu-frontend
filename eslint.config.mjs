import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ─── ProductCard system boundaries ───────────────────────────────────────────
  //
  // These rules enforce the architecture decisions in the ProductCardV2 system:
  //   1. Legacy card components are deleted — imports are now build errors.
  //   2. CARD_TOKENS is internal to ProductCardV2.tsx — no external imports.
  //
  // To add a new valid card context, edit ProductCardV2.tsx and productCard.tokens.ts.
  // Do NOT disable these rules inline — widen the exception list below instead.
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/components/product/ArtisanCard"],
              message:
                "ArtisanCard has been removed. Use ProductCardV2 from @/components/product/ProductCardV2.",
            },
            {
              group: ["**/components/product/ProductCard"],
              message:
                "ProductCard has been removed. Use ProductCardV2 from @/components/product/ProductCardV2.",
            },
            {
              group: ["**/components/ui/ProductCard"],
              message:
                "ui/ProductCard has been removed. Use ProductCardV2 from @/components/product/ProductCardV2.",
            },
            {
              group: ["**/productCard.tokens"],
              message:
                "CARD_TOKENS is internal to ProductCardV2. To change card styling, edit productCard.tokens.ts directly — do not import it elsewhere.",
            },
          ],
        },
      ],
    },
  },

  // Allow ProductCardV2.tsx to import its own token file.
  {
    files: ["**/components/product/ProductCardV2.tsx"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
];

export default eslintConfig;
