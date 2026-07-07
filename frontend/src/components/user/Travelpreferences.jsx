import { useMockData } from "../../hooks/useMockData";
import { TRAVEL_PREFERENCES } from "../../data/mockUserDashboardData";
import SectionCard from "./SectionCard";
import { SkeletonLine } from "./Skeleton";

export default function TravelPreferences() {
  const { data, loading } = useMockData(TRAVEL_PREFERENCES, 750);

  return (
    <SectionCard eyebrow="What You Love" title="Travel Preferences">
      <div className="flex flex-wrap gap-2">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <SkeletonLine key={i} width={`${4 + (i % 3)}rem`} height="1.75rem" />
            ))
          : data.map((pref) => (
              <span
                key={pref}
                className="px-3 py-1.5 text-xs font-semibold rounded-full text-[var(--color-secondary)] bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/20"
              >
                {pref}
              </span>
            ))}
      </div>
    </SectionCard>
  );
}