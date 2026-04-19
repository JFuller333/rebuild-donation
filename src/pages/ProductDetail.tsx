/**
 * Commerce product page — add to cart, checkout via header cart (apparel-tagged products).
 *
 * Content from Shopify: title, description HTML, images, variants, prices, vendor.
 * Static copy: edit `src/config/apparel-product-page.ts`
 * Layout: PDP sections inspired by modern beverage PDPs (hero + buy box, tabs, highlights, related).
 */

import { Fragment, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ApparelShopBar } from "@/components/ApparelShopBar";
import { Header } from "@/components/Header";
import { ShopProductCard } from "@/components/ShopProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apparelProductPageCopy } from "@/config/apparel-product-page";
import { useCartSheet } from "@/contexts/CartSheetContext";
import { useApparelProducts, useProduct } from "@/hooks/use-shopify-products";
import { useAddToCart, useCartItemCount } from "@/hooks/use-shopify-cart";
import { useToast } from "@/hooks/use-toast";
import type { ShopifyProduct } from "@/integrations/shopify/types";
import {
  ArrowDown,
  ArrowRight,
  HeartHandshake,
  Landmark,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Truck,
} from "lucide-react";

const HOW_IT_WORKS_ICONS = [ShoppingBag, Truck, Landmark] as const;
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
  const { openCart } = useCartSheet();
  const cartItemCount = useCartItemCount();
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

      <ApparelShopBar showBack />

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
                {apparelProductPageCopy.proceedsImpactLabel.trim() ? (
                  <div
                    className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-3.5 py-3 text-sm leading-relaxed text-foreground/90 shadow-sm"
                    role="note"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <HeartHandshake className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </span>
                    <span className="min-w-0 pt-0.5">{apparelProductPageCopy.proceedsImpactLabel.trim()}</span>
                  </div>
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
                <div className="flex gap-3 items-stretch">
                  <Button
                    size="lg"
                    className="flex-1 min-w-0 text-base font-semibold rounded-full h-12 shadow-md shadow-primary/10"
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
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="relative h-12 w-12 shrink-0 rounded-full border-2"
                    onClick={openCart}
                    aria-label="View shopping cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                        {cartItemCount > 99 ? "99+" : cartItemCount}
                      </span>
                    )}
                  </Button>
                </div>
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

        <div className="mt-10 md:mt-14 max-w-4xl">
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
                dangerouslySetInnerHTML={{
                  __html: [
                    apparelProductPageCopy.estimatedShippingLine.trim()
                      ? `<p>${apparelProductPageCopy.estimatedShippingLine.trim()}</p>`
                      : "",
                    apparelProductPageCopy.shippingReturnsHtml,
                  ]
                    .filter(Boolean)
                    .join(""),
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {apparelProductPageCopy.howItWorks.steps.length > 0 ? (
          <section
            className="mt-12 md:mt-16 w-full rounded-2xl border border-border/70 bg-muted/50 px-5 py-10 text-center shadow-sm sm:px-8 md:px-12 md:py-12 dark:bg-muted/25"
            aria-labelledby="how-it-works-heading"
          >
            <h2
              id="how-it-works-heading"
              className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-8 md:mb-10"
            >
              {apparelProductPageCopy.howItWorks.heading}
            </h2>
            <ol className="m-0 flex w-full list-none flex-col gap-4 p-0 md:flex-row md:items-stretch md:gap-2 lg:gap-4">
              {apparelProductPageCopy.howItWorks.steps.map((step, index) => {
                const Icon = HOW_IT_WORKS_ICONS[index] ?? ShoppingBag;
                const steps = apparelProductPageCopy.howItWorks.steps;
                const isLast = index === steps.length - 1;
                return (
                  <Fragment key={step.title}>
                    <li className="flex min-w-0 flex-1 flex-col items-center gap-3 rounded-xl border border-border/60 bg-background/70 px-4 py-6 md:gap-4 md:px-6 md:py-7">
                      <span
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/15"
                        aria-hidden
                      >
                        <Icon className="h-7 w-7" strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0 max-w-sm space-y-2 md:max-w-none">
                        <h3 className="font-semibold text-foreground leading-snug">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                      </div>
                    </li>
                    {!isLast ? (
                      <li
                        className="flex shrink-0 items-center justify-center py-1.5 md:w-11 md:py-0 md:self-center"
                        aria-hidden="true"
                      >
                        <span className="inline-flex items-center justify-center rounded-full border border-primary/80 bg-primary/10 p-1.5 text-primary shadow-sm ring-1 ring-primary/15 md:p-1.5">
                          <ArrowDown className="h-4 w-4 md:hidden" strokeWidth={2.25} absoluteStrokeWidth />
                          <ArrowRight className="hidden h-4 w-4 md:block" strokeWidth={2.25} absoluteStrokeWidth />
                        </span>
                      </li>
                    ) : null}
                  </Fragment>
                );
              })}
            </ol>
          </section>
        ) : null}

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
