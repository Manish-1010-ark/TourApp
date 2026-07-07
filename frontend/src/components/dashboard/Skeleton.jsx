// Small shimmering placeholder shapes. Every dashboard section reaches for
// these while its data is "loading" — swap nothing here when real data
// arrives, the sections just stop rendering them.

export function SkeletonLine({ width = "100%", height = "0.85rem" }) {
  return (
    <div
      className="rounded-md bg-[var(--color-bg-secondary)] animate-pulse"
      style={{ width, height }}
    />
  );
}

export function SkeletonBlock({ height = "5rem" }) {
  return (
    <div
      className="w-full rounded-xl bg-[var(--color-bg-secondary)] animate-pulse"
      style={{ height }}
    />
  );
}

export function SkeletonPill({ width = "4.5rem" }) {
  return (
    <div
      className="h-7 rounded-full bg-[var(--color-bg-secondary)] animate-pulse"
      style={{ width }}
    />
  );
}