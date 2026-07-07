import { useMockData } from "../../hooks/useMockData";
import { RECENT_ACTIVITY } from "../../data/mockUserDashboardData";
import SectionCard from "./SectionCard";
import { SkeletonLine } from "./Skeleton";

export default function RecentActivityTimeline() {
  const { data, loading } = useMockData(RECENT_ACTIVITY, 1100);

  return (
    <SectionCard eyebrow="Live Feed" title="Recent Activity">
      <div className="relative pl-6">
        <div
          aria-hidden="true"
          className="absolute top-1 bottom-1 left-[7px] w-px border-l border-dashed border-[var(--color-cta)]/40"
        />

        <div className="space-y-5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="relative flex items-start gap-4">
                  <span className="absolute left-[-24px] top-1 w-3.5 h-3.5 rounded-full bg-black/5" />
                  <SkeletonLine width={i % 2 === 0 ? "60%" : "45%"} />
                </div>
              ))
            : data.map((entry) => (
                <div key={entry.id} className="relative flex items-start gap-4">
                  <span className="absolute left-[-24px] top-1 w-3.5 h-3.5 rounded-full border-2 border-[var(--color-card)] bg-[var(--color-cta)]" />
                  <span className="w-16 pt-0.5 text-xs shrink-0 text-[var(--color-body)] font-mono-tag">
                    {entry.time}
                  </span>
                  <p className="text-sm text-[var(--color-headings)]">{entry.action}</p>
                </div>
              ))}
        </div>
      </div>
    </SectionCard>
  );
}