/**
 * Commerce product page — add to cart, standard checkout via cart (for apparel-tagged products).
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useProduct } from "@/hooks/use-shopify-products";
import { useAddToCart } from "@/hooks/use-shopify-cart";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, ShoppingCart } from "lucide-react";
import {
  getDefaultVariant,
  getVariantPriceFormatted,
} from "@/lib/shopify-adapters";
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

      <div className="mx-auto px-4 py-8 max-w-[1600px]">
        <Button variant="ghost" onClick={() => navigate("/shop")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to shop
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
              <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
            </div>
            {product.images.edges.length > 1 ? (
              <div className="grid grid-cols-4 gap-3">
                {product.images.edges.map(({ node: image }, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setPreviewIndex(index)}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary ring-offset-2",
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

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">{product.title}</h1>
              {product.vendor ? (
                <p className="text-lg text-muted-foreground mb-4">By {product.vendor}</p>
              ) : null}
              <p className="text-3xl font-bold text-primary">{priceLabel}</p>
            </div>

            {product.descriptionHtml ? (
              <div
                className="prose prose-sm md:prose-base max-w-none text-foreground [&_p]:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            ) : null}

            {variants.length > 1 ? (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Options
                </h3>
                <div className="flex flex-col gap-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={!variant.availableForSale}
                      onClick={() => setSelectedVariant(variant)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                        selectedVariant?.id === variant.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:bg-muted/50",
                        !variant.availableForSale && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <span>{variant.title}</span>
                      <span className="font-semibold tabular-nums">
                        {getVariantPriceFormatted(variant)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-3 pt-2">
              <Button
                size="lg"
                className="w-full text-base font-semibold rounded-full"
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
              <p className="text-center text-sm text-muted-foreground">
                Use the cart icon in the header to review items and complete checkout.
              </p>
            </div>

            {!product.availableForSale ? (
              <p className="text-sm text-destructive text-center">This product is currently unavailable.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
