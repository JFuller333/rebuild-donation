import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CartSheet } from "@/components/CartSheet";

type CartSheetContextValue = {
  openCart: () => void;
  setCartOpen: (open: boolean) => void;
};

const CartSheetContext = createContext<CartSheetContextValue | null>(null);

export function CartSheetProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openCart = useCallback(() => setOpen(true), []);

  return (
    <CartSheetContext.Provider value={{ openCart, setCartOpen: setOpen }}>
      {children}
      <CartSheet open={open} onOpenChange={setOpen} />
    </CartSheetContext.Provider>
  );
}

export function useCartSheet() {
  const ctx = useContext(CartSheetContext);
  if (!ctx) {
    throw new Error("useCartSheet must be used within CartSheetProvider");
  }
  return ctx;
}
