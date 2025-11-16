/**
 * Shopify Data Adapters
 * Transform Shopify data structures to match your existing component interfaces
 * This allows you to use Shopify products with your existing ProjectCard component
 */

import type { ShopifyProduct, ProductVariant } from '@/integrations/shopify/types';

/**
 * Adapter: Shopify Product → ProjectCard Props
 * Maps Shopify product data to your existing ProjectCard interface
 */
export interface ProjectCardAdapterProps {
  id: string;
  title: string;
  location: string; // Maps to vendor or productType
  description: string;
  image: string;
  raised: number; // Maps to price (for display purposes)
  goal: number; // Optional: can be a target price or null
}

/**
 * Convert Shopify product to ProjectCard props
 */
export function shopifyProductToProjectCard(
  product: ShopifyProduct,
  options?: {
    useVendorAsLocation?: boolean;
    useProductTypeAsLocation?: boolean;
    customLocation?: string;
  }
): ProjectCardAdapterProps {
  // Get first available image
  const firstImage = product.images.edges[0]?.node?.url || '/placeholder.svg';

  // Get first variant for pricing
  const firstVariant = product.variants.edges[0]?.node;
  const price = firstVariant
    ? parseFloat(firstVariant.price.amount)
    : parseFloat(product.priceRange.minVariantPrice.amount);

  // Determine location
  let location = 'Shop';
  if (options?.customLocation) {
    location = options.customLocation;
  } else if (options?.useVendorAsLocation && product.vendor) {
    location = product.vendor;
  } else if (options?.useProductTypeAsLocation && product.productType) {
    location = product.productType;
  }

  return {
    id: product.handle, // Use handle as ID for routing
    title: product.title,
    location,
    description: product.description || product.descriptionHtml.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
    image: firstImage,
    raised: 0, // You can set this based on your needs
    goal: price, // Use product price as "goal"
  };
}

/**
 * Get product image URL (with fallback)
 */
export function getProductImageUrl(product: ShopifyProduct, index: number = 0): string {
  return product.images.edges[index]?.node?.url || '/placeholder.svg';
}

/**
 * Get product price formatted
 */
export function getProductPriceFormatted(product: ShopifyProduct): string {
  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const currency = product.priceRange.minVariantPrice.currencyCode;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
}

/**
 * Get variant price formatted
 */
export function getVariantPriceFormatted(variant: ProductVariant): string {
  const price = parseFloat(variant.price.amount);
  const currency = variant.price.currencyCode;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
}

/**
 * Check if product is available
 */
export function isProductAvailable(product: ShopifyProduct): boolean {
  return product.availableForSale && product.variants.edges.some(
    (edge) => edge.node.availableForSale
  );
}

/**
 * Get default variant (first available, or first variant)
 */
export function getDefaultVariant(product: ShopifyProduct): ProductVariant | null {
  // Try to find first available variant
  const availableVariant = product.variants.edges.find(
    (edge) => edge.node.availableForSale
  );
  if (availableVariant) {
    return availableVariant.node;
  }

  // Fallback to first variant
  return product.variants.edges[0]?.node || null;
}

