/**
 * React Hooks for Shopify Products
 * Uses React Query for caching and state management
 */

import { useQuery } from '@tanstack/react-query';
import { getProductByHandle, getProducts, getCollectionByHandle } from '@/integrations/shopify/queries';
import type { ShopifyProduct } from '@/integrations/shopify/types';

/**
 * Hook to get a single product by handle
 */
export function useProduct(handle: string) {
  return useQuery({
    queryKey: ['product', handle],
    queryFn: () => getProductByHandle(handle),
    enabled: !!handle,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to get multiple products
 */
export function useProducts(options?: {
  first?: number;
  after?: string;
  query?: string;
}) {
  return useQuery({
    queryKey: ['products', options],
    queryFn: () => getProducts(options),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get a collection by handle
 */
export function useCollection(handle: string, options?: { first?: number; after?: string }) {
  return useQuery({
    queryKey: ['collection', handle, options],
    queryFn: () => getCollectionByHandle(handle, options),
    enabled: !!handle,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

