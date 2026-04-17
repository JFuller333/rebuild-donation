import { useMemo } from "react";
import { Header } from "@/components/Header";
import { ShopProductCard } from "@/components/ShopProductCard";
import { Button } from "@/components/ui/button";
import { PINNED_APPAREL_SHOPIFY_PRODUCT_ID } from "@/data/shop-featured";
import { useApparelProducts, usePinnedApparelProduct } from "@/hooks/use-shopify-products";
import {
  getProductImageUrl,
  getProductPriceFormatted,
  isProductAvailable,
} from "@/lib/shopify-adapters";
import type { ShopifyProduct } from "@/integrations/shopify/types";
import { ExternalLink, Loader2 } from "lucide-react";

const APPAREL_TAG = "apparel";

function shopifyAdminProductUrl(adminProductId: string): string {
  const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN as string | undefined;
  const store = domain?.replace(/\.myshopify\.com$/i, "") || "rebuild-investor-software";
  return `https://admin.shopify.com/store/${store}/products/${adminProductId}`;
}

function stripDescription(product: ShopifyProduct): string {
  const raw = product.description?.trim() || "";
  if (raw) return raw;
  const html = product.descriptionHtml || "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function productHasApparelTag(product: ShopifyProduct): boolean {
  return (product.tags || []).some((t) => t.toLowerCase() === APPAREL_TAG);
}

const Shop = () => {
  const { data, isLoading, error } = useApparelProducts(48);
  const { data: pinnedProduct, isLoading: pinnedLoading, error: pinnedError } = usePinnedApparelProduct(
    PINNED_APPAREL_SHOPIFY_PRODUCT_ID
  );

  const displayProducts = useMemo(() => {
    const tagged =
      data?.edges?.map(({ node }) => node).filter((node) => productHasApparelTag(node)) ?? [];
    const seen = new Set<string>();
    const out: ShopifyProduct[] = [];
    if (pinnedProduct) {
      out.push(pinnedProduct);
      seen.add(pinnedProduct.handle);
    }
    for (const p of tagged) {
      if (!seen.has(p.handle)) {
        out.push(p);
        seen.add(p.handle);
      }
    }
    return out;
  }, [data, pinnedProduct]);

  const listLoading = isLoading || pinnedLoading;
  const showInitialSpinner = listLoading && displayProducts.length === 0;
  const fatalLoadError = Boolean(error && !pinnedProduct && displayProducts.length === 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="border-b border-border bg-secondary/20">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Shop</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Apparel</h1>
          <p className="text-muted-foreground max-w-2xl text-lg mb-4">
            Featured catalog product (pinned from your Shopify admin) plus any other items tagged{" "}
            <span className="font-medium text-foreground">{APPAREL_TAG}</span>. Every purchase supports the mission.
          </p>
          <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground" asChild>
            <a
              href={shopifyAdminProductUrl(PINNED_APPAREL_SHOPIFY_PRODUCT_ID)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1"
            >
              Open this product in Shopify Admin
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </a>
          </Button>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {showInitialSpinner ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : fatalLoadError ? (
            <div className="text-center py-16 max-w-lg mx-auto space-y-2">
              <p className="text-destructive font-medium">Could not load products</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Check Shopify Storefront API credentials."}
              </p>
              {pinnedError ? (
                <p className="text-xs text-muted-foreground">
                  {pinnedError instanceof Error ? pinnedError.message : "Pinned product failed to load."}
                </p>
              ) : null}
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="text-center py-16 max-w-lg mx-auto space-y-4">
              <p className="text-muted-foreground">
                Nothing to show yet. Confirm the pinned product loads in Storefront API, or add the{" "}
                <code className="text-foreground">{APPAREL_TAG}</code> tag to products in Shopify.
              </p>
              <Button variant="outline" size="sm" className="rounded-full" asChild>
                <a href={shopifyAdminProductUrl(PINNED_APPAREL_SHOPIFY_PRODUCT_ID)} target="_blank" rel="noreferrer">
                  View product in Admin
                  <ExternalLink className="ml-2 h-3.5 w-3.5" aria-hidden />
                </a>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {displayProducts.map((product) => (
                <ShopProductCard
                  key={product.id}
                  id={product.handle}
                  title={product.title}
                  image={getProductImageUrl(product, 0)}
                  priceLabel={getProductPriceFormatted(product)}
                  description={stripDescription(product)}
                  available={isProductAvailable(product)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Shop;
