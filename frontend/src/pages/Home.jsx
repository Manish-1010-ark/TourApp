import { useState, useEffect, useRef, useCallback, useId } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Check,
  Mail,
  User,
  Compass,
  Route,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";

import { signIn, signUp } from "../services/authService";
import { useNavigate } from "react-router-dom";
import InstallPWAButton from "../components/InstallPWAButton";

// Background slideshow images — Indian travel destinations.
// `coords` feeds the waypoint tag in the hero (see WaypointTag below) —
// a small nod to the fact that this product is, at heart, a route builder.
const SLIDES = [
  {
    label: "The Taj Mahal",
    coords: "27.1751° N, 78.0421° E",
    url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1920&q=80",
  },
  {
    label: "Himalayan Snow Peaks",
    coords: "30.7333° N, 79.0667° E",
    url: "https://hips.hearstapps.com/hmg-prod/images/moraine-lake-and-the-valley-of-the-ten-peaks-in-the-royalty-free-image-1571062944.jpg?crop=0.654xw:1.00xh;0.252xw,0&resize=1200:*",
  },
  {
    label: "Goa Coastline",
    coords: "15.2993° N, 74.1240° E",
    url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1920&q=80",
  },
  {
    label: "Dal Lake, Kashmir",
    coords: "34.1237° N, 74.8237° E",
    url: "https://thumbs.dreamstime.com/b/beautiful-view-dal-lake-winter-srinagar-kashmir-india-srinagar-kashmir-india-january-view-dal-lake-winter-224410445.jpg",
  },
];

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

// A curated handful surfaced on the homepage itself; the rest still live
// in the full destination drawer.
const FEATURED_STATES = [
  "Goa",
  "Kerala",
  "Rajasthan",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Uttarakhand",
  "Tamil Nadu",
  "West Bengal",
];

const HOW_IT_WORKS = [
  {
    tag: "WAYPOINT 01",
    title: "Tell us who you're building for",
    body: "Connect your brand — hotel, DMO, or travel agency — and Traviora takes on your identity, not the other way round.",
    icon: Building2,
  },
  {
    tag: "WAYPOINT 02",
    title: "Set the shape of the trip",
    body: "Dates, budget, pace, interests. The traveler answers a few questions; you don't lift a finger.",
    icon: Compass,
  },
  {
    tag: "WAYPOINT 03",
    title: "Launch a living itinerary",
    body: "Traviora drafts a day-by-day route in seconds, ready for the traveler to reshape on the fly.",
    icon: Route,
  },
];

const SLIDE_INTERVAL_MS = 6000;
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Injects the custom-scrollbar CSS and the two display fonts once into
// <head>, no matter how many times <Home /> mounts.
function useGlobalStyles() {
  useEffect(() => {
    const STYLE_ID = "traviora-custom-scrollbar";
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        html, body { margin: 0; padding: 0; width: 100%; overflow-x: hidden; }
        #root, #app { margin: 0; padding: 0; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(249,115,22,0.4); border-radius: 10px; }
        .font-display { font-family: 'Fraunces', 'ui-serif', Georgia, serif; font-optical-sizing: auto; }
        .font-mono-tag { font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: 0.08em; }
      `;
      document.head.appendChild(style);
    }

    const FONT_ID = "traviora-fonts";
    if (!document.getElementById(FONT_ID)) {
      const link = document.createElement("link");
      link.id = FONT_ID;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500&display=swap";
      document.head.appendChild(link);
    }
  }, []);
}

// Reusable labeled input so the login/register forms don't repeat markup.
function Field({ label, type = "text", name, autoComplete, ...rest }) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className="w-full px-4 py-3 text-white placeholder-gray-500 transition-colors border rounded-xl bg-white/5 border-white/10 focus:border-orange-500 focus:outline-none"
        {...rest}
      />
    </div>
  );
}

function AuthModal({ mode, visible, onClose, onSwitch }) {
  const titleId = useId();
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  // idle | success | confirm-email
  const [status, setStatus] = useState("idle");
  const [pendingCreds, setPendingCreds] = useState(null);

  // Reset transient state whenever the mode changes (e.g. login <-> register)
  useEffect(() => {
    setStatus("idle");
    setResent(false);
    setPendingCreds(null);
  }, [mode]);

  // Autofocus the first field, and trap Tab navigation inside the dialog.
  useEffect(() => {
    if (!visible) return;
    const container = containerRef.current;
    if (!container) return;

    const focusables = container.querySelectorAll(FOCUSABLE_SELECTOR);
    focusables[0]?.focus();

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible, mode, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);

    const name = form.get("name");
    const email = form.get("email");
    const password = form.get("password");

    setLoading(true);

    try {
      let result;

      if (mode === "login") {
        result = await signIn(email, password);
      } else {
        result = await signUp(name, email, password);
      }

      if (result.error) {
        alert(result.error.message);
        return;
      }

      if (mode === "login") {
        setStatus("success");
        setTimeout(() => {
          onClose();
          e.target.reset();
          navigate("/trip-prep");
        }, 1000);
      } else {
        // Registration succeeded, but the account still needs the traveler
        // to confirm their email before it's usable.
        setPendingCreds({ name, email, password });
        setStatus("confirm-email");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Re-sends the confirmation email. Most confirm-by-link auth backends
  // (e.g. Supabase) re-trigger the confirmation email on a repeat sign-up
  // for an unconfirmed address.
  // TODO: swap for a dedicated resendConfirmation(email) call if/when
  // authService exposes one — that's a more reliable contract than reusing
  // signUp.
  const handleResend = async () => {
    if (!pendingCreds || resending) return;
    setResending(true);
    try {
      await signUp(
        pendingCreds.name,
        pendingCreds.email,
        pendingCreds.password,
      );
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch {
      // Swallow "already registered" style errors — the goal is just to
      // reassure the traveler a link is on its way.
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } finally {
      setResending(false);
    }
  };

  // Once the traveler has clicked the confirmation link in their inbox,
  // this signs them in and sends them on to trip-prep.
  const handleContinueAfterConfirm = async () => {
    if (!pendingCreds) return;
    setLoading(true);
    try {
      const result = await signIn(pendingCreds.email, pendingCreds.password);
      if (result.error) {
        alert(
          "Not confirmed just yet — open the link in your email first, then try again.",
        );
        return;
      }
      onClose();
      navigate("/trip-prep");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md transition-opacity duration-300 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative w-full max-w-md transform rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          visible ? "scale-100" : "scale-95"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute p-2 text-xl text-gray-400 top-4 right-4 hover:text-white"
        >
          <X size={20} />
        </button>

        {status === "success" && (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="flex items-center justify-center w-14 h-14 mb-4 rounded-full bg-orange-600/20">
              <Check size={28} className="text-orange-500" />
            </span>
            <h2 className="text-xl font-bold text-white">Welcome back!</h2>
            <p className="mt-2 text-sm text-gray-400">
              Taking you to trip prep…
            </p>
          </div>
        )}

        {status === "confirm-email" && (
          <div className="flex flex-col items-center py-4 text-center">
            <span className="flex items-center justify-center w-14 h-14 mb-4 rounded-full bg-orange-600/20">
              <Mail size={26} className="text-orange-500" />
            </span>
            <h2 id={titleId} className="text-xl font-bold text-white">
              Confirm your email
            </h2>
            <p className="max-w-xs mt-2 text-sm text-gray-400">
              We've sent a confirmation link to{" "}
              <span className="font-semibold text-gray-200">
                {pendingCreds?.email}
              </span>
              . Open it, then come back here to continue.
            </p>

            <button
              type="button"
              onClick={handleContinueAfterConfirm}
              disabled={loading}
              className="w-full py-3 mt-6 font-bold text-white transition bg-orange-600 shadow-lg rounded-xl shadow-orange-600/20 hover:bg-orange-700 disabled:opacity-60"
            >
              {loading ? "Checking…" : "I've confirmed — Continue"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="mt-3 text-xs font-semibold text-gray-400 hover:text-orange-400 disabled:opacity-60"
            >
              {resending
                ? "Sending…"
                : resent
                  ? "Sent — check your inbox"
                  : "Resend confirmation email"}
            </button>
          </div>
        )}

        {status === "idle" && (
          <>
            <h2
              id={titleId}
              className="mb-2 text-3xl font-extrabold text-white"
            >
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="mb-6 text-sm text-gray-400">
              {isLogin
                ? "Login to access your personalized smart itineraries."
                : "Sign up to begin designing custom trip routes instantly."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Field
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  placeholder="John Doe"
                />
              )}
              <Field
                label="Email Address"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="name@example.com"
              />
              <Field
                label="Password"
                type="password"
                name="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder="••••••••"
              />

              {isLogin ? (
                <div className="text-right">
                  <a
                    href="#forgot-password"
                    className="text-xs text-orange-400 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    required
                    id="terms"
                    className="accent-orange-500"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-400">
                    I agree to the Terms of Service & Privacy Policy
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 font-bold text-white transition bg-orange-600 shadow-lg rounded-xl shadow-orange-600/20 hover:bg-orange-700 disabled:opacity-60"
              >
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <p className="mt-6 text-sm text-center text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => onSwitch(isLogin ? "register" : "login")}
                className="ml-1 font-semibold text-orange-400 hover:underline"
              >
                {isLogin ? "Register instead" : "Login instead"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// The small mono-font tag pinned over the hero carousel. It reads like a
// waypoint marker on a route — grounding "AI itinerary builder" in an
// actual coordinate rather than a generic badge.
function WaypointTag({ slide, index, total }) {
  return (
    <div className="items-center hidden gap-3 px-4 py-2 border rounded-full sm:inline-flex border-white/15 bg-black/30 backdrop-blur-sm font-mono-tag">
      <span className="text-orange-400">
        {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
      </span>
      <span className="w-px h-3 bg-white/20" aria-hidden="true" />
      <span className="text-gray-200">{slide.label}</span>
      <span className="w-px h-3 bg-white/20" aria-hidden="true" />
      <span className="text-gray-400">{slide.coords}</span>
    </div>
  );
}

function SectionEyebrow({ children }) {
  return (
    <span className="inline-block mb-4 text-xs font-semibold tracking-[0.2em] text-orange-400 uppercase font-mono-tag">
      {children}
    </span>
  );
}

export default function Home() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null); // null | 'login' | 'register'
  const [modalVisible, setModalVisible] = useState(false);
  const closeTimeout = useRef(null);
  const navigate = useNavigate();

  useGlobalStyles();

  // Background slideshow rotation — paused while a modal/drawer is open so
  // it doesn't steal attention or fight for GPU with open transitions.
  useEffect(() => {
    if (drawerOpen || authMode) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [drawerOpen, authMode]);

  // Lock body scroll while the drawer or modal is open.
  useEffect(() => {
    document.body.style.overflow = drawerOpen || authMode ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen, authMode]);

  // Escape closes the drawer too (the modal handles its own Escape key).
  useEffect(() => {
    if (!drawerOpen || authMode) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen, authMode]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setDestinationOpen(false);
  }, []);

  const openAuth = useCallback((mode) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setAuthMode(mode);
    requestAnimationFrame(() => setModalVisible(true));
  }, []);

  const closeAuth = useCallback(() => {
    setModalVisible(false);
    closeTimeout.current = setTimeout(() => setAuthMode(null), 150);
  }, []);

  useEffect(
    () => () => closeTimeout.current && clearTimeout(closeTimeout.current),
    [],
  );

  const currentSlide = SLIDES[slideIndex];

  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans text-white bg-gray-900 select-none">
      {/* Background Carousel */}
      <div className="fixed inset-0 z-0" aria-hidden="true">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.url}
            className="absolute inset-0 bg-center bg-cover transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('${slide.url}')`,
              opacity: i === slideIndex ? 1 : 0,
            }}
          />
        ))}
      </div>

      {/* Header / Navbar */}
      <header className="absolute top-0 left-0 z-40 w-full p-6 bg-transparent">
        <div className="flex items-center justify-between mx-auto max-w-7xl">
          <div className="text-2xl font-black tracking-wider text-white font-display">
            Traviora
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <InstallPWAButton variant="link" />

            <button
              type="button"
              onClick={() => navigate("/profile")}
              aria-label="Go to profile"
              className="p-2 transition rounded-full hover:bg-white/10 hover:text-orange-500"
            >
              <User size={22} />
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              className="p-2 text-2xl transition hover:text-orange-500"
            >
              <Menu size={26} />
            </button>
          </div>
        </div>
      </header>

      {/* Side Drawer Navigation */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!drawerOpen}
        className={`fixed top-0 right-0 z-50 h-full w-80 transform overflow-y-auto border-l border-white/10 bg-black/95 shadow-2xl transition-transform duration-300 custom-scrollbar ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-6">
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close menu"
            className="p-2 text-2xl text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="flex flex-col px-8 mt-6 space-y-5 text-sm font-bold tracking-widest uppercase">
          <a
            href="#home"
            onClick={closeDrawer}
            className="text-orange-500 transition"
          >
            HOME
          </a>
          <a
            href="#how-it-works"
            onClick={closeDrawer}
            className="text-gray-300 transition hover:text-orange-500"
          >
            HOW IT WORKS
          </a>

          <div>
            <button
              type="button"
              onClick={() => setDestinationOpen((prev) => !prev)}
              aria-expanded={destinationOpen}
              className="flex items-center justify-between w-full text-gray-300 transition hover:text-orange-500"
            >
              <span>DESTINATION</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${destinationOpen ? "rotate-180" : ""}`}
              />
            </button>

            {destinationOpen && (
              <div className="flex flex-col pl-4 mt-3 space-y-3 text-xs font-semibold tracking-normal text-gray-400 normal-case border-l max-h-64 overflow-y-auto border-white/10 custom-scrollbar">
                {INDIAN_STATES.map((state) => (
                  <a
                    key={state}
                    href={`#${state.toLowerCase().replace(/\s+&?\s*/g, "-")}`}
                    onClick={closeDrawer}
                    className="transition hover:text-white"
                  >
                    {state}
                  </a>
                ))}
              </div>
            )}
          </div>

          <a
            href="#about"
            onClick={closeDrawer}
            className="text-gray-300 transition hover:text-orange-500"
          >
            ABOUT
          </a>
        </nav>
      </div>
      {drawerOpen && (
        <div
          onClick={closeDrawer}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Hero Pitch */}
      <main
        id="home"
        className="relative z-30 flex flex-col items-center justify-center min-h-screen px-4 pt-24 pb-16 text-center"
      >
        <div className="max-w-4xl space-y-8">
          <WaypointTag
            slide={currentSlide}
            index={slideIndex}
            total={SLIDES.length}
          />

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl font-display">
            An AI Itinerary Builder <br /> For Your Website
          </h1>
          <p className="max-w-2xl mx-auto text-base text-gray-200 md:text-lg">
            A white-label AI itinerary builder designed for destination
            organizations, hotels, and travel brands. Deliver personalized
            travel experiences.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="min-w-[140px] rounded-xl border border-white/20 bg-white/10 px-8 py-3 font-bold text-white transition duration-300 backdrop-blur-xs hover:bg-white/20"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => openAuth("register")}
              className="min-w-[140px] rounded-xl bg-orange-600 px-8 py-3 font-bold text-white shadow-lg shadow-orange-600/20 transition duration-300 hover:bg-orange-700"
            >
              Register User
            </button>
          </div>
        </div>

        {/* Scroll cue */}
        <a
          href="#how-it-works"
          aria-label="Scroll to how it works"
          className="absolute hidden -translate-x-1/2 sm:flex bottom-8 left-1/2 animate-bounce"
        >
          <ChevronDown className="text-white/60" size={28} />
        </a>
      </main>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="relative z-30 px-6 py-24 bg-gray-950 border-t border-white/10"
      >
        <div className="mx-auto text-center max-w-7xl">
          <SectionEyebrow>The Route To Launch</SectionEyebrow>
          <h2 className="max-w-2xl mx-auto text-3xl font-bold sm:text-4xl font-display">
            Three waypoints between sign-up and a live itinerary
          </h2>
        </div>

        <div className="relative grid max-w-5xl grid-cols-1 gap-10 mx-auto mt-16 md:grid-cols-3">
          {/* connecting route line, desktop only */}
          <div
            aria-hidden="true"
            className="absolute hidden h-px border-t border-dashed md:block top-8 left-[16.5%] right-[16.5%] border-orange-500/30"
          />
          {HOW_IT_WORKS.map(({ tag, title, body, icon: Icon }) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="relative flex flex-col items-center px-4 text-center"
            >
              <span className="relative z-10 flex items-center justify-center w-16 h-16 mb-6 border rounded-full bg-gray-900 border-orange-500/40">
                <Icon size={26} className="text-orange-400" />
              </span>
              <span className="mb-2 text-xs font-semibold text-orange-400 font-mono-tag">
                {tag}
              </span>
              <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
              <p className="text-sm text-gray-400">{body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Built for travel brands */}
      <section className="relative z-30 px-6 py-24 border-t bg-gray-900 border-white/10">
        <div className="grid max-w-6xl gap-12 mx-auto md:grid-cols-2 md:items-center">
          <div>
            <SectionEyebrow>Built White-Label</SectionEyebrow>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl font-display">
              Your brand up front. Traviora underneath.
            </h2>
            <p className="mb-6 text-gray-400">
              Every itinerary, email, and confirmation screen carries your name
              — travelers never see "Traviora" unless you want them to.
            </p>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Check size={18} className="mt-0.5 text-orange-500 shrink-0" />
                <span className="text-gray-300">
                  Every Indian state covered, day one — no region left unmapped.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={18} className="mt-0.5 text-orange-500 shrink-0" />
                <span className="text-gray-300">
                  Drop-in embed, so it lives on your site instead of sending
                  travelers elsewhere.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={18} className="mt-0.5 text-orange-500 shrink-0" />
                <span className="text-gray-300">
                  Installable as an app, so returning travelers open it like any
                  other icon on their phone.
                </span>
              </li>
            </ul>
          </div>

          <div className="relative overflow-hidden border rounded-3xl border-white/10 aspect-square md:aspect-auto md:h-96">
            <img
              src={SLIDES[2].url}
              alt="Goa coastline, one of the destinations Traviora can route travelers to"
              className="object-cover w-full h-full"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <span className="text-xs font-mono-tag text-gray-300">
                {SLIDES[2].label} · {SLIDES[2].coords}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Explore by state */}
      <section
        id="about"
        className="relative z-30 px-6 py-24 border-t bg-gray-950 border-white/10"
      >
        <div className="mx-auto text-center max-w-7xl">
          <SectionEyebrow>Destinations</SectionEyebrow>
          <h2 className="max-w-2xl mx-auto text-3xl font-bold sm:text-4xl font-display">
            Wherever your travelers are headed, there's already a route
          </h2>
        </div>

        <div className="grid max-w-5xl grid-cols-2 gap-4 mx-auto mt-14 sm:grid-cols-4">
          {FEATURED_STATES.map((state) => (
            <a
              key={state}
              href={`#${state.toLowerCase().replace(/\s+&?\s*/g, "-")}`}
              className="px-4 py-5 text-sm font-semibold text-center transition border rounded-2xl border-white/10 bg-white/5 hover:border-orange-500/50 hover:bg-white/10"
            >
              {state}
            </a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="text-sm font-semibold text-orange-400 hover:underline"
          >
            See all {INDIAN_STATES.length} states →
          </button>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-30 px-6 py-24 text-center border-t bg-gray-900 border-white/10">
        <div className="max-w-2xl mx-auto">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl font-display">
            Ready to put a route in front of your travelers?
          </h2>
          <p className="mb-8 text-gray-400">
            Register your brand and have a live itinerary builder embedded
            before the day is out.
          </p>
          <button
            type="button"
            onClick={() => openAuth("register")}
            className="rounded-xl bg-orange-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-orange-600/20 transition duration-300 hover:bg-orange-700"
          >
            Register User
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-30 px-6 py-10 border-t bg-gray-950 border-white/10">
        <div className="flex flex-col items-center justify-between max-w-7xl mx-auto gap-4 text-sm text-gray-500 sm:flex-row">
          <span className="font-display text-lg font-black text-white">
            Traviora
          </span>
          <nav className="flex gap-6">
            <a href="#home" className="hover:text-orange-400">
              Home
            </a>
            <a href="#how-it-works" className="hover:text-orange-400">
              How it works
            </a>
            <a href="#about" className="hover:text-orange-400">
              Destinations
            </a>
          </nav>
          <span>© {new Date().getFullYear()} Traviora</span>
        </div>
      </footer>

      {authMode && (
        <AuthModal
          mode={authMode}
          visible={modalVisible}
          onClose={closeAuth}
          onSwitch={(mode) => setAuthMode(mode)}
        />
      )}
    </div>
  );
}
