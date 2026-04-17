/**
 * Apparel product detail page — static copy, tabs, highlights, promo.
 * Product title, gallery, variants, and main description HTML still come from Shopify.
 */

export const apparelProductPageCopy = {
  eyebrow: "Shop · Apparel",

  /**
   * Compact header strip: numbered flow (shown next to the eyebrow on the PDP).
   * Set to [] to hide.
   */
  shopProcessSteps: [
    { step: 1, label: "Support the mission", to: "/shop" },
    { step: 2, label: "Access the school", to: "/school/pathways-to-equity-ownership" },
    { step: 3, label: "Contribute to the developments", to: "/featured-projects" },
  ] as const,

  /** Optional thin promo under the header (e.g. “Free shipping over $50”). Empty = hidden. */
  promoBanner: "",

  /** Line under the price (mission). Shown in the buy box. */
  missionLine: "Every purchase supports Let's Rebuild Tuskegee.",

  /**
   * If set, shown as the short intro under the subtitle.
   * If empty, we auto-generate a short excerpt from the Shopify description.
   */
  leadParagraph: "",

  checkoutHint: "Open the cart in the header to review items and complete checkout.",

  trustPoints: ["Shipping and taxes are calculated at checkout."] as const,

  /** Rich HTML for the “Shipping & returns” tab */
  shippingReturnsHtml: `
    <p>Orders ship to addresses in the U.S. You’ll see shipping options and timing at checkout.</p>
    <p class="mt-3">Questions about your order? Email <a href="mailto:build@letsrebuildtuskegee.org">build@letsrebuildtuskegee.org</a>.</p>
  `.trim(),

  /**
   * Feature blocks below the main product (Wild Wonder–style “benefits” row).
   * Set to [] to hide.
   */
  highlights: [
    {
      title: "Community impact",
      body: "Apparel sales help fund transparent, neighborhood-led development projects.",
    },
    {
      title: "Quality first",
      body: "We work with suppliers and blanks we’re proud to put our name on.",
    },
    {
      title: "Wear the mission",
      body: "Show you’re part of rebuilding block by block—on campus, at home, and around town.",
    },
  ] as const,
} as const;
