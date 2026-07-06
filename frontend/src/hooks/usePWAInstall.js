import { useEffect, useState } from "react";

let deferredPrompt = null;
const listeners = new Set();

export function usePWAInstall() {
  const [prompt, setPrompt] = useState(deferredPrompt);

  useEffect(() => {
    listeners.add(setPrompt);

    return () => listeners.delete(setPrompt);
  }, []);

  return prompt;
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();

  deferredPrompt = e;

  listeners.forEach((listener) => listener(deferredPrompt));
});