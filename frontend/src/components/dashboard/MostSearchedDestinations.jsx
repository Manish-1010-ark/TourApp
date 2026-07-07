import { useMockData } from "../../hooks/useMockData";
import { DESTINATIONS_DATA } from "../../data/mockDashboardData";
import SectionCard from "./SectionCard";
import { SkeletonLine } from "./Skeleton";

export default function MostSearchedDestinations() {
  const { data, loading } = useMockData(DESTINATIONS_DATA, 900);

  return (
    <SectionCard eyebrow="Search Volume" title="Most Searched Destinations">
      <div className="space-y-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <SkeletonLine width="40%" />
                <SkeletonLine width="100%" height="0.5rem" />
              </div>
            ))
          : data.map((dest) => (
              <div key={dest.name}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-[var(--color-headings)]">
                      {dest.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono-tag">
                      {dest.coords}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-body)] font-mono-tag">
                    {dest.searches.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-secondary)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
                    style={{ width: `${dest.share}%` }}
                  />
                </div>
              </div>
            ))}
      </div>
    </SectionCard>
  );
}
