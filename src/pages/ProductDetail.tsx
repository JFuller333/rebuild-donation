/**
 * Commerce product page — add to cart, checkout via header cart (apparel-tagged products).
 *
 * Content from Shopify: title, description HTML, images, variants, prices, vendor.
 * Static copy: edit `src/config/apparel-product-page.ts`
 * Layout: PDP sections inspired by modern beverage PDPs (hero + buy box, tabs, highlights, related).
 */

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ShopProductCard } from "@/components/ShopProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apparelProductPageCopy } from "@/config/apparel-product-page";
import { useApparelProducts, useProduct } from "@/hooks/use-shopify-products";
import { useAddToCart } from "@/hooks/use-shopify-cart";
import { useToast } from "@/hooks/use-toast";
import type { ShopifyProduct } from "@/integrations/shopify/types";
import { ArrowLeft, Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import {
  getDefaultVariant,
  getProductImageUrl,
  getProductPriceFormatted,
  getVariantPriceFormatted,
  isProductAvailable,
} from "@/lib/shopify-adapters";
import { isApparelProduct } from "@/lib/product-kind";
import {
  findVariantByOptionSelection,
  formatOptionLabel,
  getOptionGroups,
  getOptionValueState,
  selectionRecordFromVariant,
} from "@/lib/product-variant-options";
import type { ProductVariant } from "@/integrations/shopify/types";
import { cn } from "@/lib/utils";

function stripDescription(product: ShopifyProduct): string {
  const raw = product.description?.trim() || "";
  if (raw) return raw;
  const html = product.descriptionHtml || "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function leadExcerpt(product: ShopifyProduct, max = 280): string {
  const configured = apparelProductPageCopy.leadParagraph?.trim();
  if (configured) return configured;
  const plain = stripDescription(product);
  if (!plain) return "";
  return plain.length <= max ? plain : `${plain.slice(0, max - 1).trim()}…`;
}

function productCategoryLabel(product: ShopifyProduct): string {
  return (product.productType || product.vendor || "Apparel").trim() || "Apparel";
}

const ProductDetail = () => {
  const { id: handle } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: product, isLoading, error } = useProduct(handle || "");
  const { data: apparelCatalog } = useApparelProducts(250);
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();
  /** When Shopify exposes `selectedOptions`, we drive variants from this map (e.g. Size + Color). */
  const [optionSelection, setOptionSelection] = useState<Record<string, string>>({});
  /** Fallback when variants have no `selectedOptions` — keep single list selection. */
  const [listSelectedVariant, setListSelectedVariant] = useState<ProductVariant | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const variants = useMemo(
    () => product?.variants.edges.map((e) => e.node) ?? [],
    [product]
  );
  const optionGroups = useMemo(() => getOptionGroups(variants), [variants]);

  const selectedVariant = useMemo((): ProductVariant | null => {
    if (!product) return null;
    if (variants.length <= 1) return variants[0] ?? null;

    if (optionGroups.length > 0) {
      const keys = optionGroups.map((g) => g.name);
      const complete = keys.every((k) => optionSelection[k] !== undefined && optionSelection[k] !== "");
      if (!complete) return getDefaultVariant(product);
      return findVariantByOptionSelection(variants, optionSelection) ?? getDefaultVariant(product);
    }

    return listSelectedVariant ?? getDefaultVariant(product);
  }, [product, variants, optionGroups, optionSelection, listSelectedVariant]);

  useEffect(() => {
    if (!product) {
      setOptionSelection({});
      setListSelectedVariant(null);
      return;
    }
    const v = product.variants.edges.map((e) => e.node);
    const groups = getOptionGroups(v);
    const def = getDefaultVariant(product);
    setPreviewIndex(0);
    setQuantity(1);
    if (groups.length > 0 && def?.selectedOptions?.length) {
      setOptionSelection(selectionRecordFromVariant(def));
      setListSelectedVariant(null);
    } else {
      setOptionSelection({});
      setListSelectedVariant(def);
    }
  }, [product]);

  useEffect(() => {
    if (!selectedVariant?.image?.url || !product?.images.edges.length) return;
    const idx = product.images.edges.findIndex(({ node }) => node.url === selectedVariant.image?.url);
    if (idx >= 0) setPreviewIndex(idx);
  }, [selectedVariant?.id, product]);

  const relatedProducts = useMemo(() => {
    if (!apparelCatalog?.edges?.length || !handle) return [];
    return apparelCatalog.edges
      .map(({ node }) => node)
      .filter((p) => isApparelProduct(p) && p.handle !== handle)
      .slice(0, 4);
  }, [apparelCatalog, handle]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    addToCart(
      {
        merchandiseId: selectedVariant.id,
        quantity,
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

  const lead = leadExcerpt(product);
  const hasDescriptionHtml = Boolean(product.descriptionHtml?.trim());

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {apparelProductPageCopy.promoBanner.trim() ? (
        <div className="bg-primary text-primary-foreground text-center text-sm font-medium py-2.5 px-4">
          {apparelProductPageCopy.promoBanner}
        </div>
      ) : null}

      <div className="border-b border-border bg-secondary/20">
        <div className="container mx-auto px-4 py-2 md:py-2.5 max-w-6xl">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-1">
            <div className="flex items-center gap-2 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 -ml-2 px-2 text-xs text-muted-foreground shrink-0"
                onClick={() => navigate("/shop")}
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                Back
              </Button>
              <span className="text-muted-foreground/50 hidden sm:inline" aria-hidden>
                |
              </span>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary truncate">
                {apparelProductPageCopy.eyebrow}
              </p>
            </div>
            {apparelProductPageCopy.shopProcessSteps.length > 0 ? (
              <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] sm:text-[11px] leading-tight pl-0 list-none m-0 sm:justify-end">
                {apparelProductPageCopy.shopProcessSteps.map((item, index) => (
                  <li key={item.step} className="flex items-center gap-1.5">
                    {index > 0 ? (
                      <span className="text-muted-foreground/40 select-none px-0.5" aria-hidden>
                        ·
                      </span>
                    ) : null}
                    <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary/15 px-1 text-[9px] font-bold tabular-nums text-primary">
                      {item.step}
                    </span>
                    <span className="text-muted-foreground">{item.label}</span>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
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

          <div className="min-w-0 space-y-6">
            <div className="rounded-2xl border border-border bg-card shadow-sm p-6 md:p-8 space-y-6">
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">{product.title}</h1>
                {product.vendor ? (
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">{product.vendor}</p>
                ) : null}
                <p className="text-3xl md:text-4xl font-bold text-primary tabular-nums">{priceLabel}</p>
                {apparelProductPageCopy.missionLine ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">{apparelProductPageCopy.missionLine}</p>
                ) : null}
                {lead ? <p className="text-base text-foreground/90 leading-relaxed pt-1">{lead}</p> : null}
              </div>

              {variants.length > 1 ? (
                optionGroups.length > 0 ? (
                  <div className="space-y-5">
                    {optionGroups.map((group) => (
                      <div key={group.name} className="space-y-2.5">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          {formatOptionLabel(group.name)}
                        </h3>
                        <div
                          className="flex flex-wrap gap-2"
                          role="radiogroup"
                          aria-label={formatOptionLabel(group.name)}
                        >
                          {group.values.map((value) => {
                            const state = getOptionValueState(variants, optionSelection, group.name, value);
                            const isInvalid = state === "invalid";
                            const isSelected = state === "selected";

                            return (
                              <button
                                key={`${group.name}-${value}`}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                disabled={isInvalid}
                                title={
                                  state === "soldout" && !isSelected
                                    ? "This combination is sold out"
                                    : undefined
                                }
                                onClick={() => {
                                  if (!isInvalid) {
                                    setOptionSelection((prev) => ({ ...prev, [group.name]: value }));
                                  }
                                }}
                                className={cn(
                                  "min-h-11 min-w-[2.75rem] px-4 rounded-full border text-sm font-medium transition-colors",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                  isInvalid && "opacity-35 cursor-not-allowed border-dashed",
                                  isSelected &&
                                    "border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-sm",
                                  !isSelected &&
                                    !isInvalid &&
                                    state === "soldout" &&
                                    "border-border text-muted-foreground hover:bg-muted/60",
                                  !isSelected &&
                                    !isInvalid &&
                                    state === "available" &&
                                    "border-border hover:border-primary/40 hover:bg-muted/40"
                                )}
                              >
                                {value}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Choose option
                    </h2>
                    <div className="flex flex-col gap-2">
                      {variants.map((variant) => (
                        <button
                          key={variant.id}
                          type="button"
                          disabled={!variant.availableForSale}
                          onClick={() => setListSelectedVariant(variant)}
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
                )
              ) : null}

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between pt-1">
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground block">
                    Quantity
                  </span>
                  <div className="inline-flex items-center rounded-full border border-border bg-background">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-10 w-10 shrink-0"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[2.5rem] text-center tabular-nums font-semibold text-sm">{quantity}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-10 w-10 shrink-0"
                      onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <Button
                  size="lg"
                  className="w-full text-base font-semibold rounded-full h-12 shadow-md shadow-primary/10"
                  onClick={handleAddToCart}
                  disabled={
                    isAddingToCart || !product.availableForSale || !selectedVariant?.availableForSale
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
                <p className="text-center text-sm text-muted-foreground px-1">{apparelProductPageCopy.checkoutHint}</p>
              </div>

              {apparelProductPageCopy.trustPoints.length > 0 ? (
                <ul className="text-xs text-muted-foreground space-y-1.5 border-t border-border pt-4">
                  {apparelProductPageCopy.trustPoints.map((line) => (
                    <li key={line} className="leading-snug">
                      {line}
                    </li>
                  ))}
                </ul>
              ) : null}

              {!product.availableForSale ? (
                <p className="text-sm text-destructive">This product is currently unavailable.</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-12 md:mt-16 max-w-4xl">
          <Tabs defaultValue="details" className="w-full">
            <TabsList
              className={cn(
                "w-full justify-start h-auto flex-wrap gap-1 rounded-xl bg-muted/60 p-1.5",
                "sm:inline-flex sm:w-auto"
              )}
            >
              <TabsTrigger value="details" className="rounded-lg px-4 py-2 text-xs uppercase tracking-wide">
                Product details
              </TabsTrigger>
              <TabsTrigger value="shipping" className="rounded-lg px-4 py-2 text-xs uppercase tracking-wide">
                Shipping &amp; returns
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-6">
              {hasDescriptionHtml ? (
                <div
                  className="prose prose-sm md:prose-base max-w-none text-foreground prose-headings:font-semibold prose-a:text-primary [&_p]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml! }}
                />
              ) : (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  More information for this product will appear here when you add a description in Shopify.
                </p>
              )}
            </TabsContent>
            <TabsContent value="shipping" className="mt-6">
              <div
                className="prose prose-sm max-w-none text-foreground prose-a:text-primary [&_p]:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: apparelProductPageCopy.shippingReturnsHtml }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {apparelProductPageCopy.highlights.length > 0 ? (
          <section className="mt-14 md:mt-20 border-t border-border pt-12 md:pt-16">
            <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-8 text-center">
              Why it matters
            </h2>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {apparelProductPageCopy.highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-secondary/30 p-6 text-center md:text-left"
                >
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {relatedProducts.length > 0 ? (
          <section className="mt-14 md:mt-20 border-t border-border pt-12 md:pt-16">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8 text-center md:text-left">
              You may also like
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {relatedProducts.map((p) => (
                <ShopProductCard
                  key={p.id}
                  id={p.handle}
                  title={p.title}
                  categoryLabel={productCategoryLabel(p)}
                  image={getProductImageUrl(p, 0)}
                  priceLabel={getProductPriceFormatted(p)}
                  description={stripDescription(p)}
                  available={isProductAvailable(p)}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default ProductDetail;
