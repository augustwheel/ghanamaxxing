export function LaunchCount({ count }: { count: number }) {
  return (
    <p className="font-display text-sm text-muted">
      <strong className="tabular-nums text-xl font-semibold text-chalk">{count}</strong>{" "}
      {count === 1 ? "app or startup" : "apps and startups"} listed
    </p>
  );
}
