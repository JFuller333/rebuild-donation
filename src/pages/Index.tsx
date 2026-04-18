import heroImage from "@/assets/hero-community.jpg";
import { Header } from "@/components/Header";
import { FeaturedProjectsSection } from "@/components/FeaturedProjectsSection";
import { Stats } from "@/components/Stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, GraduationCap, Hammer, Shirt } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const pillars = [
  {
    step: 1,
    title: "Donate",
    icon: Shirt,
    body: "Every purchase feeds the mission. Wear it with pride.",
    actions: (
      <Button asChild className="rounded-full">
        <Link to="/shop">Shop the store</Link>
      </Button>
    ),
  },
  {
    step: 2,
    title: "Build",
    icon: Hammer,
    body: "Your gift becomes work you can see. It keeps the mission moving.",
    actions: (
      <Button className="rounded-full w-full sm:w-auto" asChild>
        <Link to="/featured-projects">Browse projects</Link>
      </Button>
    ),
  },
  {
    step: 3,
    title: "Learn",
    icon: GraduationCap,
    body: "Workshops and community revitalization. Learn next to the work and carry the mission forward.",
    actions: (
      <Button className="rounded-full w-full sm:w-auto" asChild>
        <Link to="/school/pathways-to-equity-ownership">Explore workshops</Link>
      </Button>
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

      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Community members working together on neighborhood development"
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-tr from-white via-white/80 to-white/40"
            aria-hidden
          />
        </div>
        <div className="container relative z-10 mx-auto pl-10 pr-10 py-20 sm:pl-14 sm:pr-14 md:py-28 md:pl-16 md:pr-16 lg:py-32 lg:pl-24 lg:pr-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6 text-foreground">
              Donate. Build. Learn.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 max-w-2xl">
              Glad you&apos;re here! We love Tuskegee and believe this community deserves a bright next chapter. When you
              shop, fund a build, or join community development workshops, you carry Let&apos;s Rebuild Tuskegee&apos;s
              mission forward. Every gift supports the same spirit of care. Let&apos;s Rebuild Tuskegee together! 
              <span className="text-primary" role="img" aria-label="love">
                ♥
              </span>
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-full text-base shadow-lg shadow-primary/15"
                onClick={() => navigate("/featured-projects")}
              >
                See projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-base" onClick={() => navigate("/shop")}>
                Shop the store
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Stats />

      <section id="donate" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">How it works</h2>
            <p className="text-muted-foreground">
              Shop sales, project gifts, and workshops all fuel the mission. Choose the step that fits you today.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pillars.map(({ step, title, icon: Icon, body, actions }) => (
              <Card
                key={title}
                className="relative flex flex-col overflow-hidden border-border/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-center border-b border-border/60 bg-secondary/20 px-4 py-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-sm ring-2 ring-primary/20">
                    {step}
                  </div>
                </div>
                <CardHeader className="space-y-3 text-center sm:px-6">
                  <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">{title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col space-y-6 text-center sm:px-6">
                  <p className="text-muted-foreground leading-relaxed">{body}</p>
                  <div className="flex justify-center">{actions}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <FeaturedProjectsSection />

      <section className="py-20 bg-accent/10">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Start here</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for being here. Each choice below sends support into the mission. Pick one and we will meet you
            there.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
            <Button size="lg" className="rounded-full" onClick={() => navigate("/projects/investment-tier-1")}>
              Donate now
            </Button>
            <Button size="lg" variant="outline" className="rounded-full bg-background/80" onClick={scrollProjects}>
              Browse projects
            </Button>
            <Button size="lg" variant="outline" className="rounded-full bg-background/80" onClick={() => navigate("/shop")}>
              Shop the store
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
                    Donate, Build, Learn
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
