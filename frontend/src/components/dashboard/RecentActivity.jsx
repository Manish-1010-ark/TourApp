import { useMockData } from "../../hooks/useMockData";
import { ACTIVITY_DATA } from "../../data/mockDashboardData";
import SectionCard from "./SectionCard";
import { SkeletonLine } from "./Skeleton";

export default function RecentActivity() {
  const { data, loading } = useMockData(ACTIVITY_DATA, 1300);

  return (
    <SectionCard eyebrow="Live Feed" title="Recent Activity" className="lg:col-span-2">
      <div className="relative pl-6">
        {/* the route line running through every log entry */}
        <div
          aria-hidden="true"
          className="absolute top-1 bottom-1 left-[7px] w-px border-l border-dashed border-amber-300/60"
        />

        <div className="space-y-5">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="relative flex items-start gap-4">
                  <span className="absolute left-[-24px] top-1 w-3.5 h-3.5 rounded-full bg-[var(--color-bg-secondary)]" />
                  <SkeletonLine width={i % 2 === 0 ? "70%" : "55%"} />
                </div>
              ))
            : data.map((entry) => (
                <div key={entry.id} className="relative flex items-start gap-4">
                  <span className="absolute left-[-24px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-[var(--color-cta)] shadow-sm" />
                  <span className="w-12 pt-0.5 text-xs text-slate-400 shrink-0 font-mono-tag">
                    {entry.time}
                  </span>
                  <p className="text-sm text-[var(--color-body)]">
                    <span className="font-semibold text-[var(--color-headings)]">{entry.user}</span>{" "}
                    {entry.action}
                  </p>
                </div>
              ))}
        </div>
      </div>
    </SectionCard>
  );
}