import type { Metadata } from "next";
import { Suspense } from "react";
import { CediLab } from "./cedi-lab";

// A trial of the cedi hero, kept off the home page and out of search until it's chosen.
export const metadata: Metadata = { title: "Cedi hero (lab)", robots: { index: false, follow: false } };

export default function CediLabPage() {
  return (
    <Suspense>
      <CediLab />
    </Suspense>
  );
}
