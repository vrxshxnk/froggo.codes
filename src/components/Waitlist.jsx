"use client";

import { useState } from "react";
import Image from "next/image";

const WEB3FORMS_ACCESS_KEY = "69d8e048-d268-4625-bfc6-96cb69df4fdd";

const Waitlist = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState("");

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
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: "New FroggoCodes Waitlist Signup",
          from_name: "FroggoCodes Waitlist",
          email: trimmed,
          message: `New waitlist signup: ${trimmed}`,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setErrorMessage(
          data.message || "Something went wrong. Please try again."
        );
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#181818] overflow-hidden">
      {/* Animated frog-like gradient blobs (matched to Hero) */}
      <div className="absolute bottom-0 left-20 w-64 h-64 bg-emerald-600/50 rounded-full blur-2xl opacity-30 animate-frog-jump-big pointer-events-none"></div>
      <div className="absolute bottom-0 right-20 w-48 h-48 bg-emerald-600/50 rounded-full blur-2xl opacity-25 animate-frog-jump-small pointer-events-none"></div>

      {/* Subtle top vignette */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/30 to-transparent pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 animate-fade-in">
          <Image
            src="/favicon.ico"
            alt="FroggoCodes Logo"
            width={36}
            height={36}
          />
          <span className="font-extrabold text-2xl md:text-3xl text-emerald-400">
            FroggoCodes
          </span>
        </div>

        {/* Early-bird badge */}
        <div className="mb-6 animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs md:text-sm font-medium text-emerald-300 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Early access — first 100 sign-ups get 50% off
          </span>
        </div>

        {/* Headline */}
        <h1 className="max-w-3xl text-center font-extrabold text-4xl md:text-6xl lg:text-7xl text-white tracking-tight leading-tight opacity-0 animate-fade-in-delayed">
          Something{" "}
          <span className="bg-gradient-to-r from-emerald-300 via-teal-400 to-emerald-300 bg-clip-text text-transparent">
            hops
          </span>{" "}
          this way.
        </h1>

        {/* Subhead */}
        <p className="mt-6 max-w-xl text-center text-base md:text-lg text-white/70 leading-relaxed opacity-0 animate-fade-in-delayed-more">
          Use AI to ship money-making SaaS products in 30 days. First 100 users get a huge discount on the bootcamp.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 w-full max-w-md opacity-0 animate-fade-in-delayed-most"
        >
          {status === "success" ? (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-5 text-center backdrop-blur-sm">
              <p className="text-emerald-300 font-semibold text-lg">
                You&apos;re on the list. 🐸
              </p>
              <p className="text-white/70 text-sm mt-1">
                We&apos;ll email you the moment we launch.
              </p>
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
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-emerald-600 px-6 py-3 text-base font-bold text-white transition duration-300 ease-out hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "loading" ? "Joining…" : "Join Waitlist"}
                </button>
              </div>
              {status === "error" && errorMessage && (
                <p className="mt-3 text-sm text-red-400" role="alert">
                  {errorMessage}
                </p>
              )}
              <p className="mt-3 text-xs text-white/40 text-center sm:text-left">
                No spam. One email when we go live.
              </p>
            </>
          )}
        </form>
      </div>

      {/* Animations — mirrored from Hero so the background matches exactly */}
      <style jsx global>{`
        @keyframes frogJumpBig {
          0%,
          100% {
            transform: translateX(0) translateY(0) scaleY(1) scaleX(1);
            animation-timing-function: ease-in-out;
          }
          12% {
            transform: translateX(0) translateY(10px) scaleY(0.8) scaleX(1.1);
            animation-timing-function: cubic-bezier(0.2, 0, 0.8, 0.2);
          }
          20% {
            transform: translateX(-80px) translateY(-120px) scaleY(1.15)
              scaleX(0.9);
            animation-timing-function: cubic-bezier(0.7, 0.05, 0.85, 0.4);
          }
          30% {
            transform: translateX(-120px) translateY(-180px) scaleY(1.2)
              scaleX(0.85);
            animation-timing-function: cubic-bezier(0.4, 0.1, 0.7, 0.3);
          }
          40% {
            transform: translateX(-150px) translateY(-100px) scaleY(1.1)
              scaleX(0.9);
            animation-timing-function: cubic-bezier(0.3, 0.4, 0.7, 0.8);
          }
          50% {
            transform: translateX(-170px) translateY(0) scaleY(0.75) scaleX(1.2);
            animation-timing-function: ease-out;
          }
          55% {
            transform: translateX(-170px) translateY(-30px) scaleY(1.1)
              scaleX(0.95);
            animation-timing-function: ease-in;
          }
          60% {
            transform: translateX(-170px) translateY(0) scaleY(0.9) scaleX(1.05);
            animation-timing-function: ease-out;
          }
          70% {
            transform: translateX(-170px) translateY(8px) scaleY(0.85)
              scaleX(1.1);
            animation-timing-function: cubic-bezier(0.2, 0, 0.8, 0.2);
          }
          75% {
            transform: translateX(-100px) translateY(-90px) scaleY(1.15)
              scaleX(0.9);
            animation-timing-function: cubic-bezier(0.7, 0.05, 0.85, 0.4);
          }
          82% {
            transform: translateX(-50px) translateY(-120px) scaleY(1.2)
              scaleX(0.85);
            animation-timing-function: cubic-bezier(0.4, 0.1, 0.7, 0.3);
          }
          90% {
            transform: translateX(0) translateY(0) scaleY(0.8) scaleX(1.1);
            animation-timing-function: ease-out;
          }
          95% {
            transform: translateX(0) translateY(0) scaleY(1.05) scaleX(0.95);
            animation-timing-function: ease-in-out;
          }
        }

        @keyframes frogJumpSmall {
          0%,
          100% {
            transform: translateX(0) translateY(0) scaleY(1) scaleX(1);
            animation-timing-function: ease-in-out;
          }
          25% {
            transform: translateX(0) translateY(8px) scaleY(0.8) scaleX(1.1);
            animation-timing-function: cubic-bezier(0.2, 0, 0.8, 0.2);
          }
          33% {
            transform: translateX(60px) translateY(-80px) scaleY(1.15)
              scaleX(0.9);
            animation-timing-function: cubic-bezier(0.7, 0.05, 0.85, 0.4);
          }
          40% {
            transform: translateX(100px) translateY(-110px) scaleY(1.2)
              scaleX(0.85);
            animation-timing-function: cubic-bezier(0.4, 0.1, 0.7, 0.3);
          }
          48% {
            transform: translateX(120px) translateY(-60px) scaleY(1.1)
              scaleX(0.9);
            animation-timing-function: cubic-bezier(0.3, 0.4, 0.7, 0.8);
          }
          55% {
            transform: translateX(130px) translateY(0) scaleY(0.75) scaleX(1.2);
            animation-timing-function: ease-out;
          }
          60% {
            transform: translateX(130px) translateY(-20px) scaleY(1.1)
              scaleX(0.95);
            animation-timing-function: ease-in;
          }
          63% {
            transform: translateX(130px) translateY(0) scaleY(0.85) scaleX(1.05);
            animation-timing-function: ease-in-out;
          }
          75% {
            transform: translateX(130px) translateY(6px) scaleY(0.8) scaleX(1.1);
            animation-timing-function: cubic-bezier(0.2, 0, 0.8, 0.2);
          }
          80% {
            transform: translateX(80px) translateY(-70px) scaleY(1.15)
              scaleX(0.9);
            animation-timing-function: cubic-bezier(0.7, 0.05, 0.85, 0.4);
          }
          85% {
            transform: translateX(40px) translateY(-90px) scaleY(1.2)
              scaleX(0.85);
            animation-timing-function: cubic-bezier(0.4, 0.1, 0.7, 0.3);
          }
          92% {
            transform: translateX(0) translateY(0) scaleY(0.75) scaleX(1.15);
            animation-timing-function: ease-out;
          }
          96% {
            transform: translateX(0) translateY(0) scaleY(1.05) scaleX(0.95);
            animation-timing-function: ease-in-out;
          }
        }

        .animate-frog-jump-big {
          animation: frogJumpBig 7s infinite;
          transform-origin: bottom center;
        }

        .animate-frog-jump-small {
          animation: frogJumpSmall 6s infinite;
          transform-origin: bottom center;
        }
      `}</style>
    </div>
  );
};

export default Waitlist;
