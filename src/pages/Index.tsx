import heroImage from "@/assets/hero-community.jpg";
import { Header } from "@/components/Header";
import { FeaturedProjectsSection } from "@/components/FeaturedProjectsSection";
import { Stats } from "@/components/Stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, GraduationCap, Hammer, Shirt } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Partner booking link (Calendly). Override with `VITE_PARTNER_BOOKING_URL` in `.env`.
 * Defaults to the public LRT scheduler so builds work without a local env file.
 */
const PARTNER_BOOKING_URL =
  (typeof import.meta.env.VITE_PARTNER_BOOKING_URL === "string" &&
    import.meta.env.VITE_PARTNER_BOOKING_URL.trim()) ||
  "https://calendly.com/build-letsrebuildtuskegee/30min";

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
              We love Tuskegee and believe our community deserves a bright next chapter. Shop, fund, 
              or join community development workshops to help drive LRT's
              mission forward. Every gift supports the same spirit of care and impact #LetsRebuildTuskegeeTogether!
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-full text-base shadow-lg shadow-primary/15"
                onClick={() => navigate("/featured-projects")}
              >
                See Current Projects
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
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Start here</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">How it works</h2>
            <p className="text-muted-foreground">
              Pick one: shop apparel, give to a project, or join a workshop. Each path supports the same work—select a step below to get started.
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

      <section id="partner" className="py-20 bg-accent/10">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Connect</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Partner with us</h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Organizations, sponsors, volunteers, and neighbors—we want to hear from you. If you&apos;re ready to explore
            how we can work together, book a short call. We&apos;ll listen, answer questions, and find a path that fits.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center">
            {PARTNER_BOOKING_URL ? (
              <Button size="lg" className="rounded-full gap-2" asChild>
                <a href={PARTNER_BOOKING_URL} target="_blank" rel="noopener noreferrer">
                  <Calendar className="h-4 w-4" aria-hidden />
                  Book a call
                </a>
              </Button>
            ) : (
              <Button size="lg" className="rounded-full gap-2" asChild>
                <Link to="/contact">
                  <Calendar className="h-4 w-4" aria-hidden />
                  Book a call
                </Link>
              </Button>
            )}
            <Button size="lg" variant="outline" className="rounded-full bg-background/80" asChild>
              <Link to="/contact">Contact us</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-8 max-w-lg mx-auto">
            Looking to give or shop first? Use{" "}
            <button
              type="button"
              className="text-primary font-medium underline-offset-4 hover:underline"
              onClick={() => document.getElementById("donate")?.scrollIntoView({ behavior: "smooth" })}
            >
              How it works
            </button>{" "}
            above or open the{" "}
            <button
              type="button"
              className="text-primary font-medium underline-offset-4 hover:underline"
              onClick={() => navigate("/shop")}
            >
              shop
            </button>
            .
          </p>
        </div>
      </section>

      <footer className="border-t border-black bg-black text-white py-12">
        <div className="container mx-auto px-4">
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
                  <a href="https://www.letsrebuildtuskegee.org/" className="hover:text-white transition-colors">
                    Become a member
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
