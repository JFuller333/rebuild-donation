/**
 * Product Detail Page - Displays Shopify Product
 */

import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProduct } from "@/hooks/use-shopify-products";
import { useAddToCart } from "@/hooks/use-shopify-cart";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, ShoppingCart } from "lucide-react";
import { getDefaultVariant, getVariantPriceFormatted } from "@/lib/shopify-adapters";

const ProductDetail = () => {
  const { id: handle } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: product, isLoading, error } = useProduct(handle || "");
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();

  const handleAddToCart = () => {
    if (!product) return;

    const variant = getDefaultVariant(product);
    if (!variant) {
      toast({
        title: "Error",
        description: "No available variant found",
        variant: "destructive",
      });
      return;
    }

    addToCart(
      {
        merchandiseId: variant.id,
        quantity: 1,
      },
      {
        onSuccess: () => {
          toast({
            title: "Added to cart!",
            description: `${product.title} has been added to your cart.`,
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
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
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const defaultVariant = getDefaultVariant(product);
  const firstImage = product.images.edges[0]?.node?.url || "/placeholder.svg";
  const price = defaultVariant
    ? getVariantPriceFormatted(defaultVariant)
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: product.priceRange.minVariantPrice.currencyCode,
      }).format(parseFloat(product.priceRange.minVariantPrice.amount));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto px-4 py-8 max-w-[1600px]">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden">
              <img
                src={firstImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.edges.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.edges.slice(1, 5).map(({ node: image }, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={image.url}
                      alt={image.altText || product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                {product.title}
              </h1>
              {product.vendor && (
                <p className="text-lg text-muted-foreground mb-4">By {product.vendor}</p>
              )}
              <p className="text-3xl font-bold text-primary mb-6">{price}</p>
            </div>

            {product.description && (
              <div className="prose prose-lg max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  className="text-foreground leading-relaxed"
                />
              </div>
            )}

            {/* Variants */}
            {product.variants.edges.length > 1 && (
              <div>
                <h3 className="font-semibold mb-2">Variants</h3>
                <div className="space-y-2">
                  {product.variants.edges.map(({ node: variant }) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <span>{variant.title}</span>
                      <span className="font-semibold">
                        {getVariantPriceFormatted(variant)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full text-base font-semibold"
                onClick={handleAddToCart}
                disabled={isAddingToCart || !product.availableForSale || !defaultVariant}
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>

              {!product.availableForSale && (
                <p className="text-sm text-destructive text-center">
                  This product is currently unavailable
                </p>
              )}
            </div>

            {/* Product Tags */}
            {product.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

