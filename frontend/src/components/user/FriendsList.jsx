import { useMockData } from "../../hooks/useMockData";
import { FRIENDS_LIST } from "../../data/mockUserDashboardData";
import SectionCard from "./SectionCard";
import { SkeletonCircle, SkeletonLine } from "./Skeleton";

export default function FriendsList() {
  const { data, loading } = useMockData(FRIENDS_LIST, 950);

  return (
    <SectionCard eyebrow="Your Circle" title="Friends">
      <div className="space-y-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonCircle size="2.5rem" />
                <SkeletonLine width={i % 2 === 0 ? "55%" : "40%"} />
              </div>
            ))
          : data.map((friend) => {
              const initials = friend.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              return (
                <div key={friend.id} className="flex items-center gap-3">
                  <span className="relative flex items-center justify-center w-10 h-10 text-sm font-bold text-white rounded-full shrink-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]">
                    {initials}
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-card)] ${
                        friend.status === "online"
                          ? "bg-[var(--color-success)]"
                          : "bg-gray-300"
                      }`}
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-[var(--color-headings)]">
                      {friend.name}
                    </p>
                    <p className="text-xs text-[var(--color-body)]">
                      {friend.mutualTrips} mutual trip
                      {friend.mutualTrips === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              );
            })}
      </div>
    </SectionCard>
  );
}
