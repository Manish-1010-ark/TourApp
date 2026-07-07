import { Pencil } from "lucide-react";
import { SkeletonCircle, SkeletonLine } from "./Skeleton";

export default function ProfileCard({ profile, loading, onEditProfile }) {
  const initials = profile?.name
    ?.split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col items-start justify-between gap-6 p-6 card-elevation sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        {loading ? (
          <SkeletonCircle size="4rem" />
        ) : (
          <span className="flex items-center justify-center text-xl font-bold text-white rounded-full w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]">
            {initials || "TR"}
          </span>
        )}

        <div>
          {loading ? (
            <>
              <SkeletonLine width="10rem" height="1.25rem" />
              <div className="mt-2">
                <SkeletonLine width="8rem" />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold font-display text-[var(--color-headings)]">
                {profile.name}
              </h2>
              <p className="text-sm text-[var(--color-body)]">{profile.email}</p>
              <p className="mt-1 text-xs text-[var(--color-body)]">
                Member since {profile.memberSince}
              </p>
            </>
          )}
        </div>
      </div>

      <button type="button" onClick={onEditProfile} className="flex items-center gap-2 btn-secondary shrink-0">
        <Pencil size={15} />
        Edit Profile
      </button>
    </div>
  );
}