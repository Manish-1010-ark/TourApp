import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Users,
  Bookmark,
  Share2,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "../../services/authService";

// Nav items are visual/state-only for now — Profile is the only screen that
// exists today. Once Friends/Saved Trips/Shared Trips/Settings get their
// own routes, swap the onClick below for real <Link to="..."> navigation.
const NAV_ITEMS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "friends", label: "Friends", icon: Users },
  { key: "saved", label: "Saved Trips", icon: Bookmark },
  { key: "shared", label: "Shared Trips", icon: Share2 },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [active, setActive] = useState("profile");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate("/");
  };

  const NavLink = ({ item }) => {
    const Icon = item.icon;
    const isActive = active === item.key;
    return (
      <button
        type="button"
        onClick={() => {
          setActive(item.key);
          setMobileOpen(false);
        }}
        className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl text-sm font-semibold transition ${
          isActive
            ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
            : "text-[var(--color-body)] hover:bg-black/5"
        }`}
      >
        <Icon size={18} />
        {item.label}
      </button>
    );
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b lg:hidden bg-[var(--color-card)] border-black/5">
        <span className="text-lg font-black tracking-wide font-display text-[var(--color-headings)]">
          Traviora
        </span>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 rounded-xl hover:bg-black/5"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <aside
        className={`
          bg-[var(--color-card)] border-r border-black/5 flex-col justify-between
          w-full lg:w-64 lg:flex lg:sticky lg:top-0 lg:h-screen
          ${mobileOpen ? "flex" : "hidden"}
        `}
      >
        <div className="p-5">
          <div className="hidden mb-8 lg:block">
            <span className="text-xl font-black tracking-wide font-display text-[var(--color-headings)]">
              Traviora
            </span>
            <span className="block mt-1 text-xs font-semibold tracking-[0.15em] text-[var(--color-cta)] uppercase font-mono-tag">
              My Dashboard
            </span>
          </div>

          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.key} item={item} />
            ))}
          </nav>
        </div>

        <div className="p-5 border-t border-black/5">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center w-full gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 transition disabled:opacity-60"
          >
            <LogOut size={18} />
            {signingOut ? "Signing out…" : "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}