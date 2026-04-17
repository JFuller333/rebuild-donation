export type SchoolModule = {
  id: string;
  title: string;
  summary: string;
};

export type SchoolPathway = {
  slug: string;
  title: string;
  subtitle: string;
  lane: string;
  moduleCount: number;
  transformation: string;
  modules: SchoolModule[];
  podcast: readonly string[];
};

export const schoolPathways: readonly SchoolPathway[] = [
  {
    slug: "family-equity",
    title: "Family Equity Path",
    subtitle: "For people who already have property but no structure",
    lane: "Heirs property / legacy lane",
    moduleCount: 6,
    transformation: "From confusion → clarity → coordination → preserved ownership",
    modules: [
      {
        id: "family-equity-m1",
        title: "What is heirs property (real explanation)",
        summary:
          "Cut through myths and fear: what heirs property is, why it is common in Black and rural land stories, and how it differs from “bad title.” You leave with language you can use with relatives and professionals.",
      },
      {
        id: "family-equity-m2",
        title: "Understanding title & deeds",
        summary:
          "How deeds, chains of title, and clouds on title show up in real life. Learn what to request, how to read a preliminary title report at a high level, and when to escalate to an attorney.",
      },
      {
        id: "family-equity-m3",
        title: "Common ownership breakdowns",
        summary:
          "Fractional interest, partition risk, and silent co-owners—mapped simply. See how small disagreements become legal exposure so the family can prioritize what to fix first.",
      },
      {
        id: "family-equity-m4",
        title: "Family communication & alignment",
        summary:
          "Facilitation patterns for hard land conversations: who speaks for the family, how to document consensus, and how to slow down rash sales or sign-away moments.",
      },
      {
        id: "family-equity-m5",
        title: "Legal & structural options (LLCs, agreements)",
        summary:
          "Survey of structures families use to consolidate decision-making—without losing the story of the land. Compare operating agreements, trusts, and sale restrictions at a conceptual level.",
      },
      {
        id: "family-equity-m6",
        title: "Tax, risk awareness & transitioning to structured ownership",
        summary:
          "Property tax, liens, and carrying costs as part of strategy—not surprises. Outline a path from informal co-ownership toward clearer, defensible structure with professional partners.",
      },
    ],
    podcast: [
      "Real family stories",
      "Land loss scenarios",
      "Conflict resolution conversations",
    ],
  },
  {
    slug: "new-ownership",
    title: "New Ownership Path",
    subtitle: "For people starting from zero or close to it",
    lane: "Foundation builder lane",
    moduleCount: 6,
    transformation: "From no ownership → first asset → repeatable strategy",
    modules: [
      {
        id: "new-ownership-m1",
        title: "Ownership mindset (consumer → owner)",
        summary:
          "Shift from paycheck-only thinking to balance-sheet thinking: assets vs. liabilities, risk as something to design, and why small, boring steps beat hero deals.",
      },
      {
        id: "new-ownership-m2",
        title: "Credit & financial foundation",
        summary:
          "Credit as access, not vanity scores. Budgets that fund opportunity accounts, debt triage, and how lenders actually read an application for a first home or small rental.",
      },
      {
        id: "new-ownership-m3",
        title: "Income & capital strategy",
        summary:
          "Stack income, side capital, and patient money. Compare W-2, 1099, business income, and gift/legacy resources—and how each changes what you can realistically buy.",
      },
      {
        id: "new-ownership-m4",
        title: "First property strategy (home, land, investment)",
        summary:
          "Pick a first lane: househack, duplex, small land, or owner-occupied flip-to-rent. Criteria for “good enough” first deals versus fantasy projects that stall beginners.",
      },
      {
        id: "new-ownership-m5",
        title: "Understanding deals",
        summary:
          "Offer, inspection, appraisal, and closing in plain English. How to read a settlement statement, what “creative” structures require extra counsel, and red flags in rushed contracts.",
      },
      {
        id: "new-ownership-m6",
        title: "Entity setup & your first ownership stack",
        summary:
          "When an LLC or holding structure helps, when it is overkill, and how insurance fits. Build a simple stack: personal residence or first rental + bookkeeping rhythm + annual review.",
      },
    ],
    podcast: ["Beginner mistakes", "First deal breakdowns", "Mindset conversations"],
  },
  {
    slug: "community-revitalization",
    title: "Community Revitalization Path",
    subtitle: "For builders, leaders, and developers",
    lane: "LRT / ecosystem lane",
    moduleCount: 7,
    transformation: "From individual thinking → community-scale ownership & development",
    modules: [
      {
        id: "community-revitalization-m1",
        title: "What is community ownership?",
        summary:
          "Models where residents, nonprofits, or cooperatives hold equity or long-term control—not just consultation. Compare CLTs, co-ops, civic anchors, and mixed-income partnerships.",
      },
      {
        id: "community-revitalization-m2",
        title: "HBCU community dynamics",
        summary:
          "How anchor institutions interact with land, workforce, and town-gown tension. Ways to align student talent, research, and procurement with neighborhood wealth goals.",
      },
      {
        id: "community-revitalization-m3",
        title: "Land acquisition for development",
        summary:
          "Sourcing sites: public RFPs, private owners, land banks, and assemblage. Due diligence checklists for environmental, title, and political feasibility before design spend.",
      },
      {
        id: "community-revitalization-m4",
        title: "Funding & partnerships (grants, donors, investors)",
        summary:
          "Layer capital: philanthropy for risk, public subsidies for gap, and private capital for scale. How to narrate a project so each partner sees their piece honestly.",
      },
      {
        id: "community-revitalization-m5",
        title: "Development process (concept → construction)",
        summary:
          "Milestones from vision session through entitlements, design, bidding, and turnover. Where projects die—and how community governance threads through each gate.",
      },
      {
        id: "community-revitalization-m6",
        title: "Legal & governance structures",
        summary:
          "Boards, development LLCs, public-private agreements, and resident covenants. Enough vocabulary to sit at the table with counsel and not fly blind.",
      },
      {
        id: "community-revitalization-m7",
        title: "Building sustainable ecosystems",
        summary:
          "Beyond one building: property management, local hiring, vendor diversity, and reinvestment loops. Design for permanence so the neighborhood still wins after the ribbon-cutting.",
      },
    ],
    podcast: ["LRT development journey", "Partnerships", "Funding conversations", "Real-time project updates"],
  },
] as const;

export function pathwayBySlug(slug: string): SchoolPathway | undefined {
  return schoolPathways.find((p) => p.slug === slug);
}
