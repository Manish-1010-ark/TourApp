// hooks/useCitySearch.js
import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Default search provider — talks to the existing backend exactly as
 * TripPreparation.jsx did before. Swapping to Google Places/Mapbox later
 * means writing a new provider function with this same signature
 * (query -> Promise<Array<{name, state, lat, lon, country}>>) and passing
 * it into useCitySearch as the `provider` option. No component using this
 * hook needs to change.
 */
export async function defaultCitySearchProvider(query, { signal } = {}) {
  const response = await fetch(
    `http://127.0.0.1:8000/api/locations/search?q=${encodeURIComponent(query)}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Debounced, cancel-safe city search.
 *
 * @param {string} query - current input value
 * @param {object} options
 * @param {string} [options.excludeName] - skip searching if query already
 *   matches this exact selected city name (mirrors prior behavior)
 * @param {(query: string, opts: {signal: AbortSignal}) => Promise<Array>} [options.provider]
 * @param {number} [options.debounceMs]
 * @param {number} [options.minLength]
 */
export function useCitySearch(query, options = {}) {
  const {
    excludeName = null,
    provider = defaultCitySearchProvider,
    debounceMs = 400,
    minLength = 2,
  } = options;

  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);
  const latestQueryRef = useRef(query);

  const reset = useCallback(() => {
    setSuggestions([]);
    setIsSearching(false);
    setError(null);
  }, []);

  useEffect(() => {
    latestQueryRef.current = query;

    if (!query || query.length < minLength) {
      reset();
      return;
    }

    if (excludeName && query === excludeName) {
      // Selected city's name is already in the box — nothing new to search
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    const timeoutId = setTimeout(async () => {
      // Cancel any in-flight request before starting a new one
      // (prevents duplicate/overlapping requests as required)
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const results = await provider(query, { signal: controller.signal });
        // Guard against a stale response landing after a newer query fired
        if (latestQueryRef.current === query) {
          setSuggestions(results || []);
        }
      } catch (err) {
        if (err.name !== "AbortError" && latestQueryRef.current === query) {
          setSuggestions([]);
          setError("Couldn't load suggestions. Is the backend running?");
        }
      } finally {
        if (latestQueryRef.current === query) {
          setIsSearching(false);
        }
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, excludeName, provider, debounceMs, minLength]);

  return { suggestions, isSearching, error, reset };
}
