const API_BASE = "http://127.0.0.1:8000";

export async function getDestinationInfo(searchQuery) {
  const response = await fetch(
    `${API_BASE}/destination/info?search_query=${encodeURIComponent(searchQuery)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch destination.");
  }

  return await response.json();
}