import { MapPin } from "lucide-react";
import { useMockData } from "../../hooks/useMockData";
import { RECENT_ITINERARIES } from "../../data/mockUserDashboardData";
import SectionCard from "./SectionCard";
import { SkeletonLine } from "./Skeleton";

export default function RecentItineraries() {
  const { data, loading } = useMockData(RECENT_ITINERARIES, 800);

  return (
    <SectionCard eyebrow="Your Plans" title="Recent Itineraries">
      <div className="space-y-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-black/[0.02]">
                <SkeletonLine width="2.25rem" height="2.25rem" />
                <SkeletonLine width={i % 2 === 0 ? "60%" : "45%"} />
              </div>
            ))
          : data.map((trip) => (
              <div
                key={trip.id}
                className="flex items-center gap-3 p-3 transition rounded-2xl bg-black/[0.02] hover:bg-black/[0.04]"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--color-secondary)]/10 shrink-0">
                  <MapPin size={16} className="text-[var(--color-secondary)]" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate text-[var(--color-headings)]">
                    {trip.destination}
                  </p>
                  <p className="text-xs text-[var(--color-body)]">
                    {trip.days}-day trip · {trip.createdAt}
                  </p>
                </div>
              </div>
            ))}
      </div>
    </SectionCard>
  );
}