import { Compass } from "lucide-react";
import { useMockData } from "../../hooks/useMockData";
import { RECENTLY_VIEWED_DESTINATIONS } from "../../data/mockUserDashboardData";
import SectionCard from "./SectionCard";
import { SkeletonLine } from "./Skeleton";

export default function RecentlyViewedDestinations() {
  const { data, loading } = useMockData(RECENTLY_VIEWED_DESTINATIONS, 900);

  return (
    <SectionCard eyebrow="Browsing History" title="Recently Viewed Destinations">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-black/[0.02]">
                <SkeletonLine width="2.25rem" height="2.25rem" />
                <SkeletonLine width="60%" />
              </div>
            ))
          : data.map((dest) => (
              <div
                key={dest.name}
                className="flex items-center gap-3 p-3 transition rounded-2xl bg-black/[0.02] hover:bg-black/[0.04]"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 shrink-0">
                  <Compass size={16} className="text-[var(--color-primary)]" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate text-[var(--color-headings)]">
                    {dest.name}
                  </p>
                  <p className="text-xs text-[var(--color-body)]">Viewed {dest.viewedAgo}</p>
                </div>
              </div>
            ))}
      </div>
    </SectionCard>
  );
}