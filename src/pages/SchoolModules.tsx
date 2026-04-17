import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { schoolPathways } from "@/data/school-pathways";
import { BookOpen, Mic } from "lucide-react";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

const tabValues = schoolPathways.map((p) => p.slug);

const SchoolModules = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("pathway") || "";
  const activeTab = tabValues.includes(tabParam) ? tabParam : schoolPathways[0].slug;

  useEffect(() => {
    const previous = document.title;
    document.title = "Curriculum modules | Equity & Ownership School";
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const t = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => window.clearTimeout(t);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="mx-auto max-w-4xl px-6 py-12 space-y-10">
        <header className="space-y-4 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            {"Equity & Ownership School"}
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Curriculum modules</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Planned modules for each pathway—structured lessons with podcast tie-ins as you ship the school.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/school/pathways-to-equity-ownership">School overview</Link>
            </Button>
            <Button className="rounded-full" asChild>
              <Link to="/auth">Sign in for access</Link>
            </Button>
          </div>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setSearchParams({ pathway: value });
          }}
          className="w-full"
        >
          <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-muted/50 p-2 sm:grid-cols-3">
            {schoolPathways.map((p) => (
              <TabsTrigger
                key={p.slug}
                value={p.slug}
                className="whitespace-normal px-3 py-2.5 text-left text-sm leading-snug data-[state=active]:shadow-sm"
              >
                {p.title.replace(" Path", "")}
              </TabsTrigger>
            ))}
          </TabsList>

          {schoolPathways.map((pathway) => (
            <TabsContent key={pathway.slug} value={pathway.slug} className="mt-8 space-y-8">
              <Card className="border-primary/15 bg-primary/5">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl">{pathway.title}</CardTitle>
                      <CardDescription className="text-base mt-1">{pathway.subtitle}</CardDescription>
                    </div>
                    <Badge variant="secondary">{pathway.moduleCount} modules</Badge>
                  </div>
                  <p className="text-sm font-medium text-primary pt-1">{pathway.lane}</p>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    <span className="font-semibold">Core transformation: </span>
                    {pathway.transformation}
                  </p>
                </CardHeader>
              </Card>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" aria-hidden />
                  Modules
                </h2>
                <ol className="space-y-4">
                  {pathway.modules.map((mod, index) => (
                    <li key={mod.id}>
                      <Card id={mod.id} className="scroll-mt-24 border-border/80">
                        <CardHeader className="pb-2">
                          <div className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                              {index + 1}
                            </span>
                            <div>
                              <CardTitle className="text-base leading-snug sm:text-lg">{mod.title}</CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 pl-[3.25rem]">
                          <p className="text-sm text-muted-foreground leading-relaxed">{mod.summary}</p>
                        </CardContent>
                      </Card>
                    </li>
                  ))}
                </ol>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mic className="h-4 w-4 text-primary" aria-hidden />
                    Podcast integration (pathway level)
                  </CardTitle>
                  <CardDescription>
                    Each module will link to related conversations in the podcast library.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    {pathway.podcast.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default SchoolModules;
