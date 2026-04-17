import { useMemo } from "react";
import { Header } from "@/components/Header";
import { ShopProductCard } from "@/components/ShopProductCard";
import { useApparelProducts } from "@/hooks/use-shopify-products";
import {
  getProductImageUrl,
  getProductPriceFormatted,
  isProductAvailable,
} from "@/lib/shopify-adapters";
import type { ShopifyProduct } from "@/integrations/shopify/types";
import { APPAREL_TAG, isApparelProduct } from "@/lib/product-kind";
import { Loader2 } from "lucide-react";

function stripDescription(product: ShopifyProduct): string {
  const raw = product.description?.trim() || "";
  if (raw) return raw;
  const html = product.descriptionHtml || "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function productCategoryLabel(product: ShopifyProduct): string {
  return (product.productType || product.vendor || "Apparel").trim() || "Apparel";
}

const Shop = () => {
  const { data, isLoading, error } = useApparelProducts(250);

  const products = useMemo(() => {
    if (!data?.edges?.length) return [];
    return data.edges.map(({ node }) => node).filter((node) => isApparelProduct(node));
  }, [data]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="border-b border-border bg-secondary/20">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Shop</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Apparel</h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Only products tagged <span className="font-medium text-foreground">{APPAREL_TAG}</span> in Shopify
            appear here.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-16 max-w-lg mx-auto">
              <p className="text-destructive font-medium mb-2">Could not load products</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Check Shopify Storefront API credentials."}
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 max-w-lg mx-auto">
              <p className="text-muted-foreground">
                No products with the <code className="text-foreground">{APPAREL_TAG}</code> tag yet. Add that tag in
                Shopify to list items on this page.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {products.map((product) => (
                <ShopProductCard
                  key={product.id}
                  id={product.handle}
                  title={product.title}
                  categoryLabel={productCategoryLabel(product)}
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
