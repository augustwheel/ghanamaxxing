import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Logos and screenshots come from Supabase Storage or makers' own sites.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Admin uploads (logo + screenshot up to 2 MB each, import files up to 2 MB).
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;
