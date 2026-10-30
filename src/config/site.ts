export const SITE = {
  name: "Ghanamaxxing",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "A place to discover and back the apps and startups coming out of Ghana. Say ayekoo to the ones you love and find the builders on the map.",
  contactEmail: "theteam@augustwheel.com",
  /** Google Analytics 4 measurement ID. */
  googleAnalyticsId: "G-745YHYCMWY",
  nav: [
    { href: "/launches", label: "Explore" },
    { href: "/map", label: "Map" },
    { href: "/submit", label: "Add yours" },
  ],
  footer: [
    { href: "/about", label: "About" },
    { href: "/remove", label: "Remove a listing" },
    { href: "/contact", label: "Contact" },
  ],
} as const;
