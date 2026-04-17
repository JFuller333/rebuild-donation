import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, User, ShoppingCart, GraduationCap, Library } from "lucide-react";
import { CartSheet } from "@/components/CartSheet";
import { useCartItemCount } from "@/hooks/use-shopify-cart";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartItemCount = useCartItemCount();

  useEffect(() => {
    // Check current auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        checkAdminRole(user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      // Use maybeSingle() instead of single() to handle case where no role exists
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      // If table doesn't exist (406/404), just assume not admin
      if (error && (error.code === 'PGRST116' || error.message?.includes('406') || error.message?.includes('relation') || error.message?.includes('does not exist'))) {
        console.warn("user_roles table may not exist yet. Run migrations to create it.");
        setIsAdmin(false);
        return;
      }

      const hasAdminRole = !error && data !== null;
      setIsAdmin(hasAdminRole);
      
      // Debug logging
      console.log("Admin role check:", {
        userId,
        hasAdminRole,
        error: error?.message,
        data
      });
    } catch (error) {
      console.error("Error checking admin role:", error);
      setIsAdmin(false);
    }
  };

  const handleAdminClick = () => {
    if (!user || !isAdmin) {
      navigate("/auth");
      return;
    }
    navigate("/admin-dashboard");
  };

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
            className="hidden md:inline-flex"
            onClick={handleAdminClick}
          >
            Admin
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
            {"Equity & ownership"}
          </Button>
          <Button
            variant="ghost"
            className="hidden lg:inline-flex gap-2"
            onClick={() => navigate("/school/library")}
          >
            <Library className="h-4 w-4" />
            Library
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
