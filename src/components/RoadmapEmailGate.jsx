"use client";

import { useState } from "react";
import NewsletterCheckbox, { useNewsletterConsent } from "@/components/NewsletterCheckbox";
import { trackEvent } from "@/libs/analytics";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const ROADMAP_UNLOCK_KEY = "froggo_roadmaps_unlocked";

export function readRoadmapUnlock() {
  try {
    return Boolean(localStorage.getItem(ROADMAP_UNLOCK_KEY));
  } catch {
    return false;
  }
}

// Email capture that unlocks problem links and hints on both roadmaps.
// Access never depends on the newsletter box (consent must be freely given
// where the law requires it); signing in is only needed to track progress.
export default function RoadmapEmailGate({ slug, onUnlocked, onSignIn, variant = "inline", onClose }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [errorMessage, setErrorMessage] = useState("");
  const { optIn, setOptIn } = useNewsletterConsent();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === "loading") return;

    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: trimmed, newsletter: optIn, source: `roadmap-${slug}` }),
      });
      const data = await response.json();

      if (!data.success) {
        setStatus("error");
        setErrorMessage(data.message || "Something went wrong. Please try again.");
        return;
      }

      try {
        localStorage.setItem(ROADMAP_UNLOCK_KEY, String(Date.now()));
      } catch {
        // Private mode: still unlock for this visit
      }
      trackEvent("roadmap_email_unlock", { roadmap: slug, newsletter: optIn });
      onUnlocked();
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const form = (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="you@example.com"
          aria-label="Email address"
          disabled={status === "loading"}
          className="flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-emerald-500/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/30"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Unlocking…" : "Get the free roadmap"}
        </button>
      </div>
      {status === "error" && errorMessage && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {errorMessage}
        </p>
      )}
      <NewsletterCheckbox checked={optIn} onChange={setOptIn} className="mt-4" />
      <p className="mt-4 text-sm text-white/60">
        Want to track your progress and streak?{" "}
        <button
          type="button"
          onClick={onSignIn}
          className="font-bold text-emerald-300 underline-offset-4 hover:text-emerald-200 hover:underline"
        >
          Sign in with Google
        </button>
      </p>
    </form>
  );

  const heading = (
    <>
      <h2 className="text-xl font-black text-white md:text-2xl">
        Get the full roadmap — free 🐸
      </h2>
      <p className="mt-2 mb-5 text-sm leading-6 text-white/70">
        Enter your email to unlock every problem link and hint on both roadmaps.
      </p>
    </>
  );

  if (variant === "modal") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div className="relative w-full max-w-lg rounded-xl border border-white/15 bg-[#181818] p-6 shadow-2xl shadow-black/50 md:p-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 text-white/50 hover:text-white"
          >
            ✕
          </button>
          {heading}
          {form}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-lg border border-emerald-300/25 bg-emerald-300/[0.06] p-5 md:p-6">
      {heading}
      {form}
    </div>
  );
}
