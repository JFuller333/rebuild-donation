/**
 * React Hooks for Shopify Cart Operations
 * Uses React Query for caching and state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCart } from '@/integrations/shopify/queries';
import { cartCreate, cartLinesAdd, cartLinesUpdate, cartLinesRemove } from '@/integrations/shopify/mutations';
import { CartStorage } from '@/lib/cart-storage';
import { handleShopifyError } from '@/lib/shopify-error-handler';
import type { AddToCartInput, UpdateCartLineInput, StorefrontCart } from '@/integrations/shopify/types';

/**
 * Hook to get the current cart
 */
export function useCart() {
  const cartId = CartStorage.getCartId();

  return useQuery({
    queryKey: ['cart', cartId],
    queryFn: async () => {
      if (!cartId) return null;
      const cart = await getCart(cartId);
      return cart;
    },
    enabled: !!cartId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to add items to cart
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddToCartInput) => {
      let cartId = CartStorage.getCartId();

      // If no cart exists, create one
      if (!cartId) {
        const result = await cartCreate([input]);

        if (result.userErrors.length > 0) {
          const errorMessage = handleShopifyError(result);
          throw new Error(errorMessage);
        }

        if (!result.cart) {
          throw new Error('Failed to create cart');
        }

        cartId = result.cart.id;
        CartStorage.setCartId(cartId);
        return result.cart;
      }

      // Add to existing cart
      const result = await cartLinesAdd(cartId, [input]);

      if (result.userErrors.length > 0) {
        const errorMessage = handleShopifyError(result);
        throw new Error(errorMessage);
      }

      if (!result.cart) {
        throw new Error('Failed to add item to cart');
      }

      return result.cart;
    },
    onSuccess: (cart) => {
      // Update cache with new cart data
      queryClient.setQueryData(['cart', cart.id], cart);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

/**
 * Hook to update cart line quantities
 */
export function useUpdateCartLine() {
  const queryClient = useQueryClient();
  const cartId = CartStorage.getCartId();

  return useMutation({
    mutationFn: async (input: UpdateCartLineInput) => {
      if (!cartId) {
        throw new Error('No cart found');
      }

      const result = await cartLinesUpdate(cartId, [input]);

      if (result.userErrors.length > 0) {
        const errorMessage = handleShopifyError(result);
        throw new Error(errorMessage);
      }

      if (!result.cart) {
        throw new Error('Failed to update cart');
      }

      return result.cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart', cart.id], cart);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

/**
 * Hook to remove items from cart
 */
export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const cartId = CartStorage.getCartId();

  return useMutation({
    mutationFn: async (lineId: string) => {
      if (!cartId) {
        throw new Error('No cart found');
      }

      const result = await cartLinesRemove(cartId, [lineId]);

      if (result.userErrors.length > 0) {
        const errorMessage = handleShopifyError(result);
        throw new Error(errorMessage);
      }

      if (!result.cart) {
        throw new Error('Failed to remove item from cart');
      }

      return result.cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart', cart.id], cart);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

/**
 * Hook to get cart item count
 */
export function useCartItemCount(): number {
  const { data: cart } = useCart();
  return cart?.totalQuantity || 0;
}

