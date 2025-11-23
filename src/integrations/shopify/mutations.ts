/**
 * Shopify Storefront API GraphQL Mutations
 */

import { shopifyQuery } from './client';
import type { StorefrontCart, AddToCartInput, UpdateCartLineInput, CartOperationResponse } from './types';

/**
 * Create a new cart
 */
export const CART_CREATE = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
          totalDutyAmount {
            amount
            currencyCode
          }
        }
        lines(first: 250) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    id
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        attributes {
          key
          value
        }
        buyerIdentity {
          email
          phone
          countryCode
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Add lines to an existing cart
 */
export const CART_LINES_ADD = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
          totalDutyAmount {
            amount
            currencyCode
          }
        }
        lines(first: 250) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    id
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        attributes {
          key
          value
        }
        buyerIdentity {
          email
          phone
          countryCode
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Update cart lines
 */
export const CART_LINES_UPDATE = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
          totalDutyAmount {
            amount
            currencyCode
          }
        }
        lines(first: 250) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    id
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        attributes {
          key
          value
        }
        buyerIdentity {
          email
          phone
          countryCode
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Remove lines from cart
 */
export const CART_LINES_REMOVE = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
          totalDutyAmount {
            amount
            currencyCode
          }
        }
        lines(first: 250) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    id
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        attributes {
          key
          value
        }
        buyerIdentity {
          email
          phone
          countryCode
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation functions
 */

export async function cartCreate(lines: AddToCartInput[]): Promise<CartOperationResponse> {
  const response = await shopifyQuery<{
    cartCreate: {
      cart: StorefrontCart | null;
      userErrors: Array<{ field: string[] | null; message: string }>;
    };
  }>(CART_CREATE, {
    input: {
      lines: lines.map((line) => ({
        merchandiseId: line.merchandiseId,
        quantity: line.quantity,
        attributes: line.attributes || [],
      })),
    },
  });

  return {
    cart: response.cartCreate.cart,
    userErrors: response.cartCreate.userErrors,
  };
}

export async function cartLinesAdd(
  cartId: string,
  lines: AddToCartInput[]
): Promise<CartOperationResponse> {
  const response = await shopifyQuery<{
    cartLinesAdd: {
      cart: StorefrontCart | null;
      userErrors: Array<{ field: string[] | null; message: string }>;
    };
  }>(CART_LINES_ADD, {
    cartId,
    lines: lines.map((line) => ({
      merchandiseId: line.merchandiseId,
      quantity: line.quantity,
      attributes: line.attributes || [],
    })),
  });

  return {
    cart: response.cartLinesAdd.cart,
    userErrors: response.cartLinesAdd.userErrors,
  };
}

export async function cartLinesUpdate(
  cartId: string,
  lines: UpdateCartLineInput[]
): Promise<CartOperationResponse> {
  const response = await shopifyQuery<{
    cartLinesUpdate: {
      cart: StorefrontCart | null;
      userErrors: Array<{ field: string[] | null; message: string }>;
    };
  }>(CART_LINES_UPDATE, {
    cartId,
    lines: lines.map((line) => ({
      id: line.id,
      quantity: line.quantity,
      attributes: line.attributes || [],
    })),
  });

  return {
    cart: response.cartLinesUpdate.cart,
    userErrors: response.cartLinesUpdate.userErrors,
  };
}

export async function cartLinesRemove(
  cartId: string,
  lineIds: string[]
): Promise<CartOperationResponse> {
  const response = await shopifyQuery<{
    cartLinesRemove: {
      cart: StorefrontCart | null;
      userErrors: Array<{ field: string[] | null; message: string }>;
    };
  }>(CART_LINES_REMOVE, {
    cartId,
    lineIds,
  });

  return {
    cart: response.cartLinesRemove.cart,
    userErrors: response.cartLinesRemove.userErrors,
  };
}

