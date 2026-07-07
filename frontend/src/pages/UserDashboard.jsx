import { useEffect, useState } from "react";
import { Route, Bookmark, Share2, Users } from "lucide-react";

import { getCurrentUser } from "../services/authService";
import { useGlobalStyles } from "../hooks/useGlobalStyles";
import { useMockData } from "../hooks/useMockData";
import { useToast } from "../hooks/useToast";
import { USER_PROFILE, USER_STATS } from "../data/mockUserDashboardData";

import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import WelcomeBanner from "../components/user/WelcomeBanner";
import StatCard from "../components/user/StatCard";
import RecentItineraries from "../components/user/RecentItineraries";
import UpcomingTrips from "../components/user/UpcomingTrips";
import RecentlyViewedDestinations from "../components/user/RecentlyViewedDestinations";
import MiniProfileCard from "../components/user/Miniprofilecard";
import TravelPreferences from "../components/user/Travelpreferences";
import TravelStatistics from "../components/user/TravelStatistics";
import QuickActions from "../components/user/Quickactions";
import RecentActivityTimeline from "../components/user/Recentactivitytimeline";
import Toast from "../components/user/Toast";

// Maps a stat's id (from mockUserDashboardData) to its icon. Kept separate
// from the data file so swapping in real Supabase counts later never
// touches this file.
const STAT_ICONS = {
  "trips-created": Route,
  "saved-itineraries": Bookmark,
  "shared-trips": Share2,
  friends: Users,
};

export default function UserDashboard() {
  useGlobalStyles();
  const { toastMessage, showToast } = useToast();

  const [authUser, setAuthUser] = useState(null);
  const { data: stats, loading: statsLoading } = useMockData(USER_STATS, 600);
  const { data: profileMock, loading: profileLoading } = useMockData(
    USER_PROFILE,
    500,
  );

  // Layers the real signed-in email/name on top of the mock profile once
  // the session loads — same "mock now, real later" pattern as the rest
  // of the dashboard.
  const profile =
    profileMock && authUser
      ? {
          ...profileMock,
          name: authUser.user_metadata?.full_name || profileMock.name,
          email: authUser.email || profileMock.email,
        }
      : profileMock;

  useEffect(() => {
    let active = true;
    getCurrentUser().then(({ data }) => {
      if (active) setAuthUser(data?.user ?? null);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleEditProfile = () => {
    showToast("Edit Profile isn't wired up yet — coming soon!");
  };

  const firstName = (profile?.name || "Traveler").split(" ")[0];

  return (
    <div className="min-h-screen font-body text-[var(--color-body)] bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-bg-secondary)]">
      <DashboardNavbar user={authUser} />

      <main className="px-6 py-10 mx-auto max-w-7xl">
        <WelcomeBanner name={profileLoading ? "…" : firstName} />

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          {(statsLoading ? USER_STATS : stats).map((stat) => (
            <StatCard
              key={stat.id}
              icon={STAT_ICONS[stat.id]}
              label={stat.label}
              value={stat.value}
              loading={statsLoading}
            />
          ))}
        </div>

        {/* Main layout: larger left column, right column of profile/prefs/actions */}
        <div className="grid grid-cols-1 gap-5 mb-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <RecentItineraries />
            <UpcomingTrips />
            <RecentlyViewedDestinations />
          </div>

          <div className="space-y-5">
            <MiniProfileCard
              profile={profile}
              loading={profileLoading}
              onEditProfile={handleEditProfile}
            />
            <TravelPreferences />
            <TravelStatistics />
            <QuickActions onPlaceholderAction={showToast} />
          </div>
        </div>

        {/* Bottom section */}
        <RecentActivityTimeline />
      </main>

      <Toast message={toastMessage} />
    </div>
  );
}
