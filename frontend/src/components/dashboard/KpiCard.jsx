import { TrendingDown, TrendingUp } from "lucide-react";
import { SkeletonLine } from "./Skeleton";

export default function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  trend,
  loading,
}) {
  const isUp = trend === "up";

  return (
    <div className="relative overflow-hidden card-elevation rounded-3xl bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[var(--color-bg-secondary)]">
          <Icon size={18} className="text-[var(--color-primary)]" />
        </span>
        {!loading && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold font-mono-tag ${
              isUp ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {delta}
          </span>
        )}
      </div>

      <span className="block mb-2 text-xs font-semibold tracking-[0.12em] text-[var(--color-body)] uppercase font-mono-tag">
        {label}
      </span>

      {loading ? (
        <SkeletonLine width="60%" height="2rem" />
      ) : (
        <span className="text-3xl font-extrabold text-[var(--color-headings)] font-display">
          {value}
        </span>
      )}
    </div>
  );
}