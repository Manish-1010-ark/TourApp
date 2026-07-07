import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser, isDeveloper } from "../../services/authService";

// Wrap any <Route element={...}> with this to make it developer-only.
// While we check the session we show a tiny loading state, then either
// render the page (developer) or bounce the person back to the user
// dashboard (everyone else) — so typing the URL manually doesn't work.
export default function DeveloperRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    getCurrentUser().then(({ data }) => {
      if (!active) return;
      setAllowed(isDeveloper(data?.user));
      setChecking(false);
    });

    return () => {
      active = false;
    };
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[var(--color-body)] bg-[var(--color-bg)]">
        Checking access…
      </div>
    );
  }

  return allowed ? children : <Navigate to="/trip-prep" replace />;
}