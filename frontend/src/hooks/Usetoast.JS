import { useCallback, useRef, useState } from "react";

// Every button that doesn't have a real destination yet (Saved Trips,
// Friends, Share Itinerary, Edit Profile...) calls showToast() instead of
// silently doing nothing or blocking the UI with alert(). Once each of
// those features is built, replace the showToast(...) call at the call
// site with the real action/navigation.
export function useToast() {
  const [message, setMessage] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((text) => {
    clearTimeout(timerRef.current);
    setMessage(text);
    timerRef.current = setTimeout(() => setMessage(null), 2400);
  }, []);

  return { toastMessage: message, showToast };
}