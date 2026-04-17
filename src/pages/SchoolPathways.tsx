import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Brain,
  Building2,
  Compass,
  GitBranch,
  HardHat,
  Landmark,
  Layers,
  Library,
  Link2,
  Mic,
  Route,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const pathways = [
  {
    title: "Family Equity Path",
    subtitle: "For people who already have property but no structure",
    lane: "Heirs property / legacy lane",
    moduleCount: 6,
    transformation: "From confusion → clarity → coordination → preserved ownership",
    modules: [
      "What is heirs property (real explanation)",
      "Understanding title & deeds",
      "Common ownership breakdowns",
      "Family communication & alignment",
      "Legal & structural options (LLCs, agreements)",
      "Tax, risk awareness & transitioning to structured ownership",
    ],
    podcast: [
      "Real family stories",
      "Land loss scenarios",
      "Conflict resolution conversations",
    ],
  },
  {
    title: "New Ownership Path",
    subtitle: "For people starting from zero or close to it",
    lane: "Foundation builder lane",
    moduleCount: 6,
    transformation: "From no ownership → first asset → repeatable strategy",
    modules: [
      "Ownership mindset (consumer → owner)",
      "Credit & financial foundation",
      "Income & capital strategy",
      "First property strategy (home, land, investment)",
      "Understanding deals",
      "Entity setup & your first ownership stack",
    ],
    podcast: ["Beginner mistakes", "First deal breakdowns", "Mindset conversations"],
  },
  {
    title: "Community Revitalization Path",
    subtitle: "For builders, leaders, and developers",
    lane: "LRT / ecosystem lane",
    moduleCount: 7,
    transformation: "From individual thinking → community-scale ownership & development",
    modules: [
      "What is community ownership?",
      "HBCU community dynamics",
      "Land acquisition for development",
      "Funding & partnerships (grants, donors, investors)",
      "Development process (concept → construction)",
      "Legal & governance structures",
      "Building sustainable ecosystems",
    ],
    podcast: ["LRT development journey", "Partnerships", "Funding conversations", "Real-time project updates"],
  },
] as const;

const futureNav = [
  { label: "Dashboard", note: "Progress and next lesson" },
  { label: "Pathways to equity & ownership", note: "Entry to all three tracks" },
  { label: "Family Equity", note: "" },
  { label: "New Ownership", note: "" },
  { label: "Community Revitalization", note: "" },
  { label: "Voices in ownership", note: "Advisory layer across pathways" },
  { label: "Library", note: "Podcast knowledge + resources" },
  { label: "Podcast Knowledge", note: "Browse by topic, pathway, tags" },
  { label: "Resources", note: "Templates and downloads" },
  { label: "Community", note: "Discussions and cohorts" },
];

const lessonBlueprint = [
  "Title",
  "Key idea",
  "Breakdown",
  "Framework",
  "Action step",
  "Resource",
  "Related podcast conversations (linked clips)",
];

const podcastOrganization = ["Topic (e.g. heirs property, credit, development)", "Pathway (auto-linked)", "Tags"];

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
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        </header>

        <section className="space-y-8" aria-labelledby="pathways-heading">
          <div className="flex items-center gap-3">
            <Compass className="h-6 w-6 text-primary shrink-0" aria-hidden />
            <h2 id="pathways-heading" className="text-2xl font-bold">
              The three pathways
            </h2>
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
                        <li key={m}>{m}</li>
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

        <Separator />

        <section className="space-y-6" aria-labelledby="layers-heading">
          <div className="flex items-center gap-3">
            <Layers className="h-6 w-6 text-primary shrink-0" aria-hidden />
            <h2 id="layers-heading" className="text-2xl font-bold">
              Two content layers
            </h2>
          </div>
          <p className="text-muted-foreground">
            Every serious topic exists in both forms so people get clarity from lessons and context from
            conversation.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-primary" aria-hidden />
                  Layer 1: Curriculum
                </CardTitle>
                <CardDescription>Structured — your authority</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>Clean lessons and step-by-step thinking</li>
                  <li>Frameworks and definitions</li>
                  <li>Clear action steps</li>
                </ul>
                <p className="mt-4 text-sm font-medium text-foreground">This is what people pay for.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Library className="h-5 w-5 text-primary" aria-hidden />
                  Layer 2: Podcast library
                </CardTitle>
                <CardDescription>Dynamic — your living brain</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>Raw conversations and real stories</li>
                  <li>Evolving ideas and breakdowns</li>
                </ul>
                <p className="mt-4 text-sm font-medium text-foreground">This is what keeps the platform alive.</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" aria-hidden />
                How they work together
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                <span className="font-semibold text-foreground">Example — heirs property:</span> Curriculum delivers
                a foundational lesson: &quot;What is heirs property?&quot; The podcast offers a parallel
                conversation: &quot;We talked to someone dealing with twelve heirs on one lot…&quot;
              </p>
              <p className="font-medium text-foreground">Learners get clarity plus context.</p>
            </CardContent>
          </Card>
        </section>

        <Separator />

        <section className="space-y-6" aria-labelledby="app-structure-heading">
          <div className="flex items-center gap-3">
            <Route className="h-6 w-6 text-primary shrink-0" aria-hidden />
            <h2 id="app-structure-heading" className="text-2xl font-bold">
              How this maps in the app
            </h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Planned navigation</CardTitle>
              <CardDescription>Simple IA to grow into as you ship modules</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {futureNav.map((item) => (
                  <li key={item.label} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 text-sm border-b border-border/60 pb-3 last:border-0 last:pb-0">
                    <span className="font-semibold text-foreground shrink-0 sm:w-52">{item.label}</span>
                    {item.note ? <span className="text-muted-foreground">{item.note}</span> : null}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inside a pathway</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>Modules</li>
                  <li>Lessons</li>
                  <li>Progress tracking</li>
                  <li>Related discussions</li>
                  <li>Attached podcast clips</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inside a lesson</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  {lessonBlueprint.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" aria-hidden />
                Podcast library page
              </CardTitle>
              <CardDescription>Organize for discovery, not only episode order</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                {podcastOrganization.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <Separator />

        <section className="space-y-6" aria-labelledby="workflow-heading">
          <div className="flex items-center gap-3">
            <GitBranch className="h-6 w-6 text-primary shrink-0" aria-hidden />
            <h2 id="workflow-heading" className="text-2xl font-bold">
              Content workflow
            </h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Each recording feeds both layers so nothing sits orphaned in one format.
          </p>
          <ol className="list-decimal pl-5 space-y-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
            <li>Record podcast</li>
            <li>Transcribe</li>
            <li>
              Extract: one lesson idea, one framework, one discussion question
            </li>
            <li>
              Publish to the library (raw) and refine into curriculum (structured progression)
            </li>
          </ol>
        </section>

        <Separator />

        <section className="space-y-6" aria-labelledby="monetization-heading">
          <div className="flex items-center gap-3">
            <Wallet className="h-6 w-6 text-primary shrink-0" aria-hidden />
            <h2 id="monetization-heading" className="text-2xl font-bold">
              Monetization (aligned with the model)
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-2xl">
            You are not selling &quot;podcast access.&quot; You are selling structured understanding and application.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                  Free
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>Some podcast content</li>
                  <li>Limited lessons</li>
                  <li>Community access</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg">Paid</CardTitle>
                <CardDescription>Full learning product</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>Full pathways</li>
                  <li>Full curriculum</li>
                  <li>Resources and templates</li>
                  <li>Structured progression</li>
                  <li>Premium discussions</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SchoolPathways;
