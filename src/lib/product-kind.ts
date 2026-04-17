/** Tag used in Shopify for shop / apparel catalog items (case-insensitive match). */
export const APPAREL_TAG = "apparel" as const;

export function isApparelProduct(product: { tags?: string[] } | null | undefined): boolean {
  if (!product?.tags?.length) return false;
  return product.tags.some((t) => t.toLowerCase() === APPAREL_TAG);
}
