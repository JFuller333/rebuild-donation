import { ApparelShopBar } from "@/components/ApparelShopBar";
import { Header } from "@/components/Header";
import { FeaturedProjectsSection } from "@/components/FeaturedProjectsSection";

/**
 * Standalone listing of featured (Shopify) projects with Supabase goal/raised stats.
 * Linked from the apparel timeline (step 2) and can be used elsewhere.
 */
const FeaturedProjects = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <ApparelShopBar />

      <div className="border-b border-border bg-secondary/20">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <header className="mx-auto max-w-4xl space-y-6 text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Contribute to the developments</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Fund projects you can follow
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              We list active development you can see and trust—goals, dollars raised, and what happens next. More
              projects roll on as milestones hit; bookmark this page and pick a build to back when you&apos;re ready.
            </p>
          </header>
        </div>
      </div>

      <FeaturedProjectsSection id="featured-projects" showIntro={false} />
    </div>
  );
};

export default FeaturedProjects;
