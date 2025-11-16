/**
 * Cart ID Storage Utility
 * Handles persistence of cart ID using localStorage + cookies
 * Following best practices from SHOPIFY_INTEGRATION_GUIDE.md
 */

const CART_ID_KEY = 'cartId';
const CART_ID_COOKIE_NAME = 'cartId';
const CART_ID_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export const CartStorage = {
  /**
   * Get cart ID from storage (localStorage first, then cookie fallback)
   */
  getCartId(): string | null {
    // Try localStorage first (fastest)
    const localCartId = localStorage.getItem(CART_ID_KEY);
    if (localCartId) {
      return localCartId;
    }

    // Fallback to cookie
    const cookieCartId = this.getCookie(CART_ID_COOKIE_NAME);
    if (cookieCartId) {
      // Sync back to localStorage for faster future access
      localStorage.setItem(CART_ID_KEY, cookieCartId);
      return cookieCartId;
    }

    return null;
  },

  /**
   * Set cart ID in both localStorage and cookie
   */
  setCartId(cartId: string): void {
    // Store in localStorage
    localStorage.setItem(CART_ID_KEY, cartId);

    // Store in cookie with expiration
    this.setCookie(CART_ID_COOKIE_NAME, cartId, CART_ID_COOKIE_MAX_AGE);
  },

  /**
   * Clear cart ID from both storage locations
   */
  clearCartId(): void {
    localStorage.removeItem(CART_ID_KEY);
    this.deleteCookie(CART_ID_COOKIE_NAME);
  },

  /**
   * Helper: Get cookie value by name
   */
  getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  },

  /**
   * Helper: Set cookie
   */
  setCookie(name: string, value: string, maxAge: number): void {
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
  },

  /**
   * Helper: Delete cookie
   */
  deleteCookie(name: string): void {
    document.cookie = `${name}=; path=/; max-age=0`;
  },
};

