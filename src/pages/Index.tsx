import { Header } from "@/components/Header";
import { FeaturedProjectsSection } from "@/components/FeaturedProjectsSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getShopifyStoreUrl } from "@/integrations/shopify/client";
import { ArrowRight, Gift, GraduationCap, Hammer } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const shopDomain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN as string | undefined;
const apparelStoreHref = shopDomain ? getShopifyStoreUrl() : null;

const pillars = [
  {
    step: 1,
    title: "Donate",
    tagline: "Choose how you give",
    icon: Gift,
    body:
      "Support Rebuild by purchasing apparel from our store or by giving directly to a project. Both paths strengthen the mission—pick what fits you best.",
    actions: (
      <div className="flex flex-col sm:flex-row gap-3">
        {apparelStoreHref ? (
          <Button asChild className="rounded-full">
            <a href={apparelStoreHref} target="_blank" rel="noreferrer">
              Shop apparel
            </a>
          </Button>
        ) : null}
        <Button variant={apparelStoreHref ? "outline" : "default"} className="rounded-full" asChild>
          <a href="#projects">Give to a project</a>
        </Button>
      </div>
    ),
  },
  {
    step: 2,
    title: "Learn",
    tagline: "Open the online school",
    icon: GraduationCap,
    body:
      "When you donate or become a member of Rebuild, you gain access to our online school—clear, practical teaching for individuals and families on building equity and acquiring ownership.",
    actions: (
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="rounded-full" asChild>
          <Link to="/auth">Sign in for school access</Link>
        </Button>
        <Button variant="outline" className="rounded-full" asChild>
          <a href="https://www.letsrebuildtuskegee.org/" target="_blank" rel="noreferrer">
            About Rebuild
          </a>
        </Button>
      </div>
    ),
  },
  {
    step: 3,
    title: "Build",
    tagline: "Fund what we build together",
    icon: Hammer,
    body:
      "Donations flow into Community Development projects we are building with and for the community—transparent initiatives designed to create lasting neighborhood impact.",
    actions: (
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="rounded-full" asChild>
          <a href="#projects">Explore projects</a>
        </Button>
        <Button variant="outline" className="rounded-full" asChild>
          <Link to="/projects/investment-tier-1">Donate now</Link>
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
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary mb-4">
              Your path with Rebuild
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6 text-foreground">
              Donate. Learn. Build.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10">
              Three pillars, one journey: give in the way that suits you, learn how to grow lasting
              wealth and ownership, and watch your support become real community development on the ground.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="rounded-full text-base shadow-lg shadow-primary/15" onClick={scrollProjects}>
                Start with a project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-base bg-background/80" asChild>
                <Link to="/home-brand">Previous homepage layout</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="donate" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Three steps. One mission.</h2>
            <p className="text-lg text-muted-foreground">
              We designed the experience so you always know what happens after you give—access to learning,
              then impact you can see in community-led projects.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pillars.map(({ step, title, tagline, icon: Icon, body, actions }) => (
              <Card
                key={title}
                className="relative overflow-hidden border-border/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {step}
                </div>
                <CardHeader className="space-y-3 pr-14">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">{title}</CardTitle>
                  <p className="text-sm font-medium text-primary">{tagline}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">{body}</p>
                  {actions}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <FeaturedProjectsSection />

      <section className="py-20 bg-accent/10">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to take the first step?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Pick a project, shop the store, or sign in to open everything your membership includes—including
            the school.
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
                  <a href="#donate" className="hover:text-white transition-colors">
                    Donate → Learn → Build
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
