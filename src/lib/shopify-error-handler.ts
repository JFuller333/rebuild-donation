/**
 * Shopify Error Handler
 * Provides user-friendly error messages from Shopify API responses
 */

import type { ShopifyUserError, ShopifyError } from '@/integrations/shopify/types';

export interface ShopifyErrorResponse {
  userErrors?: ShopifyUserError[];
  errors?: ShopifyError[];
  message?: string;
}

/**
 * Extract user-friendly error message from Shopify response
 */
export function handleShopifyError(
  error: ShopifyErrorResponse | Error | any,
  defaultMessage: string = 'An error occurred'
): string {
  // GraphQL user errors (user-friendly messages)
  if (error.userErrors && Array.isArray(error.userErrors) && error.userErrors.length > 0) {
    return error.userErrors[0].message;
  }

  // GraphQL errors (technical)
  if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    console.error('Shopify GraphQL errors:', error.errors);
    return error.errors[0].message || defaultMessage;
  }

  // Standard Error object
  if (error instanceof Error) {
    console.error('Error:', error.message);
    return error.message;
  }

  // Error with message property
  if (error.message) {
    console.error('Error:', error.message);
    return error.message;
  }

  // Unknown error format
  console.error('Unknown error format:', error);
  return defaultMessage;
}

/**
 * Check if error has user errors
 */
export function hasUserErrors(error: ShopifyErrorResponse): boolean {
  return !!(error.userErrors && error.userErrors.length > 0);
}

/**
 * Get all user error messages
 */
export function getUserErrorMessages(error: ShopifyErrorResponse): string[] {
  if (!error.userErrors || !Array.isArray(error.userErrors)) {
    return [];
  }
  return error.userErrors.map((err) => err.message);
}

