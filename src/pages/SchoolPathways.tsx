import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Brain,
  Building2,
  Compass,
  HardHat,
  Landmark,
  Mic,
} from "lucide-react";
import { schoolPathways } from "@/data/school-pathways";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const pathways = schoolPathways;

const advisoryVoices = [
  {
    title: "Council member",
    role: "Civic infrastructure advisor",
    primaryPath: "Community Revitalization",
    supports: ["Family Equity", "New Ownership"] as const,
    line: "Guides how development moves through city systems, approvals, and public policy.",
    Icon: Building2,
  },
  {
    title: "Banker",
    role: "Capital strategy advisor",
    primaryPath: "New Ownership",
    supports: ["Family Equity", "Community Revitalization"] as const,
    line: "Provides insight into how capital is evaluated, approved, and deployed.",
    Icon: Landmark,
  },
  {
    title: "Construction professor",
    role: "Development & construction advisor",
    primaryPath: "Community Revitalization",
    supports: ["New Ownership", "Family Equity"] as const,
    line: "Breaks down how projects move from concept to construction.",
    Icon: HardHat,
  },
] as const;

const SchoolPathways = () => {
  useEffect(() => {
    const previous = document.title;
    document.title = "Equity & Ownership School | Let's Rebuild Tuskegee";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="mx-auto max-w-4xl px-6 py-12 space-y-16">
        <header className="space-y-4 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Rebuild school (planned)</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {"Equity & Ownership School"}
          </h1>
          <p className="text-lg font-medium text-primary max-w-2xl">
            {"Pathways to equity & ownership"}
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Real-world learning from operators—not theory alone. Three pathways, structured curriculum, and a
            podcast library so every topic comes with clarity and context.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button className="rounded-full" asChild>
              <Link to="/auth">Sign in for access</Link>
            </Button>
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/school/modules">Curriculum modules</Link>
            </Button>
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/school/library">{"Podcast & library"}</Link>
            </Button>
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        </header>

        <section className="space-y-8" aria-labelledby="pathways-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Compass className="h-6 w-6 text-primary shrink-0" aria-hidden />
              <h2 id="pathways-heading" className="text-2xl font-bold">
                The three pathways
              </h2>
            </div>
            <Button variant="outline" size="sm" className="rounded-full w-fit shrink-0" asChild>
              <Link to="/school/modules">View all modules</Link>
            </Button>
          </div>

          <div className="space-y-8">
            {pathways.map((path) => (
              <Card key={path.title} className="overflow-hidden border-border/80 shadow-sm">
                <CardHeader className="space-y-3 bg-secondary/40 border-b border-border/60">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl">{path.title}</CardTitle>
                      <CardDescription className="text-base text-muted-foreground mt-1">{path.subtitle}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-sm">
                      {path.moduleCount} modules
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-primary">{path.lane}</p>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    <span className="font-semibold text-foreground">Core transformation: </span>
                    {path.transformation}
                  </p>
                </CardHeader>
                <CardContent className="pt-6 grid gap-8 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" aria-hidden />
                      Curriculum modules
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
                      {path.modules.map((m) => (
                        <li key={m.id}>
                          <Link
                            to={`/school/modules?pathway=${path.slug}#${m.id}`}
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            {m.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                      <Mic className="h-4 w-4" aria-hidden />
                      Podcast integration
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
                      {path.podcast.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-8" aria-labelledby="voices-heading">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-primary shrink-0" aria-hidden />
              <h2 id="voices-heading" className="text-2xl font-bold">
                Voices in Ownership
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Learn from real operators across capital, policy, and development.
            </p>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed border-l-2 border-primary/40 pl-4">
              An advisory layer that sits across all three pathways—so learning stays grounded in how work
              actually gets done, not slides alone. Insights come from people who run deals, systems, and sites.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {advisoryVoices.map(({ title, role, primaryPath, supports, line, Icon }) => (
              <Card key={title} className="flex flex-col border-border/80 shadow-sm">
                <CardHeader className="space-y-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <CardTitle className="text-lg leading-snug capitalize">{title}</CardTitle>
                  <CardDescription className="text-sm font-medium text-foreground/90 normal-case">
                    {role}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4 pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Primary path
                      </span>
                      <Badge variant="secondary" className="w-fit">
                        {primaryPath}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Also supports
                      </span>
                      <p className="text-foreground/90">{supports.join(" · ")}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-auto border-t border-border/60 pt-4">
                    {line}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SchoolPathways;
