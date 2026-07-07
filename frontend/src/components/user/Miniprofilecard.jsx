import { Pencil } from "lucide-react";
import { SkeletonCircle, SkeletonLine } from "./Skeleton";

export default function MiniProfileCard({ profile, loading, onEditProfile }) {
  const initials = profile?.name
    ?.split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="p-6 text-center card-elevation">
      {loading ? (
        <SkeletonCircle size="4rem" />
      ) : (
        <span className="flex items-center justify-center mx-auto text-xl font-bold text-white rounded-full w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]">
          {initials || "TR"}
        </span>
      )}

      <div className="mt-4">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <SkeletonLine width="8rem" />
            <SkeletonLine width="10rem" height="0.7rem" />
          </div>
        ) : (
          <>
            <h3 className="text-base font-bold font-display text-[var(--color-headings)]">
              {profile.name}
            </h3>
            <p className="text-xs text-[var(--color-body)]">{profile.email}</p>
            <p className="mt-1 text-xs text-[var(--color-body)]">
              Member since {profile.memberSince}
            </p>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onEditProfile}
        className="flex items-center gap-2 mx-auto mt-5 btn-secondary"
      >
        <Pencil size={14} />
        Edit Profile
      </button>
    </div>
  );
}