/**
 * Apparel product detail page — static copy, tabs, highlights, promo.
 * Product title, gallery, variants, and main description HTML still come from Shopify.
 */

export const apparelProductPageCopy = {
  /** Short line above the numbered timeline (shop, school, featured projects). */
  eyebrow: "How to get involved",

  /**
   * Compact header strip: numbered flow (shown under the eyebrow).
   * Set to [] to hide.
   */
  shopProcessSteps: [
    { step: 1, title: "Donate", label: "Support the mission", to: "/shop" },
    { step: 2, title: "Build", label: "Contribute to the developments", to: "/featured-projects" },
    { step: 3, title: "Learn", label: "Attend Live Workshops", to: "/school/pathways-to-equity-ownership" },
  ] as const,

  /** Optional thin promo under the header (e.g. “Free shipping over $50”). Empty = hidden. */
  promoBanner: "",

  /** Line under the price (mission). Shown in the buy box. */
  missionLine: "Every purchase supports Let's Rebuild Tuskegee.",

  /**
   * Proceeds impact — shown at the top of the apparel product buy box (PDP).
   * Set to "" to hide.
   */
  proceedsImpactLabel:
    "All proceeds are donated to Let's Rebuild Tuskegee development projects.",

  /**
   * Printify-style estimate: production + carrier. Shown in the “Shipping & returns” tab only.
   * Set to "" to omit from that tab.
   */
  estimatedShippingLine:
    "Estimated timing: about 2–7 business days to produce your order, then shipping (often 3–7 business days in the U.S.). Exact dates depend on the item and your address—your checkout page shows the range.",

  /**
   * If set, shown as the short intro under the subtitle.
   * If empty, we auto-generate a short excerpt from the Shopify description.
   */
  leadParagraph: "",

  checkoutHint: "Open the cart in the header to review items and complete checkout.",

  trustPoints: ["Shipping and taxes are calculated at checkout."] as const,

  /**
   * Order → ship → impact on the PDP. Set `steps` to [] to hide the section.
   */
  howItWorks: {
    heading: "How it works",
    steps: [
      {
        title: "You place your order",
        body: "Complete checkout for the items you want—sizes, colors, and shipping details are confirmed at checkout.",
      },
      {
        title: "Your order ships to you",
        body: "Your order is produced and sent to the address you provide. Timing depends on production and carrier—see Shipping & returns for estimates.",
      },
      {
        title: "Proceeds fund development",
        body: "The proceeds from your sale go toward current Let's Rebuild Tuskegee development projects.",
      },
    ] as const,
  },

  /** Rich HTML appended after the estimated timing paragraph in the “Shipping & returns” tab */
  shippingReturnsHtml: `
    <p class="mt-3">Orders ship to addresses in the U.S. You’ll see shipping options and timing at checkout.</p>
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

/**
 * Shopify product handles to show first on `/shop` (in this order). After those, remaining apparel keeps API order.
 * Leave empty to put any product whose title contains “hoodie” (case-insensitive) first instead.
 */
export const shopProductsFirstHandles: string[] = [];
