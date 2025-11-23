/**
 * Shopify Storefront API TypeScript Types
 * Based on Shopify Storefront API 2024-01+
 */

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  images: {
    edges: Array<{
      node: {
        id: string;
        url: string;
        altText: string | null;
        width: number;
        height: number;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: ProductVariant;
    }>;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  availableForSale: boolean;
  tags: string[];
  vendor: string;
  productType: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice: {
    amount: string;
    currencyCode: string;
  } | null;
  availableForSale: boolean;
  quantityAvailable: number;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  image: {
    id: string;
    url: string;
    altText: string | null;
  } | null;
  sku: string | null;
  barcode: string | null;
}

export interface StorefrontCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalTaxAmount: {
      amount: string;
      currencyCode: string;
    } | null;
    totalDutyAmount: {
      amount: string;
      currencyCode: string;
    } | null;
  };
  lines: {
    edges: Array<{
      node: CartLine;
    }>;
  };
  attributes: Array<{
    key: string;
    value: string;
  }>;
  buyerIdentity: {
    email: string | null;
    phone: string | null;
    countryCode: string | null;
  };
}

export interface CartLine {
  id: string;
  quantity: number;
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  merchandise: {
    id: string;
    title: string;
    price?: {
      amount: string;
      currencyCode: string;
    };
    selectedOptions: Array<{
      name: string;
      value: string;
    }>;
    product: {
      id: string;
      title: string;
      handle: string;
      images: {
        edges: Array<{
          node: {
            url: string;
            altText: string | null;
          };
        }>;
      };
    };
  };
}

export interface AddToCartInput {
  merchandiseId: string;
  quantity: number;
  attributes?: Array<{
    key: string;
    value: string;
  }>;
}

export interface UpdateCartLineInput {
  id: string;
  quantity: number;
  attributes?: Array<{
    key: string;
    value: string;
  }>;
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  image: {
    url: string;
    altText: string | null;
  } | null;
  products: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
  };
}

export interface ShopifyError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: Array<string | number>;
  extensions?: {
    code?: string;
    [key: string]: any;
  };
}

export interface ShopifyUserError {
  field: string[] | null;
  message: string;
}

export interface ShopifyResponse<T> {
  data?: T;
  errors?: ShopifyError[];
  extensions?: {
    cost?: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
}

export interface CartOperationResponse {
  cart: StorefrontCart | null;
  userErrors: ShopifyUserError[];
}

