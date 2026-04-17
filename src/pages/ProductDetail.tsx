/**
 * Commerce product page — add to cart, checkout via header cart (apparel-tagged products).
 *
 * Content from Shopify: title, description HTML, images, variants, prices, vendor.
 * Static copy: edit `src/config/apparel-product-page.ts`
 * Layout/styling: this file.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { apparelProductPageCopy } from "@/config/apparel-product-page";
import { useProduct } from "@/hooks/use-shopify-products";
import { useAddToCart } from "@/hooks/use-shopify-cart";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, ShoppingCart } from "lucide-react";
import { getDefaultVariant, getVariantPriceFormatted } from "@/lib/shopify-adapters";
import type { ProductVariant } from "@/integrations/shopify/types";
import { cn } from "@/lib/utils";

const ProductDetail = () => {
  const { id: handle } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: product, isLoading, error } = useProduct(handle || "");
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    if (!product) {
      setSelectedVariant(null);
      return;
    }
    const def = getDefaultVariant(product);
    setSelectedVariant(def);
    setPreviewIndex(0);
  }, [product]);

  useEffect(() => {
    if (!selectedVariant?.image?.url || !product?.images.edges.length) return;
    const idx = product.images.edges.findIndex(({ node }) => node.url === selectedVariant.image?.url);
    if (idx >= 0) setPreviewIndex(idx);
  }, [selectedVariant?.id, product]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    addToCart(
      {
        merchandiseId: selectedVariant.id,
        quantity: 1,
      },
      {
        onSuccess: () => {
          toast({
            title: "Added to cart",
            description: `${product.title} — open the cart to check out.`,
          });
        },
        onError: (err) => {
          toast({
            title: "Could not add to cart",
            description: err.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-destructive mb-4">Product not found</p>
          <Button onClick={() => navigate("/shop")}>Back to shop</Button>
        </div>
      </div>
    );
  }

  const mainImage =
    product.images.edges[previewIndex]?.node?.url ||
    selectedVariant?.image?.url ||
    "/placeholder.svg";

  const priceLabel = selectedVariant
    ? getVariantPriceFormatted(selectedVariant)
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: product.priceRange.minVariantPrice.currencyCode,
      }).format(parseFloat(product.priceRange.minVariantPrice.amount));

  const variants = product.variants.edges.map((e) => e.node);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b border-border bg-secondary/20">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
          <Button variant="ghost" className="-ml-2 mb-2" onClick={() => navigate("/shop")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to shop
          </Button>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            {apparelProductPageCopy.eyebrow}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start">
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted shadow-sm ring-1 ring-border/60">
              <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
            </div>
            {product.images.edges.length > 1 ? (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {product.images.edges.map(({ node: image }, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setPreviewIndex(index)}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      previewIndex === index ? "ring-2 ring-primary" : "opacity-90 hover:opacity-100"
                    )}
                  >
                    <img
                      src={image.url}
                      alt={image.altText || product.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-6 min-w-0">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">{product.title}</h1>
              {product.vendor ? (
                <p className="text-base text-muted-foreground">By {product.vendor}</p>
              ) : null}
              <p className="text-3xl md:text-4xl font-bold text-primary tabular-nums">{priceLabel}</p>
              {apparelProductPageCopy.missionLine ? (
                <p className="text-sm text-muted-foreground leading-relaxed max-w-lg pt-1">
                  {apparelProductPageCopy.missionLine}
                </p>
              ) : null}
            </div>

            {product.descriptionHtml ? (
              <>
                <Separator className="my-2" />
                <div
                  className="prose prose-sm md:prose-base max-w-none text-foreground prose-headings:font-semibold prose-a:text-primary [&_p]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              </>
            ) : null}

            {variants.length > 1 ? (
              <div className="space-y-3">
                <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Options
                </h2>
                <div className="flex flex-col gap-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={!variant.availableForSale}
                      onClick={() => setSelectedVariant(variant)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm transition-colors",
                        selectedVariant?.id === variant.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:bg-muted/50",
                        !variant.availableForSale && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <span className="font-medium">{variant.title}</span>
                      <span className="font-semibold tabular-nums text-primary">
                        {getVariantPriceFormatted(variant)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-4 pt-2">
              <Button
                size="lg"
                className="w-full text-base font-semibold rounded-full h-12 shadow-md shadow-primary/10"
                onClick={handleAddToCart}
                disabled={
                  isAddingToCart ||
                  !product.availableForSale ||
                  !selectedVariant?.availableForSale
                }
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Adding…
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to cart
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground px-1">
                {apparelProductPageCopy.checkoutHint}
              </p>
              {apparelProductPageCopy.trustPoints.length > 0 ? (
                <ul className="text-xs text-muted-foreground space-y-1.5 border-t border-border pt-4 max-w-md">
                  {apparelProductPageCopy.trustPoints.map((line) => (
                    <li key={line} className="leading-snug">
                      {line}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {!product.availableForSale ? (
              <p className="text-sm text-destructive">This product is currently unavailable.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
