// All values below are placeholders. Once Supabase tables/queries exist for
// trips, itineraries, and activity, swap the useMockData(...) calls in each
// component for real fetches — the components themselves won't change shape.

export const USER_PROFILE = {
  name: "Manish Shivam",
  email: "manishshivam009@gmail.com",
  memberSince: "March 2025",
};

export const USER_STATS = [
  { id: "trips-created", label: "Trips Created", value: 18 },
  { id: "saved-itineraries", label: "Saved Itineraries", value: 27 },
  { id: "shared-trips", label: "Shared Trips", value: 9 },
  { id: "friends", label: "Friends", value: 42 },
];

export const RECENT_ITINERARIES = [
  { id: 1, destination: "Goa", days: 5, createdAt: "2 days ago" },
  { id: 2, destination: "Kerala Backwaters", days: 7, createdAt: "1 week ago" },
  { id: 3, destination: "Himachal Pradesh", days: 6, createdAt: "3 weeks ago" },
  { id: 4, destination: "Rajasthan Forts", days: 8, createdAt: "1 month ago" },
];

export const UPCOMING_TRIPS = [
  { id: 1, destination: "Ladakh", dateRange: "Aug 12 – Aug 19", daysLeft: 12 },
  { id: 2, destination: "Coorg", dateRange: "Sep 3 – Sep 6", daysLeft: 34 },
];

export const RECENTLY_VIEWED_DESTINATIONS = [
  { name: "Darjeeling", viewedAgo: "3 hours ago" },
  { name: "Andaman Islands", viewedAgo: "1 day ago" },
  { name: "Munnar", viewedAgo: "2 days ago" },
  { name: "Jaisalmer", viewedAgo: "4 days ago" },
];

export const TRAVEL_PREFERENCES = [
  "Beaches",
  "Trekking",
  "Backwaters",
  "Heritage & Forts",
  "Food Trails",
  "Hill Stations",
];

export const TRAVEL_STATS = {
  statesExplored: 11,
  avgTripLength: "6 days",
  longestTrip: "12 days",
  favoriteSeason: "Winter",
};

export const RECENT_ACTIVITY = [
  { id: 1, time: "09:42", action: "Generated a Goa itinerary" },
  { id: 2, time: "Yesterday", action: "Saved a Darjeeling trip" },
  { id: 3, time: "2 days ago", action: "Shared a Kerala itinerary" },
  { id: 4, time: "4 days ago", action: "Added Rahul as a friend" },
];
