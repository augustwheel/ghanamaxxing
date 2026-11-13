"use client";

import { useSearchParams } from "next/navigation";
import { CediBandHero } from "@/components/cedi/cedi-band-hero";
import { CediPairHero } from "@/components/cedi/cedi-pair-hero";

// /lab/cedi shows the band (?theme=dark for the dark one); /lab/cedi?v=pair shows the girl and boy version.
export function CediLab() {
  const params = useSearchParams();
  if (params.get("v") === "pair") return <CediPairHero />;
  return <CediBandHero theme={params.get("theme") === "dark" ? "dark" : "light"} />;
}
