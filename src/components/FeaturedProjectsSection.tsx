import { useEffect, useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { useProducts } from "@/hooks/use-shopify-products";
import { shopifyProductToProjectCard } from "@/lib/shopify-adapters";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const FeaturedProjectsSection = () => {
  const { data: productsData, isLoading, error } = useProducts({ first: 6 });
  const [projectStats, setProjectStats] = useState<Record<string, { goal: number; raised: number }>>({});

  useEffect(() => {
    const handles =
      productsData?.edges
        ?.map(({ node }) => node.handle)
        .filter((handle): handle is string => Boolean(handle)) || [];

    if (!handles.length) {
      setProjectStats({});
      return;
    }

    let isCancelled = false;

    const fetchProjectStats = async () => {
      const { data, error: statsError } = await supabase
        .from("projects")
        .select("shopify_product_handle, goal_amount, raised_amount")
        .in("shopify_product_handle", handles);

      if (statsError) {
        console.error("Error fetching project stats:", statsError);
        return;
      }

      if (!isCancelled && data) {
        const map: Record<string, { goal: number; raised: number }> = {};
        data.forEach((row) => {
          const handleKey = row.shopify_product_handle || "";
          if (!handleKey) return;
          map[handleKey] = {
            goal: row.goal_amount ?? 0,
            raised: row.raised_amount ?? 0,
          };
        });
        setProjectStats(map);
      }
    };

    fetchProjectStats();

    return () => {
      isCancelled = true;
    };
  }, [productsData]);

  const featuredProjects =
    productsData?.edges.map(({ node: product }) => {
      const base = shopifyProductToProjectCard(product, {
        useVendorAsLocation: true,
      });

      const stats = projectStats[product.handle];
      const fallbackLocation =
        stats?.location ||
        (product.handle === "maple-street-housing" || product.vendor === "rebuild-investor-software"
          ? "Greenwood Neighborhood"
          : base.location);

      return {
        ...base,
        raised: stats?.raised ?? base.raised,
        goal: stats?.goal ?? base.goal,
        location: fallbackLocation,
      };
    }) || [];

  return (
    <section id="projects" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Projects</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            This block has a brighter future because of you. Support the projects making real change in our communities.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">Error loading products</p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Please check your Shopify configuration"}
            </p>
          </div>
        ) : featuredProjects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No products found. Add products in your Shopify store.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
