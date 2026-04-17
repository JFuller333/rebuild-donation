/**
 * Apparel product detail page — static copy and optional extras.
 * Edit here to customize messaging without changing ProductDetail.tsx layout.
 * Product title, description, images, and prices still come from Shopify.
 */
export const apparelProductPageCopy = {
  /** Small label above the product title */
  eyebrow: "Shop · Apparel",
  /** One line under the price (mission / impact). Empty string hides it. */
  missionLine: "Every purchase supports Let's Rebuild Tuskegee.",
  /** Shown under the primary button */
  checkoutHint: "Use the cart icon in the header to review items and complete checkout.",
  /** Short bullets below the CTA (shipping, returns, contact). Empty array hides. */
  trustPoints: [
    "Shipping and taxes are calculated at checkout.",
  ] as const,
} as const;
