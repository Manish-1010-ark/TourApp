import { Calendar } from "lucide-react";
import { useMockData } from "../../hooks/useMockData";
import { UPCOMING_TRIPS } from "../../data/mockUserDashboardData";
import SectionCard from "./SectionCard";
import { SkeletonLine } from "./Skeleton";

export default function UpcomingTrips() {
  const { data, loading } = useMockData(UPCOMING_TRIPS, 850);

  return (
    <SectionCard eyebrow="Coming Up" title="Upcoming Trips">
      <div className="space-y-3">
        {loading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-black/[0.02] space-y-2"
              >
                <SkeletonLine width="45%" />
                <SkeletonLine width="65%" height="0.7rem" />
              </div>
            ))
          : data.map((trip) => (
              <div
                key={trip.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-black/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--color-cta)]/10 shrink-0">
                    <Calendar size={16} className="text-[var(--color-cta)]" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-headings)]">
                      {trip.destination}
                    </p>
                    <p className="text-xs text-[var(--color-body)]">
                      {trip.dateRange}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold font-mono-tag text-[var(--color-primary)] shrink-0">
                  {trip.daysLeft}d left
                </span>
              </div>
            ))}
      </div>
    </SectionCard>
  );
}
