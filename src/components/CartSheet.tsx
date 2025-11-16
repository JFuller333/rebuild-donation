/**
 * Cart Sheet Component
 * Displays cart items in a slide-out drawer
 */

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart, useUpdateCartLine, useRemoveFromCart } from "@/hooks/use-shopify-cart";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Plus, Minus, Trash2, Loader2 } from "lucide-react";
import { CartStorage } from "@/lib/cart-storage";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { data: cart, isLoading } = useCart();
  const { mutate: updateCartLine, isPending: isUpdating } = useUpdateCartLine();
  const { mutate: removeFromCart, isPending: isRemoving } = useRemoveFromCart();
  const { toast } = useToast();
  const [updatingLineId, setUpdatingLineId] = useState<string | null>(null);
  const [removingLineId, setRemovingLineId] = useState<string | null>(null);

  const handleUpdateQuantity = (lineId: string, currentQuantity: number, delta: number) => {
    const newQuantity = Math.max(0, currentQuantity + delta);
    
    if (newQuantity === 0) {
      handleRemoveItem(lineId);
      return;
    }

    setUpdatingLineId(lineId);
    updateCartLine(
      { id: lineId, quantity: newQuantity },
      {
        onSuccess: () => {
          setUpdatingLineId(null);
        },
        onError: (error) => {
          setUpdatingLineId(null);
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleRemoveItem = (lineId: string) => {
    setRemovingLineId(lineId);
    removeFromCart(lineId, {
      onSuccess: () => {
        setRemovingLineId(null);
        toast({
          title: "Item removed",
          description: "Item has been removed from your cart.",
        });
      },
      onError: (error) => {
        setRemovingLineId(null);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleCheckout = () => {
    if (!cart?.checkoutUrl) {
      toast({
        title: "Error",
        description: "Checkout URL not available",
        variant: "destructive",
      });
      return;
    }

    // Full page redirect to Shopify checkout
    window.location.href = cart.checkoutUrl;
  };

  const cartLines = cart?.lines.edges || [];
  const totalAmount = cart?.cost.totalAmount.amount
    ? parseFloat(cart.cost.totalAmount.amount)
    : 0;
  const currencyCode = cart?.cost.totalAmount.currencyCode || "USD";

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(totalAmount);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
          </SheetTitle>
          <SheetDescription>
            {cart?.totalQuantity || 0} {cart?.totalQuantity === 1 ? "item" : "items"} in your cart
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : cartLines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Add items to your cart to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartLines.map(({ node: line }) => {
                const isUpdating = updatingLineId === line.id;
                const isRemoving = removingLineId === line.id;
                const product = line.merchandise.product;
                const imageUrl = product.images.edges[0]?.node?.url || "/placeholder.svg";
                const lineTotal = parseFloat(line.cost.totalAmount.amount);
                const formattedLineTotal = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: line.cost.totalAmount.currencyCode,
                }).format(lineTotal);

                return (
                  <div
                    key={line.id}
                    className="flex gap-4 p-4 border rounded-lg bg-card"
                  >
                    <img
                      src={imageUrl}
                      alt={product.title}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-semibold text-sm">{product.title}</h4>
                        {line.merchandise.selectedOptions.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {line.merchandise.selectedOptions
                              .map((opt) => `${opt.name}: ${opt.value}`)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleUpdateQuantity(line.id, line.quantity, -1)
                            }
                            disabled={isUpdating || isRemoving}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Minus className="h-3 w-3" />
                            )}
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {line.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleUpdateQuantity(line.id, line.quantity, 1)
                            }
                            disabled={isUpdating || isRemoving}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{formattedLineTotal}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveItem(line.id)}
                            disabled={isRemoving || isUpdating}
                          >
                            {isRemoving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cartLines.length > 0 && (
          <>
            <Separator />
            <SheetFooter className="flex-col gap-2 sm:flex-col">
              <div className="flex items-center justify-between w-full text-lg font-semibold">
                <span>Total</span>
                <span>{formattedTotal}</span>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={isUpdating || isRemoving}
              >
                {isUpdating || isRemoving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Checkout
                  </>
                )}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

