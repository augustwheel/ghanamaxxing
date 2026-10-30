import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a production build run alongside `npm run dev` without clobbering its .next folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    // Only our own files and Supabase Storage go through the optimiser, so it can't be used as an
    // open image proxy. Images on makers' own sites load directly (see isOptimizable).
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? [{ protocol: "https", hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname }]
      : [],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Admin uploads (logo + screenshot up to 2 MB each, import files up to 2 MB).
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;
