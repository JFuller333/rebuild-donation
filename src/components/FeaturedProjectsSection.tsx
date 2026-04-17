import { useEffect, useMemo, useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { useProducts } from "@/hooks/use-shopify-products";
import { shopifyProductToProjectCard } from "@/lib/shopify-adapters";
import { isApparelProduct } from "@/lib/product-kind";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type FeaturedProjectsSectionProps = {
  /** Anchor id (home uses `projects` for #projects links). */
  id?: string;
  /** Set false on the dedicated featured-projects page when the page hero already introduces the section. */
  showIntro?: boolean;
};

export const FeaturedProjectsSection = ({
  id = "projects",
  showIntro = true,
}: FeaturedProjectsSectionProps = {}) => {
  /** Fetch extra products so we still have up to 6 after removing `apparel`-tagged shop items. */
  const { data: productsData, isLoading, error } = useProducts({ first: 48 });
  const [projectStats, setProjectStats] = useState<Record<string, { goal: number; raised: number }>>({});

  const projectProductEdges = useMemo(() => {
    if (!productsData?.edges?.length) return [];
    return productsData.edges
      .filter(({ node }) => !isApparelProduct(node))
      .slice(0, 6);
  }, [productsData]);

  useEffect(() => {
    const handles =
      projectProductEdges.map(({ node }) => node.handle).filter((handle): handle is string => Boolean(handle)) || [];

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
  }, [projectProductEdges]);

  const featuredProjects =
    projectProductEdges.map(({ node: product }) => {
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
    <section id={id} className={showIntro ? "py-20" : "py-12 md:py-16"}>
      <div className="container mx-auto px-4">
        {showIntro ? (
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Projects</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              This block has a brighter future because of you. Support the projects making real change in our communities.
            </p>
          </div>
        ) : null}

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
