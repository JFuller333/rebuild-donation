import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useProduct } from "@/hooks/use-shopify-products";
import { isApparelProduct } from "@/lib/product-kind";
import { Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import ProductDetail from "./ProductDetail";
import ProjectDetail from "./ProjectDetail";

/**
 * Chooses template by product data: `apparel` tag → commerce (cart / checkout);
 * otherwise → donation / project experience.
 */
const ProductRouteTemplate = () => {
  const { id: handle } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError, error } = useProduct(handle || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isError || product === null || product === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center max-w-md">
          <p className="text-destructive font-medium mb-2">Product not found</p>
          <p className="text-sm text-muted-foreground mb-6">
            {error instanceof Error ? error.message : "This product may be unpublished or the link is wrong."}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/shop")}>
              Back to shop
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isApparelProduct(product)) {
    return <ProductDetail />;
  }

  return <ProjectDetail />;
};

export default ProductRouteTemplate;
