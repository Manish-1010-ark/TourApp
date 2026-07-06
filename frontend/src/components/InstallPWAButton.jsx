import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Smartphone, X } from "lucide-react";

/**
 * InstallPWAButton
 *
 * Listens for the browser's `beforeinstallprompt` event (Chrome/Edge/Android)
 * and shows a branded install button when the app is installable.
 * Also shows a small iOS instructions card, since Safari doesn't support
 * `beforeinstallprompt` and requires manual "Add to Home Screen".
 *
 * Drop this anywhere, e.g. in the navbar next to "Create Itinerary":
 *   <InstallPWAButton />
 */
export default function InstallPWAButton({ variant = "button" }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    // Already installed / running standalone
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsInstalled(standalone);

    // Fallback: the event may have fired before this component mounted
    // (see the early-capture script added in index.html)
    if (window.__deferredPWAPrompt) {
      setDeferredPrompt(window.__deferredPWAPrompt);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.__deferredPWAPrompt = e;
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      window.__deferredPWAPrompt = null;
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  // Dev-only visibility into why the browser hasn't offered an install
  // prompt yet — beforeinstallprompt requires HTTPS (or localhost), a
  // linked manifest.json with valid icons/start_url/display, and a
  // registered service worker.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (isInstalled) {
      console.debug("[InstallPWAButton] App already running standalone.");
    } else if (!deferredPrompt && !isIOS) {
      console.debug(
        "[InstallPWAButton] No beforeinstallprompt event yet. Check: " +
          "HTTPS/localhost, manifest.json (name, icons, start_url, display: standalone), " +
          "and a registered service worker.",
      );
    }
  }, [isInstalled, deferredPrompt, isIOS]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    if (isIOS) {
      setShowIOSHint(true);
    }
  };

  // Nothing to offer: already installed, or no prompt available and not iOS
  if (isInstalled || (!deferredPrompt && !isIOS)) return null;

  return (
    <>
      <motion.button
        onClick={handleInstallClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={
          variant === "button"
            ? "inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-full font-medium text-sm hover:shadow-lg transition-all"
            : "inline-flex items-center gap-1.5 text-slate-700 hover:text-orange-600 transition font-medium text-sm"
        }
      >
        <Download className="w-4 h-4" />
        Install App
      </motion.button>

      {/* iOS "Add to Home Screen" instructions */}
      <AnimatePresence>
        {showIOSHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowIOSHint(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative"
            >
              <button
                onClick={() => setShowIOSHint(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center mb-4">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">
                Install Wanderly on iOS
              </h3>
              <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                <li>
                  Tap the <strong>Share</strong> icon in Safari's toolbar
                </li>
                <li>
                  Scroll down and tap <strong>Add to Home Screen</strong>
                </li>
                <li>
                  Tap <strong>Add</strong> in the top-right corner
                </li>
              </ol>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
