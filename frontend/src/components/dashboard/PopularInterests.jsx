import { useMockData } from "../../hooks/useMockData";
import { INTERESTS_DATA } from "../../data/mockDashboardData";
import SectionCard from "./SectionCard";
import { SkeletonPill } from "./Skeleton";

export default function PopularInterests() {
  const { data, loading } = useMockData(INTERESTS_DATA, 1100);

  const maxCount = !loading && data.length ? Math.max(...data.map((i) => i.count)) : 1;

  return (
    <SectionCard eyebrow="Traveler Preferences" title="Popular Interests">
      <div className="flex flex-wrap gap-2.5">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <SkeletonPill key={i} width={`${4 + (i % 3) * 1.2}rem`} />
            ))
          : data.map((interest) => {
              const intensity = interest.count / maxCount;
              return (
                <span
                  key={interest.name}
                  className="flex items-center gap-2 px-3.5 py-1.5 text-sm font-semibold text-white border rounded-full border-amber-300/40 shadow-sm"
                  style={{ backgroundColor: `rgba(245, 158, 11, ${0.45 + intensity * 0.4})` }}
                >
                  {interest.name}
                  <span className="text-xs font-normal text-white/80 font-mono-tag">
                    {interest.count.toLocaleString()}
                  </span>
                </span>
              );
            })}
      </div>
    </SectionCard>
  );
}