export type PathwaySlug = "family-equity" | "new-ownership" | "community-revitalization";

export type LibraryPodcastEpisode = {
  id: string;
  title: string;
  summary: string;
  topics: readonly string[];
  pathwaySlugs: readonly PathwaySlug[];
  tags: readonly string[];
  durationLabel?: string;
  /** External listen URL when published; omit or null for coming soon */
  listenHref?: string | null;
};

export type BoardLeadershipVoice = {
  id: string;
  /** Use real names when ready; placeholder shown if empty */
  name: string;
  boardRole: string;
  pathwayFocus: string;
  quote: string;
  bio: string;
};

export const pathwayLabels: Record<PathwaySlug, string> = {
  "family-equity": "Family Equity",
  "new-ownership": "New Ownership",
  "community-revitalization": "Community Revitalization",
};

export const libraryPodcastEpisodes: readonly LibraryPodcastEpisode[] = [
  {
    id: "ep-heirs-introduction",
    title: "Twelve heirs, one lot: where to start",
    summary:
      "A walkthrough of how families discover heirs property status, who needs a seat at the table, and the first three questions to ask an attorney or title partner.",
    topics: ["Heirs property", "Family alignment"],
    pathwaySlugs: ["family-equity"],
    tags: ["title", "family", "starter"],
    durationLabel: "Planned",
    listenHref: null,
  },
  {
    id: "ep-credit-first-home",
    title: "Credit, income, and your first serious offer",
    summary:
      "How underwriters read stability versus hustle, what “compensating factors” mean in practice, and how to time a pre-approval so it still counts at offer.",
    topics: ["Credit", "First purchase"],
    pathwaySlugs: ["new-ownership"],
    tags: ["credit", "mortgage", "first deal"],
    durationLabel: "Planned",
    listenHref: null,
  },
  {
    id: "ep-partition-risk",
    title: "Partition pressure: stories from the field",
    summary:
      "Why partition sales still show up in land-loss conversations, how families buy time, and when settlement or buyout beats a courtroom clock.",
    topics: ["Partition", "Land retention"],
    pathwaySlugs: ["family-equity"],
    tags: ["risk", "legal", "stories"],
    durationLabel: "Planned",
    listenHref: null,
  },
  {
    id: "ep-layering-capital",
    title: "Layering grants, donors, and patient capital on one site",
    summary:
      "A capital-stack mindset for small developers: what each source needs to hear, what documentation kills momentum, and how to keep community governance in the loop.",
    topics: ["Funding", "Partnerships"],
    pathwaySlugs: ["community-revitalization", "new-ownership"],
    tags: ["capital", "grants", "P3"],
    durationLabel: "Planned",
    listenHref: null,
  },
  {
    id: "ep-lrt-site-visit",
    title: "On site with LRT: from dirt to dry-in",
    summary:
      "A field-style episode on sequencing inspections, municipal holds, and contractor coordination—plus what neighbors should see at each milestone.",
    topics: ["Development process", "Construction"],
    pathwaySlugs: ["community-revitalization"],
    tags: ["LRT", "site visit", "construction"],
    durationLabel: "Planned",
    listenHref: null,
  },
  {
    id: "ep-entity-basics",
    title: "LLC or not yet? Entity questions new owners actually ask",
    summary:
      "Separating personal risk from rental experiments, when a single-member LLC helps, insurance as the real first shield, and habits your CPA will love.",
    topics: ["Entities", "Risk"],
    pathwaySlugs: ["new-ownership", "family-equity"],
    tags: ["LLC", "bookkeeping", "starters"],
    durationLabel: "Planned",
    listenHref: null,
  },
  {
    id: "ep-hbcu-anchor",
    title: "HBCU anchors and neighborhood power-building",
    summary:
      "Procurement, workforce pipelines, and land-adjacent partnerships—without treating the community as a backdrop for campus expansion.",
    topics: ["HBCU", "Community ownership"],
    pathwaySlugs: ["community-revitalization"],
    tags: ["anchor", "workforce", "partnerships"],
    durationLabel: "Planned",
    listenHref: null,
  },
];

export const boardLeadershipVoices: readonly BoardLeadershipVoice[] = [
  {
    id: "board-voice-1",
    name: "",
    boardRole: "Board Chair",
    pathwayFocus: "Community Revitalization & transparency",
    quote:
      "Our job is to make sure donors and neighbors see the same truth on the timeline—dollars, decisions, and dirt.",
    bio:
      "Placeholder profile: add photo, name, and bio. This slot highlights how the board sets guardrails for community development and public trust.",
  },
  {
    id: "board-voice-2",
    name: "",
    boardRole: "Treasurer / Finance Committee",
    pathwayFocus: "New Ownership & fiscal discipline",
    quote:
      "We teach ownership when the numbers are legible—people should not have to guess if a project is real.",
    bio:
      "Placeholder profile: add finance leader story—why they care about first-time buyers, small developers, and clean books for every project.",
  },
  {
    id: "board-voice-3",
    name: "",
    boardRole: "Governance & policy liaison",
    pathwayFocus: "Family Equity & heirs property awareness",
    quote:
      "Policy is personal when it touches land your grandmother paid taxes on for decades.",
    bio:
      "Placeholder profile: add voice focused on heirs property education, legal partnerships, and keeping families in the driver’s seat.",
  },
  {
    id: "board-voice-4",
    name: "",
    boardRole: "Programs & school oversight",
    pathwayFocus: "All pathways — curriculum + podcast integrity",
    quote:
      "If the school does not feel like the community’s living room, we missed.",
    bio:
      "Placeholder profile: add board member overseeing Equity & Ownership School quality, instructor standards, and learner dignity.",
  },
];
