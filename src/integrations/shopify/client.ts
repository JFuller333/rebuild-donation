/**
 * Shopify Storefront API Client
 * Similar pattern to your Supabase client integration
 */

import { createStorefrontApiClient } from '@shopify/storefront-api-client';

const SHOPIFY_STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_API_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_API_TOKEN;
const SHOPIFY_API_VERSION = import.meta.env.VITE_SHOPIFY_STOREFRONT_API_VERSION || '2025-01';

if (!SHOPIFY_STORE_DOMAIN) {
  console.warn('VITE_SHOPIFY_STORE_DOMAIN is not set');
}

if (!SHOPIFY_STOREFRONT_API_TOKEN) {
  console.warn('VITE_SHOPIFY_STOREFRONT_API_TOKEN is not set');
}

// Create Shopify Storefront API client
export const shopifyClient = createStorefrontApiClient({
  storeDomain: SHOPIFY_STORE_DOMAIN || '',
  apiVersion: SHOPIFY_API_VERSION as any,
  publicAccessToken: SHOPIFY_STOREFRONT_API_TOKEN || '',
});

/**
 * Execute a GraphQL query against Shopify Storefront API
 */
export async function shopifyQuery<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_API_TOKEN) {
    throw new Error('Shopify credentials are not configured. Please set VITE_SHOPIFY_STORE_DOMAIN and VITE_SHOPIFY_STOREFRONT_API_TOKEN in your .env file');
  }

  try {
    const response = await shopifyClient.request(query, {
      variables: variables || {},
    });

    // The client returns { data, errors } structure
    if (response.errors && response.errors.length > 0) {
      console.error('Shopify GraphQL errors:', response.errors);
      throw new Error(response.errors[0].message || 'GraphQL error');
    }

    return (response.data || response) as T;
  } catch (error: any) {
    console.error('Shopify API Error:', error);
    throw error;
  }
}

/**
 * Get the full store URL
 */
export function getShopifyStoreUrl(): string {
  return `https://${SHOPIFY_STORE_DOMAIN}`;
}

/**
 * Get the checkout URL for a cart
 */
export function getCheckoutUrl(cartId: string): string {
  return `${getShopifyStoreUrl()}/cart/${cartId}`;
}

