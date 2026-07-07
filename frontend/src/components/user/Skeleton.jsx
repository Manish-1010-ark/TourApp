// Same idea as the developer dashboard's skeletons, restyled for the light
// theme (bg-black/5 instead of white/10).

export function SkeletonLine({ width = "100%", height = "0.85rem" }) {
  return (
    <div className="rounded-md bg-black/5 animate-pulse" style={{ width, height }} />
  );
}

export function SkeletonBlock({ height = "5rem" }) {
  return (
    <div className="w-full rounded-xl bg-black/5 animate-pulse" style={{ height }} />
  );
}

export function SkeletonCircle({ size = "2.5rem" }) {
  return (
    <div
      className="rounded-full bg-black/5 animate-pulse shrink-0"
      style={{ width: size, height: size }}
    />
  );
}