import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  boardLeadershipVoices,
  libraryPodcastEpisodes,
  pathwayLabels,
  type PathwaySlug,
} from "@/data/school-library";
import { ExternalLink, Library, Mic, Sparkles, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const pathwayFilters: { slug: PathwaySlug | "all"; label: string }[] = [
  { slug: "all", label: "All episodes" },
  { slug: "family-equity", label: pathwayLabels["family-equity"] },
  { slug: "new-ownership", label: pathwayLabels["new-ownership"] },
  { slug: "community-revitalization", label: pathwayLabels["community-revitalization"] },
];

const SchoolLibrary = () => {
  const [pathwayFilter, setPathwayFilter] = useState<PathwaySlug | "all">("all");

  useEffect(() => {
    const previous = document.title;
    document.title = "Library | Equity & Ownership School";
    return () => {
      document.title = previous;
    };
  }, []);

  const filteredEpisodes = useMemo(() => {
    if (pathwayFilter === "all") return libraryPodcastEpisodes;
    return libraryPodcastEpisodes.filter((ep) => ep.pathwaySlugs.includes(pathwayFilter));
  }, [pathwayFilter]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="mx-auto max-w-4xl px-6 py-12 space-y-10">
        <header className="space-y-4 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            {"Equity & Ownership School"}
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl flex items-center gap-3 flex-wrap">
            <Library className="h-9 w-9 text-primary shrink-0" aria-hidden />
            School library
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Podcast episodes organized by topic, pathway, and tags—plus Voices in Leadership from our board,
            so learners hear policy, finance, and mission from the people who govern the work.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/school/pathways-to-equity-ownership">School overview</Link>
            </Button>
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/school/modules">Curriculum modules</Link>
            </Button>
            <Button className="rounded-full" asChild>
              <Link to="/auth">Sign in for access</Link>
            </Button>
          </div>
        </header>

        <Tabs defaultValue="podcast" className="w-full">
          <TabsList className="grid h-auto w-full max-w-md grid-cols-2 gap-1 p-1">
            <TabsTrigger value="podcast" className="gap-2">
              <Mic className="h-4 w-4" aria-hidden />
              Podcast
            </TabsTrigger>
            <TabsTrigger value="leadership" className="gap-2">
              <Users className="h-4 w-4" aria-hidden />
              Voices in Leadership
            </TabsTrigger>
          </TabsList>

          <TabsContent value="podcast" className="mt-8 space-y-6">
            <div className="rounded-lg border border-border/80 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              Episodes will publish here with listen links. Until then, use this grid to align transcripts,
              curriculum tie-ins, and tags with each pathway.
            </div>

            <div className="flex flex-wrap gap-2">
              {pathwayFilters.map(({ slug, label }) => (
                <Button
                  key={slug}
                  type="button"
                  size="sm"
                  variant={pathwayFilter === slug ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => setPathwayFilter(slug)}
                >
                  {label}
                </Button>
              ))}
            </div>

            <ul className="space-y-4">
              {filteredEpisodes.map((ep) => (
                <li key={ep.id}>
                  <Card id={ep.id} className="scroll-mt-24 border-border/80">
                    <CardHeader className="space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <CardTitle className="text-lg leading-snug pr-2">{ep.title}</CardTitle>
                        {ep.durationLabel ? (
                          <Badge variant="secondary" className="shrink-0">
                            {ep.durationLabel}
                          </Badge>
                        ) : null}
                      </div>
                      <CardDescription className="text-base text-muted-foreground leading-relaxed">
                        {ep.summary}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2">
                        {ep.pathwaySlugs.map((slug) => (
                          <Badge key={slug} variant="outline" className="font-normal">
                            {pathwayLabels[slug]}
                          </Badge>
                        ))}
                        {ep.topics.map((t) => (
                          <Badge key={t} className="font-normal bg-primary/10 text-primary hover:bg-primary/15">
                            {t}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {ep.tags.map((tag) => (
                          <span key={tag} className="text-xs text-muted-foreground">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {ep.listenHref ? (
                        <Button variant="outline" size="sm" className="rounded-full" asChild>
                          <a href={ep.listenHref} target="_blank" rel="noreferrer">
                            Listen
                            <ExternalLink className="ml-2 h-3.5 w-3.5" aria-hidden />
                          </a>
                        </Button>
                      ) : (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary shrink-0" aria-hidden />
                          Episode link coming soon — pair with a curriculum module when live.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>

            {filteredEpisodes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No episodes for this filter yet.</p>
            ) : null}
          </TabsContent>

          <TabsContent value="leadership" className="mt-8 space-y-6">
            <div className="rounded-lg border border-border/80 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              Short board spotlights: mission, governance lens, and how each voice connects to the three pathways.
              Replace placeholders with names, photos, and preferred pronouns when ready.
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {boardLeadershipVoices.map((voice) => (
                <Card key={voice.id} className="flex flex-col border-primary/15 bg-gradient-to-b from-primary/5 to-card">
                  <CardHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                        {(voice.name.trim() || voice.boardRole).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-lg leading-tight">
                          {voice.name.trim() || voice.boardRole}
                        </CardTitle>
                        <CardDescription className="text-sm font-medium text-primary normal-case">
                          {voice.name.trim()
                            ? voice.boardRole
                            : "Voices in Leadership · Board of directors"}
                        </CardDescription>
                      </div>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Pathway focus
                    </p>
                    <p className="text-sm text-foreground/90">{voice.pathwayFocus}</p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4 pt-0">
                    <blockquote className="border-l-2 border-primary/50 pl-4 text-sm italic text-muted-foreground leading-relaxed">
                      “{voice.quote}”
                    </blockquote>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-auto">{voice.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SchoolLibrary;
