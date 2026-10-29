import type { LaunchSource } from "@/lib/types";

export function SourceLabel({ source, claimed }: { source: LaunchSource; claimed: boolean }) {
  const byMaker = source === "maker" || claimed;
  return (
    <span className="text-muted">
      {byMaker ? "Posted by the maker" : "Added by Ghanamaxxing"}
    </span>
  );
}
