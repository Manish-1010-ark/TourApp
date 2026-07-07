// All values below are placeholders. Once the backend exposes real
// analytics endpoints, delete this file and point each dashboard section's
// useMockData(...) call at a real fetch instead — the component code
// itself won't need to change shape.

export const KPI_DATA = [
  {
    id: "total-users",
    label: "Total Users",
    value: "12,480",
    delta: "+4.2%",
    trend: "up",
  },
  {
    id: "total-itineraries",
    label: "Itineraries Generated",
    value: "34,910",
    delta: "+9.8%",
    trend: "up",
  },
  {
    id: "total-searches",
    label: "Total Searches",
    value: "128,204",
    delta: "+2.1%",
    trend: "up",
  },
  {
    id: "active-today",
    label: "Active Users Today",
    value: "1,732",
    delta: "-1.4%",
    trend: "down",
  },
];

export const DESTINATIONS_DATA = [
  { name: "Goa", coords: "15.2993° N, 74.1240° E", searches: 4210, share: 100 },
  { name: "Kerala", coords: "10.8505° N, 76.2711° E", searches: 3585, share: 85 },
  { name: "Himachal Pradesh", coords: "31.1048° N, 77.1734° E", searches: 2960, share: 70 },
  { name: "Rajasthan", coords: "27.0238° N, 74.2179° E", searches: 2470, share: 59 },
  { name: "Jammu & Kashmir", coords: "34.1237° N, 74.8237° E", searches: 1890, share: 45 },
];

export const INTERESTS_DATA = [
  { name: "Beaches", count: 5240 },
  { name: "Trekking", count: 3810 },
  { name: "Heritage & Forts", count: 3120 },
  { name: "Wildlife", count: 2460 },
  { name: "Backwaters", count: 2105 },
  { name: "Food Trails", count: 1870 },
  { name: "Hill Stations", count: 1640 },
  { name: "Adventure Sports", count: 1225 },
];

export const AI_USAGE_DATA = {
  itinerariesToday: 342,
  avgGenerationTime: "3.8s",
  successRate: "98.6%",
  activeSessions: 27,
};

export const ACTIVITY_DATA = [
  { id: 1, time: "09:42", user: "A. Sharma", action: "Generated a 5-day itinerary for Goa" },
  { id: 2, time: "09:37", user: "R. Iyer", action: "Registered a new account" },
  { id: 3, time: "09:25", user: "M. Fernandes", action: "Searched destinations in Kerala" },
  { id: 4, time: "09:18", user: "S. Kapoor", action: "Generated a 7-day itinerary for Himachal Pradesh" },
  { id: 5, time: "09:04", user: "D. Chowdhury", action: "Updated trip configuration for Rajasthan" },
];