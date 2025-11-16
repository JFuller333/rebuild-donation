import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, User, ShoppingCart } from "lucide-react";
import { CartSheet } from "@/components/CartSheet";
import { useCartItemCount } from "@/hooks/use-shopify-cart";

export const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
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
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .single();

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

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <h2 
              className="text-2xl font-bold tracking-tight cursor-pointer"
              onClick={() => navigate("/")}
            >
              Rebuild Together
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

            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  className="hidden md:inline-flex"
                  onClick={() => navigate("/donor-dashboard")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Donor Dashboard
                </Button>
                {isAdmin && (
                  <Button 
                    variant="ghost" 
                    className="hidden md:inline-flex"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("Admin button clicked, isAdmin:", isAdmin);
                      navigate("/admin-dashboard");
                    }}
                  >
                    Admin
                  </Button>
                )}
                {/* Temporary: Show admin button for all logged-in users (matching AdminDashboard behavior) */}
                {user && !isAdmin && (
                  <Button 
                    variant="ghost" 
                    className="hidden md:inline-flex"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("Admin button clicked (temp access)");
                      navigate("/admin-dashboard");
                    }}
                  >
                    Admin
                  </Button>
                )}
                <Button onClick={() => navigate("/projects/maple-street-housing")}>
                  Donate Now
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="hidden md:inline-flex"
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
                <Button onClick={() => navigate("/projects/maple-street-housing")}>
                  Donate Now
                </Button>
              </>
            )}
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
