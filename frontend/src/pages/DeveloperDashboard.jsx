import { useEffect, useState } from "react";
import { Users, Route, Search, Activity } from "lucide-react";

import { getCurrentUser } from "../services/authService";
import { useGlobalStyles } from "../hooks/useGlobalStyles";
import { useMockData } from "../hooks/useMockData";
import { KPI_DATA } from "../data/mockDashboardData";

import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import KpiCard from "../components/dashboard/KpiCard";
import MostSearchedDestinations from "../components/dashboard/MostSearchedDestinations";
import PopularInterests from "../components/dashboard/PopularInterests";
import AIUsageStatistics from "../components/dashboard/AIUsageStatistics";
import RecentActivity from "../components/dashboard/RecentActivity";

// Maps a KPI's id (from mockDashboardData) to the icon shown on its card.
// Kept separate from the data file so the data stays framework-agnostic —
// swapping in real numbers later never touches this file.
const KPI_ICONS = {
  "total-users": Users,
  "total-itineraries": Route,
  "total-searches": Search,
  "active-today": Activity,
};

export default function DeveloperDashboard() {
  useGlobalStyles();

  const [user, setUser] = useState(null);
  const { data: kpis, loading: kpisLoading } = useMockData(KPI_DATA, 600);

  // Real session data for the profile chip in the navbar — this part isn't
  // mocked since getCurrentUser() already works today.
  useEffect(() => {
    let active = true;
    getCurrentUser().then(({ data }) => {
      if (active) setUser(data?.user ?? null);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen font-body text-[var(--color-body)] bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-bg-secondary)]">
      <DashboardNavbar user={user} />

      <main className="px-6 py-10 mx-auto max-w-7xl">
        <div className="mb-8">
          <span className="block mb-2 text-xs font-semibold tracking-[0.15em] text-[var(--color-cta)] uppercase font-mono-tag">
            Overview
          </span>
          <h1 className="text-3xl font-extrabold sm:text-4xl font-display">
            Product Analytics
          </h1>
          <p className="mt-2 text-sm text-[var(--color-body)]">
            Mock data for now — this will read from live backend analytics once
            they're wired up.
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          {(kpisLoading ? KPI_DATA : kpis).map((kpi) => (
            <KpiCard
              key={kpi.id}
              icon={KPI_ICONS[kpi.id]}
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
              trend={kpi.trend}
              loading={kpisLoading}
            />
          ))}
        </div>

        {/* Placeholder analytics sections — each fetches (mock) data independently */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <MostSearchedDestinations />
          <PopularInterests />
          <AIUsageStatistics />
          <RecentActivity />
        </div>
      </main>
    </div>
  );
}