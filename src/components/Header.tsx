import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, User, ShoppingCart, GraduationCap, Library, Shirt } from "lucide-react";
import { CartSheet } from "@/components/CartSheet";
import { useCartItemCount } from "@/hooks/use-shopify-cart";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const cartItemCount = useCartItemCount();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-border bg-black/95 text-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div 
          className="flex items-center gap-3 text-white cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img 
            src="/lrt-logo.png" 
            alt="Let's Rebuild Tuskegee logo" 
            className="h-12 md:h-16 w-auto rounded"
          />
          <h2 
            className="hidden md:block text-[1.35em] md:text-[1.6em] font-bold tracking-tight"
          >
            Let's Rebuild Tuskegee
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Button>

          <Button
            variant="ghost"
            className="hidden md:inline-flex gap-2"
            onClick={() => navigate("/shop")}
          >
            <Shirt className="h-4 w-4" aria-hidden />
            Shop
          </Button>

          <Button 
            variant="ghost" 
            className="hidden md:inline-flex"
            onClick={() => navigate("/projects/investment-tier-1")}
          >
            Donate
          </Button>
          {user && (
            <Button 
              variant="ghost" 
              className="hidden md:inline-flex"
              onClick={() => navigate("/donor-dashboard")}
            >
              <User className="mr-2 h-4 w-4" />
              Donor Dashboard
            </Button>
          )}
          {!user && (
            <Button 
              variant="ghost" 
              className="hidden md:inline-flex"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
          )}
          <Button
            variant="ghost"
            className="hidden md:inline-flex gap-2"
            onClick={() => navigate("/school/pathways-to-equity-ownership")}
          >
            <GraduationCap className="h-4 w-4" />
            School
          </Button>
          <Button
            variant="ghost"
            className="hidden lg:inline-flex gap-2"
            onClick={() => navigate("/school/library")}
          >
            <Library className="h-4 w-4" />
            Podcast Library
          </Button>
          <Button 
            variant="ghost" 
            className="hidden md:inline-flex"
            onClick={() => navigate("/contact")}
          >
            Contact Us
          </Button>
          <Button 
            onClick={() => navigate("/projects/investment-tier-1")}
            className="rounded-full bg-[rgb(6,78,59)] text-white hover:bg-[rgb(16,87,70)] px-5"
          >
            Donate Now
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
};
