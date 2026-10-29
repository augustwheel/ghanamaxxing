export const SITE = {
  name: "Ghanamaxxing",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "The launch board and live map of what Ghanaians are building. Post your startup, app, side project, AI tool or game, and back the builders you believe in.",
  contactEmail: "hello@ghanamaxxing.com",
  nav: [
    { href: "/launches", label: "Launches" },
    { href: "/map", label: "Map" },
    { href: "/submit", label: "Submit" },
  ],
  footer: [
    { href: "/about", label: "About" },
    { href: "/remove", label: "Remove a listing" },
    { href: "/contact", label: "Contact" },
  ],
} as const;
