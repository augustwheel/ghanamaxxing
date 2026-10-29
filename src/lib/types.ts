import type { LaunchType } from "@/config/launch-types";

export type LaunchSource = "ghanamaxxing" | "maker";
export type LaunchStatus = "pending" | "approved" | "rejected" | "removed";

export type MakerSocials = Partial<Record<"x" | "instagram" | "linkedin" | "github" | "tiktok" | "website", string>>;

export type Launch = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string | null;
  url: string;
  logo_url: string | null;
  image_url: string | null;
  type: LaunchType;
  city: string | null;
  lat: number | null;
  lng: number | null;
  maker_name: string | null;
  maker_socials: MakerSocials;
  source: LaunchSource;
  status: LaunchStatus;
  claimed_by: string | null;
  launched_at: string | null;
  star_count: number;
  created_at: string;
};
