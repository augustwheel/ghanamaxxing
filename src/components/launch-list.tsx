"use client";

import { useEffect, useState } from "react";
import { LaunchCard } from "@/components/launch-card";
import type { Launch } from "@/lib/types";

// Renders the server's order first (so the page loads instantly and matches), then reshuffles in
// the browser when `shuffle` is on: a different mix on every visit.
export function LaunchList({ launches, shuffle = false }: { launches: Launch[]; shuffle?: boolean }) {
  const [list, setList] = useState(launches);
  useEffect(() => {
    if (!shuffle) return setList(launches);
    const a = [...launches];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    setList(a);
  }, [launches, shuffle]);
  return (
    <ul className="mt-2 flex flex-col">
      {list.map((launch) => (
        <LaunchCard key={launch.id} launch={launch} />
      ))}
    </ul>
  );
}
