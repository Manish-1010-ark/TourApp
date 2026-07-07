import { UserPlus, Bell, Share2, Info } from "lucide-react";
import { useMockData } from "../../hooks/useMockData";
import { NOTIFICATIONS } from "../../data/mockUserDashboardData";
import SectionCard from "./SectionCard";
import { SkeletonLine } from "./Skeleton";

const TYPE_META = {
  friend_request: { icon: UserPlus, color: "var(--color-primary)" },
  trip_reminder: { icon: Bell, color: "var(--color-cta)" },
  shared_trip: { icon: Share2, color: "var(--color-secondary)" },
  system: { icon: Info, color: "var(--color-body)" },
};

export default function NotificationsList() {
  const { data, loading } = useMockData(NOTIFICATIONS, 1000);

  return (
    <SectionCard eyebrow="Stay Updated" title="Notifications">
      <div className="space-y-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonLine width="2rem" height="2rem" />
                <SkeletonLine width={i % 2 === 0 ? "70%" : "50%"} />
              </div>
            ))
          : data.map((note) => {
              const meta = TYPE_META[note.type] || TYPE_META.system;
              const Icon = meta.icon;
              return (
                <div key={note.id} className="flex items-start gap-3">
                  <span
                    className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
                    style={{ backgroundColor: `${meta.color}1A` }}
                  >
                    <Icon size={15} style={{ color: meta.color }} />
                  </span>
                  <div>
                    <p className="text-sm text-[var(--color-headings)]">{note.message}</p>
                    <p className="text-xs text-[var(--color-body)]">{note.time}</p>
                  </div>
                </div>
              );
            })}
      </div>
    </SectionCard>
  );
}