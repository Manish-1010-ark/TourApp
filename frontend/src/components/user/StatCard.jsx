import { SkeletonLine } from "./Skeleton";

export default function StatCard({ icon: Icon, label, value, loading }) {
  return (
    <div className="p-6 card-elevation">
      <span className="flex items-center justify-center w-10 h-10 mb-5 rounded-2xl bg-[var(--color-primary)]/10">
        <Icon size={18} className="text-[var(--color-primary)]" />
      </span>

      <span className="block mb-2 text-xs font-semibold tracking-[0.12em] text-[var(--color-body)] uppercase font-mono-tag">
        {label}
      </span>

      {loading ? (
        <SkeletonLine width="50%" height="1.75rem" />
      ) : (
        <span className="text-3xl font-extrabold font-display text-[var(--color-headings)]">
          {value}
        </span>
      )}
    </div>
  );
}