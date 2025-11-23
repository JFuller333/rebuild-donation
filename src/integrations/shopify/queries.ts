/**
 * Shopify Storefront API GraphQL Queries
 */

import { shopifyQuery } from './client';
import type { ShopifyProduct, StorefrontCart, ShopifyCollection, ShopifyResponse } from './types';

/**
 * Get a single product by handle
 */
export const GET_PRODUCT_BY_HANDLE = `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      availableForSale
      tags
      vendor
      productType
      images(first: 10) {
        edges {
          node {
            id
            url
            altText
            width
            height
          }
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            availableForSale
            quantityAvailable
            selectedOptions {
              name
              value
            }
            image {
              id
              url
              altText
            }
            sku
            barcode
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
`;

/**
 * Get multiple products
 */
export const GET_PRODUCTS = `
  query getProducts($first: Int, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query) {
      edges {
        node {
          id
          title
          handle
          description
          descriptionHtml
          availableForSale
          tags
          vendor
          productType
          images(first: 5) {
            edges {
              node {
                id
                url
                altText
                width
                height
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                quantityAvailable
                image {
                  id
                  url
                  altText
                }
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

/**
 * Get a collection by handle
 */
export const GET_COLLECTION_BY_HANDLE = `
  query getCollectionByHandle($handle: String!, $first: Int, $after: String) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      image {
        url
        altText
      }
      products(first: $first, after: $after) {
        edges {
          node {
            id
            title
            handle
            description
            descriptionHtml
            availableForSale
            tags
            vendor
            productType
            images(first: 5) {
              edges {
                node {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  availableForSale
                  quantityAvailable
                  image {
                    id
                    url
                    altText
                  }
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`;

/**
 * Get cart by ID
 */
export const GET_CART = `
  query getCart($id: ID!) {
    cart(id: $id) {
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
  }
`;

/**
 * Query functions
 */

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const response = await shopifyQuery<{ product: ShopifyProduct | null }>(
    GET_PRODUCT_BY_HANDLE,
    { handle }
  );
  return response.product;
}

export async function getProducts(options?: {
  first?: number;
  after?: string;
  query?: string;
}): Promise<{
  edges: Array<{ node: ShopifyProduct }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}> {
  const response = await shopifyQuery<{
    products?: {
      edges: Array<{ node: ShopifyProduct }>;
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor: string | null;
        endCursor: string | null;
      };
    };
  }>(GET_PRODUCTS, {
    first: options?.first || 20,
    after: options?.after || null,
    query: options?.query || null,
  });

  if (!response?.products) {
    throw new Error(
      "Unable to load Shopify products. Verify your Storefront API credentials and ensure products are available."
    );
  }

  return response.products;
}

export async function getCollectionByHandle(
  handle: string,
  options?: { first?: number; after?: string }
): Promise<ShopifyCollection | null> {
  const response = await shopifyQuery<{ collection: ShopifyCollection | null }>(
    GET_COLLECTION_BY_HANDLE,
    {
      handle,
      first: options?.first || 20,
      after: options?.after || null,
    }
  );
  return response.collection;
}

export async function getCart(cartId: string): Promise<StorefrontCart | null> {
  const response = await shopifyQuery<{ cart: StorefrontCart | null }>(GET_CART, {
    id: cartId,
  });
  return response.cart;
}

