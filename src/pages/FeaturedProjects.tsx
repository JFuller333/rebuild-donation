import { ApparelShopBar } from "@/components/ApparelShopBar";
import { Header } from "@/components/Header";
import { FeaturedProjectsSection } from "@/components/FeaturedProjectsSection";

/**
 * Standalone listing of featured (Shopify) projects with Supabase goal/raised stats.
 * Linked from the apparel timeline (step 3) and can be used elsewhere.
 */
const FeaturedProjects = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <ApparelShopBar />

      <section className="border-b border-border bg-secondary/20">
        <div className="container mx-auto px-4 py-10 md:py-12 max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Give</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Featured projects</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Support community development you can see and trust—projects making real change in our neighborhoods.
          </p>
        </div>
      </section>

      <FeaturedProjectsSection id="featured-projects" showIntro={false} />
    </div>
  );
};

export default FeaturedProjects;
