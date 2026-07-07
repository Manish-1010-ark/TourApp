import { useEffect, useState } from "react";

// Simulates fetching data from a backend: returns { data, loading } and
// flips loading -> false after a delay. Every dashboard section uses this
// same shape, so swapping in a real API call later is a one-line change —
// replace the setTimeout body with an actual fetch and keep the contract.
export function useMockData(resolveWith, delayMs = 800) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const timer = setTimeout(() => {
      if (!active) return;
      setData(resolveWith);
      setLoading(false);
    }, delayMs);

    return () => {
      active = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading };
}