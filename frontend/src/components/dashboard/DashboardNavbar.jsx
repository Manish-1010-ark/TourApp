import { useState } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signOut } from "../../services/authService";

// Reads the developer's display name/email from the Supabase user object
// passed in from the page, so the profile chip is real, not hardcoded.
export default function DashboardNavbar({ user }) {
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const name = user?.user_metadata?.full_name || "Developer";
  const email = user?.email || "";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-white/90 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
        <div className="flex items-center gap-3">
          <span className="text-xl font-black tracking-wider text-[var(--color-headings)] font-display">
            Traviora
          </span>
          <span className="hidden px-2.5 py-1 text-xs font-semibold tracking-wider text-[var(--color-cta)] uppercase border rounded-full sm:inline-block border-amber-200 bg-amber-50 font-mono-tag">
            Developer Console
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="items-center hidden gap-3 pr-4 border-r sm:flex border-black/10">
            <span className="flex items-center justify-center w-9 h-9 text-sm font-bold text-white rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]">
              {initials || "DV"}
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold leading-tight text-[var(--color-headings)]">
                {name}
              </p>
              <p className="text-xs leading-tight text-[var(--color-body)]">{email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[var(--color-body)] transition rounded-xl hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-headings)] disabled:opacity-60"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">
              {signingOut ? "Signing out…" : "Sign out"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}