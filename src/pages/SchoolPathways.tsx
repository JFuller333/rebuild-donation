import { ApparelShopBar } from "@/components/ApparelShopBar";
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
  Video,
} from "lucide-react";
import { schoolPathways } from "@/data/school-pathways";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const pathways = schoolPathways;

/** Toggle to show the “Curriculum pathways” block again (currently hidden). */
const SHOW_CURRICULUM_PATHWAYS = false;

/** Toggle to show the “Voices in Ownership” block again (currently hidden). */
const SHOW_VOICES_IN_OWNERSHIP = false;

/** Official-style YouTube mark (red play tile) for build session listings. */
function YouTubeMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      focusable="false"
    >
      <path
        fill="#FF0000"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
      />
      <path fill="#fff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

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
    document.title = "Rebuild Workshops & Learn | Let's Rebuild Tuskegee";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <ApparelShopBar />

      <div className="mx-auto max-w-4xl px-6 py-12 space-y-16">
        <header className="space-y-6 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Rebuild Workshops</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Learn live—with real projects in Tuskegee
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            We&apos;re starting with live sessions on YouTube, then layering in pathways and library content as
            they ship. Check back for the stream link; the first session is coming up soon.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button className="rounded-full" asChild>
              <Link to="/auth">Sign in for access</Link>
            </Button>
          </div>
        </header>

        <section className="space-y-6" aria-labelledby="build-sessions-heading">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Video className="h-7 w-7 text-primary shrink-0" aria-hidden />
              <h2 id="build-sessions-heading" className="text-2xl font-bold">
                Upcoming Live Workshops
              </h2>
            </div>
          </div>

          <Card className="overflow-hidden border-primary/25 border-2 shadow-md bg-card">
            <CardHeader className="space-y-4 bg-secondary/30 border-b border-border/60">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-primary text-primary-foreground">First build session</Badge>
                <Badge variant="secondary">Starts in 2 weeks</Badge>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <YouTubeMark className="h-6 w-6 shrink-0" aria-hidden />
                  <span>Live on YouTube</span>
                </span>
              </div>
              <CardTitle className="text-2xl sm:text-3xl leading-snug text-balance">
                Building Commercial Units in Tuskegee
              </CardTitle>
              <CardDescription className="text-base text-foreground/90">
                Join us for our first build session—real talk on commercial development, local context, and what it
                takes to build units that serve the community. Stream link will be posted here before we go live.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <p className="text-sm text-muted-foreground max-w-xl">
                Subscribe to Let&apos;s Rebuild Tuskegee on YouTube so you don&apos;t miss the premiere. Details
                and calendar invite will follow.
              </p>
              <Button
                variant="outline"
                className="rounded-full shrink-0 gap-2 border-red-600/40 text-red-700 hover:bg-red-50 hover:text-red-800 dark:hover:bg-red-950/30"
                asChild
              >
                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                  title="Replace with your channel or premiere link when ready"
                >
                  <YouTubeMark className="h-5 w-5" />
                  Watch on YouTube
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>

        {SHOW_CURRICULUM_PATHWAYS ? (
          <section className="space-y-8" aria-labelledby="pathways-heading">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Compass className="h-6 w-6 text-primary shrink-0" aria-hidden />
                <h2 id="pathways-heading" className="text-2xl font-bold">
                  Curriculum pathways
                </h2>
              </div>
              <Button variant="outline" size="sm" className="rounded-full w-fit shrink-0" asChild>
                <Link to="/school/modules">View all modules</Link>
              </Button>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
              Pathways to equity & ownership—structured modules and podcast tie-ins for when you&apos;re ready to go
              deeper after build sessions.
            </p>

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
        ) : null}

        {SHOW_VOICES_IN_OWNERSHIP ? (
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
        ) : null}
      </div>
    </div>
  );
};

export default SchoolPathways;
