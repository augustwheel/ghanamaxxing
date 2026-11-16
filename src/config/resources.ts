export type Guide = {
  title: string;
  description: string;
  href: string;
  publishedAt: string;
  readingTime: string;
};

export const GUIDES: Guide[] = [
  {
    title: "Getting ready to seek investment in Ghana",
    description: "Build evidence, work out what support you need, and get the basics in order before reaching out.",
    href: "/resources/getting-ready-for-investment-in-ghana",
    publishedAt: "2026-11-16T10:00:00Z",
    readingTime: "5 minute read",
  },
  {
    title: "How to prepare to meet an investor",
    description: "What to bring, what to explain, and what to ask when someone wants to hear about your app or startup.",
    href: "/resources/prepare-to-meet-an-investor",
    publishedAt: "2026-11-16T09:00:00Z",
    readingTime: "4 minute read",
  },
];

export const NEWEST_GUIDES = [...GUIDES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export type DirectoryEntry = {
  name: string;
  description: string;
  url: string;
  location: string;
};

export type DirectorySection = {
  id: string;
  title: string;
  intro: string;
  entries: DirectoryEntry[];
};

export const DIRECTORY: DirectorySection[] = [
  {
    id: "communities",
    title: "Communities",
    intro: "Meet other makers, learn from their work and find local gatherings.",
    entries: [
      { name: "Impact Hub Accra", description: "An Accra community and programmes for entrepreneurs working on social change.", url: "https://accra.impacthub.net/", location: "Accra" },
      { name: "Startup Grind Accra", description: "The Accra chapter of a founder community, with gatherings listed on its own site.", url: "https://www.startupgrind.com/Accra/", location: "Accra" },
      { name: "StartUpGh", description: "A Ghanaian startup ecosystem organisation sharing events, programmes and opportunities.", url: "https://startupgh.org/", location: "Ghana" },
    ],
  },
  {
    id: "programmes",
    title: "Programmes and networks",
    intro: "Places to look for training, incubation and founder connections.",
    entries: [
      { name: "MEST", description: "Accra based entrepreneurship training, incubation and early stage support. Check the current programme before applying.", url: "https://meltwater.org/", location: "Accra · Africa" },
      { name: "VC4A Ghana", description: "A Ghana entry point to VC4A's wider African startup network and opportunities.", url: "https://vc4a.com/ghana/", location: "Ghana · Africa" },
    ],
  },
  {
    id: "investors",
    title: "Investors and investor networks",
    intro: "Read each organisation's focus and process before making contact.",
    entries: [
      { name: "Ghana Angel Investor Network", description: "A Venture Capital Trust Fund initiative connecting early stage Ghanaian businesses with angel investors.", url: "https://venturecapitalghana.com.gh/operations/gain/", location: "Ghana" },
      { name: "Ibexx Venture Capital", description: "An Accra based investor that says it seeks early stage technology businesses in sectors including finance, health, housing and agriculture.", url: "https://www.ibexx.ai/about", location: "Accra · Africa" },
    ],
  },
  {
    id: "public-support",
    title: "Public support",
    intro: "Government backed places to check for business support and funding routes.",
    entries: [
      { name: "Ghana Enterprises Agency", description: "Programmes and grant information for Ghanaian businesses. Eligibility varies; some grants exclude new startups.", url: "https://gea.gov.gh/", location: "Ghana" },
      { name: "YouStart", description: "A Government of Ghana entrepreneurship initiative with information on its programme page.", url: "https://gea.gov.gh/youstart/", location: "Ghana" },
      { name: "Venture Capital Trust Fund", description: "A government backed fund of funds and ecosystem organisation. It works through fund managers rather than taking every founder pitch directly.", url: "https://venturecapitalghana.com.gh/about-us/", location: "Ghana" },
    ],
  },
];
