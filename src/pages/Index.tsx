import { Header } from "@/components/Header";
import { FeaturedProjectsSection } from "@/components/FeaturedProjectsSection";
import { Button } from "@/components/ui/button";
import { apparelProductPageCopy } from "@/config/apparel-product-page";
import { cn } from "@/lib/utils";
import { ArrowRight, Gift, GraduationCap, Hammer } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const { shopProcessSteps } = apparelProductPageCopy;

/** Copy and actions for each mission step (labels + routes come from `shopProcessSteps`). */
const stepContent = [
  {
    icon: Gift,
    body: "Shop apparel or give directly to a project—both support the mission.",
    actions: (
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <Button asChild className="rounded-full">
          <Link to={shopProcessSteps[0].to}>Shop apparel</Link>
        </Button>
        <Button variant="outline" className="rounded-full bg-background/80" asChild>
          <a href="#projects">Give to a project</a>
        </Button>
      </div>
    ),
  },
  {
    icon: GraduationCap,
    body: "As a donor or member, you get our online school—real guidance on building equity and ownership.",
    actions: (
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <Button className="rounded-full w-full sm:w-auto" asChild>
          <Link to="/auth">Sign in to the school</Link>
        </Button>
        <Button variant="outline" className="rounded-full w-full sm:w-auto bg-background/80" asChild>
          <Link to={shopProcessSteps[1].to}>{"Pathways to equity & ownership"}</Link>
        </Button>
      </div>
    ),
  },
  {
    icon: Hammer,
    body: "Your gift funds community development we are building with neighbors—projects you can see and trust.",
    actions: (
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <Button className="rounded-full w-full sm:w-auto" asChild>
          <Link to="/featured-projects">Browse featured projects</Link>
        </Button>
        <Button variant="outline" className="rounded-full w-full sm:w-auto bg-background/80" asChild>
          <a href="#projects">Jump to projects below</a>
        </Button>
      </div>
    ),
  },
] as const;

const Index = () => {
  const navigate = useNavigate();

  const scrollProjects = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <Header />

      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-background to-accent/20">
        <div className="container mx-auto px-4 py-20 md:py-28 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6 text-foreground">
              Donate. Learn. Build.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
              Give through the store or a project, use the online school as a donor or member, and fund
              development built with the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <Button size="lg" className="rounded-full text-base shadow-lg shadow-primary/15" onClick={scrollProjects}>
                Find a project to support
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-base bg-background/80" asChild>
                <a href="#step-1">Start with step 1</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {shopProcessSteps.map((meta, index) => {
        const { icon: Icon, body, actions } = stepContent[index];
        const isLast = index === shopProcessSteps.length - 1;

        return (
          <section
            key={meta.step}
            id={`step-${meta.step}`}
            className={cn(
              "scroll-mt-24 border-b border-border",
              index % 2 === 0 ? "bg-secondary/30" : "bg-background"
            )}
          >
            <div className="container mx-auto px-4 py-16 md:py-20 lg:py-24">
              <div className="max-w-3xl">
                <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-8">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-lg font-bold text-primary shadow-sm">
                    {meta.step}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
                      Step {meta.step}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 gap-y-2 mb-4">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{meta.label}</h2>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-8">{body}</p>
                  </div>
                </div>
                {actions}
              </div>
            </div>

            {isLast ? (
              <div className="border-t border-border/80 bg-background/50">
                <FeaturedProjectsSection id="projects" showIntro={false} />
              </div>
            ) : null}
          </section>
        );
      })}

      <section className="py-20 bg-accent/10">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Start here</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Donate when you are ready, then sign in for school access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full" onClick={() => navigate("/projects/investment-tier-1")}>
              Donate now
            </Button>
            <Button size="lg" variant="outline" className="rounded-full bg-background/80" onClick={scrollProjects}>
              Browse projects
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-black bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-white/70 mb-8">
            <Link to="/home-brand" className="underline hover:text-white">
              View the brand homepage backup (development)
            </Link>
          </p>
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-4">Let's Rebuild Tuskegee</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Empowering communities through transparent, impactful community development projects.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>
                  <a href="https://www.letsrebuildtuskegee.org/" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#projects" className="hover:text-white transition-colors">
                    Our Projects
                  </a>
                </li>
                <li>
                  <a href="#step-1" className="hover:text-white transition-colors">
                    Step 1 — Support the mission
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>Tax ID: 83-3300246</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>build@letsrebuildtuskegee.org</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-sm text-white/80">
            <p>© 2026 Let's Rebuild Tuskegee. 501(c)(3) nonprofit organization. All donations are tax-deductible.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
