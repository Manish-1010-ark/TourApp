import { useNavigate } from "react-router-dom";
import { Plus, Bookmark, Users, Share2, Pencil } from "lucide-react";
import SectionCard from "./SectionCard";

// Every action here does something visible when clicked: real routes where
// they exist today, and a toast (via onPlaceholderAction) for the features
// that aren't built yet — never a silent no-op.
export default function QuickActions({ onPlaceholderAction }) {
  const navigate = useNavigate();

  const actions = [
    {
      key: "create-trip",
      label: "Create Trip",
      icon: Plus,
      onClick: () => navigate("/trip-configuration"),
    },
    {
      key: "saved-trips",
      label: "Saved Trips",
      icon: Bookmark,
      onClick: () => onPlaceholderAction("Saved Trips isn't wired up yet — coming soon!"),
    },
    {
      key: "friends",
      label: "Friends",
      icon: Users,
      onClick: () => onPlaceholderAction("Friends isn't wired up yet — coming soon!"),
    },
    {
      key: "share-itinerary",
      label: "Share Itinerary",
      icon: Share2,
      onClick: () => onPlaceholderAction("Sharing isn't wired up yet — coming soon!"),
    },
    {
      key: "edit-profile",
      label: "Edit Profile",
      icon: Pencil,
      onClick: () => onPlaceholderAction("Edit Profile isn't wired up yet — coming soon!"),
    },
  ];

  return (
    <SectionCard eyebrow="Get Things Done" title="Quick Actions">
      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ key, label, icon: Icon, onClick }) => (
          <button
            key={key}
            type="button"
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-2 py-4 text-xs font-semibold text-center transition rounded-2xl bg-black/[0.02] text-[var(--color-headings)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] active:scale-[0.97]"
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>
    </SectionCard>
  );
}