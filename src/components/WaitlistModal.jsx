"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { locationService } from "@/libs/locationService";

// Waitlist popup — same design language as the old full-page waitlist
// takeover, but dismissible so visitors can explore the rest of the site.
// Shows once per browser (localStorage) and never for signed-in users.
const DISMISSED_KEY = "waitlist_dismissed";

const WaitlistModal = () => {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState("");
  // In consent-required jurisdictions (EU/UK/EEA/CH) the newsletter is an
  // explicit unchecked opt-in; everywhere else it's implied with clear copy
  const [needsConsent, setNeedsConsent] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);

  useEffect(() => {
    locationService
      .requiresMarketingConsent()
      .then(setNeedsConsent)
      .catch(() => setNeedsConsent(true));
  }, []);

  useEffect(() => {
    if (loading || user) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    // Let the landing page paint first, then hop in
    const timer = setTimeout(() => setIsOpen(true), 1500);
    return () => clearTimeout(timer);
  }, [loading, user]);

  // "Notify Me" buttons (e.g. coming-soon course cards) reopen the modal
  // on demand, even after it was dismissed
  useEffect(() => {
    const handleOpen = () => {
      setStatus("idle");
      setIsOpen(true);
    };
    window.addEventListener("open-waitlist-modal", handleOpen);
    return () => window.removeEventListener("open-waitlist-modal", handleOpen);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status === "loading") return;

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: trimmed,
          newsletter: needsConsent ? newsletterOptIn : true,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setEmail("");
        localStorage.setItem(DISMISSED_KEY, String(Date.now()));
      } else {
        setStatus("error");
        setErrorMessage(
          data.message || "Something went wrong. Please try again."
        );
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 bg-black/70 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#181818] px-6 py-10 md:px-10 shadow-2xl"
      >
        {/* Animated frog-like gradient blobs (matched to Hero) */}
        <div className="absolute bottom-0 left-6 w-40 h-40 bg-emerald-600/50 rounded-full blur-2xl opacity-30 animate-frog-jump-small pointer-events-none"></div>
        <div className="absolute bottom-0 right-6 w-32 h-32 bg-emerald-600/50 rounded-full blur-2xl opacity-25 animate-frog-jump-small pointer-events-none"></div>

        {/* Close */}
        <button
          onClick={dismiss}
          aria-label="Close and explore the site"
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <Image
              src="/favicon.ico"
              alt="FroggoCodes Logo"
              width={30}
              height={30}
            />
            <span className="font-extrabold text-xl text-emerald-400">
              FroggoCodes
            </span>
          </div>

          {/* Headline */}
          <h2 className="max-w-md font-extrabold text-3xl md:text-4xl text-white tracking-tight leading-tight">
            Something{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-400 to-emerald-300 bg-clip-text text-transparent">
              hops
            </span>{" "}
            this way.
          </h2>

          {/* Subhead */}
          <p className="mt-4 max-w-sm text-sm md:text-base text-white/70 leading-relaxed">
            Use AI to ship money-making SaaS products in 30 days.
            <br /> First 100 users get a huge discount on the bootcamp.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-7 w-full">
            {status === "success" ? (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-5 text-center backdrop-blur-sm">
                <p className="text-emerald-300 font-semibold text-lg">
                  You&apos;re on the list. 🐸
                </p>
                <p className="text-white/70 text-sm mt-1">
                  We&apos;ll email you the moment we launch.
                </p>
                <button
                  type="button"
                  onClick={dismiss}
                  className="mt-4 inline-block rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  Explore the site →
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder="you@example.com"
                    className="flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 backdrop-blur-sm outline-none transition focus:border-emerald-500/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/30"
                    disabled={status === "loading"}
                    aria-label="Email address"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 text-base font-bold text-white transition duration-300 ease-out hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "loading" ? "Joining…" : "Join Waitlist"}
                  </button>
                </div>
                {status === "error" && errorMessage && (
                  <p className="mt-3 text-sm text-red-400" role="alert">
                    {errorMessage}
                  </p>
                )}
                {needsConsent ? (
                  <>
                    <label className="mt-4 flex items-start gap-2.5 text-left text-xs text-white/60 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newsletterOptIn}
                        onChange={(e) => setNewsletterOptIn(e.target.checked)}
                        className="mt-0.5 accent-emerald-500"
                      />
                      <span>
                        Also send me newsletters from Froggo and its creator —
                        practical insights on coding, AI, and shipping
                        products, to stay on top of your field. (optional)
                      </span>
                    </label>
                    <p className="mt-3 text-xs text-white/40">
                      No spam. One email when we go live.
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-xs text-white/40">
                    You&apos;ll also get newsletters from Froggo and its
                    creator — practical insights on coding, AI, and shipping
                    products, to stay on top of your field. No spam,
                    unsubscribe anytime.
                  </p>
                )}
                <button
                  type="button"
                  onClick={dismiss}
                  className="mt-5 text-sm text-white/50 underline-offset-4 hover:text-white/80 hover:underline transition-colors"
                >
                  No thanks — let me look around →
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default WaitlistModal;
