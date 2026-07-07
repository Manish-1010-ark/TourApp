import { CalendarDays, MapPinned, Clock3, Sun } from "lucide-react";
import { useMockData } from "../../hooks/useMockData";
import { TRAVEL_STATS } from "../../data/mockUserDashboardData";
import SectionCard from "./SectionCard";
import { SkeletonBlock } from "./Skeleton";

const STAT_META = [
  { key: "statesExplored", label: "States Explored", icon: MapPinned },
  { key: "avgTripLength", label: "Avg. Trip Length", icon: Clock3 },
  { key: "longestTrip", label: "Longest Trip", icon: CalendarDays },
  { key: "favoriteSeason", label: "Favorite Season", icon: Sun },
];

export default function TravelStatistics() {
  const { data, loading } = useMockData(TRAVEL_STATS, 800);

  return (
    <SectionCard eyebrow="Your Journey" title="Travel Statistics">
      <div className="grid grid-cols-2 gap-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} height="4.25rem" />
            ))
          : STAT_META.map(({ key, label, icon: Icon }) => (
              <div key={key} className="p-3 rounded-2xl bg-black/[0.02]">
                <Icon
                  size={15}
                  className="mb-1.5 text-[var(--color-primary)]"
                />
                <p className="text-base font-extrabold font-display text-[var(--color-headings)]">
                  {data[key]}
                </p>
                <p className="text-[11px] text-[var(--color-body)]">{label}</p>
              </div>
            ))}
      </div>
    </SectionCard>
  );
}
