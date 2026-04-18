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
   * Printify-style estimate: production + carrier. Shown under the mission line on the buy box.
   * Edit if your Printify product or region defaults change.
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

  /** Rich HTML for the “Shipping & returns” tab */
  shippingReturnsHtml: `
    <p><strong>Estimated fulfillment (Printify)</strong></p>
    <p>Most apparel orders need about <strong>2–7 business days</strong> for production, then shipping time on top. U.S. delivery is often an additional <strong>3–7 business days</strong> depending on carrier and your location. You’ll see the full range and options at checkout.</p>
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
