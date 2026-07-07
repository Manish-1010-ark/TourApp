import { Bot, CheckCircle2, Clock, Zap } from "lucide-react";
import { useMockData } from "../../hooks/useMockData";
import { AI_USAGE_DATA } from "../../data/mockDashboardData";
import SectionCard from "./SectionCard";
import { SkeletonBlock } from "./Skeleton";

const STAT_META = [
  { key: "itinerariesToday", label: "Itineraries Today", icon: Zap },
  { key: "avgGenerationTime", label: "Avg. Generation Time", icon: Clock },
  { key: "successRate", label: "Success Rate", icon: CheckCircle2 },
  { key: "activeSessions", label: "Active AI Sessions", icon: Bot },
];

export default function AIUsageStatistics() {
  const { data, loading } = useMockData(AI_USAGE_DATA, 700);

  return (
    <SectionCard eyebrow="Model Activity" title="AI Usage Statistics">
      <div className="grid grid-cols-2 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} height="4.5rem" />)
          : STAT_META.map(({ key, label, icon: Icon }) => (
              <div
                key={key}
                className="p-4 rounded-2xl bg-[var(--color-bg-secondary)]"
              >
                <Icon size={16} className="mb-2 text-[var(--color-primary)]" />
                <p className="text-xl font-extrabold text-[var(--color-headings)] font-display">{data[key]}</p>
                <p className="text-xs text-[var(--color-body)]">{label}</p>
              </div>
            ))}
      </div>
    </SectionCard>
  );
}