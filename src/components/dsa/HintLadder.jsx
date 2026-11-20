"use client";

import { useState } from "react";
import { trackEvent } from "@/libs/analytics";

// Hints revealed one at a time, ending with the key insight — so students
// take the smallest nudge that gets them moving again
export default function HintLadder({ hints = [], insight, timeBox, slug }) {
  const [shown, setShown] = useState(0);
  const steps = [...hints.map((text, i) => ({ label: `Hint ${i + 1}`, text })), ...(insight ? [{ label: "Key insight", text: insight, key: true }] : [])];

  const reveal = () => {
    const next = shown + 1;
    setShown(next);
    trackEvent("walkthrough_hint_reveal", { slug, step: next, of: steps.length });
  };

  return (
    <section aria-label="Hints" className="rounded-lg border border-amber-300/25 bg-amber-300/[0.05] p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-black text-amber-50">Try it first{timeBox ? ` — give it ${timeBox} minutes` : ""}</h2>
        <span className="text-xs font-bold text-amber-100/60">
          {shown}/{steps.length} revealed
        </span>
      </div>
      <p className="mt-1.5 text-sm leading-6 text-amber-50/70">
        Stuck? Take one hint at a time. The struggle is where the pattern sticks.
      </p>

      <ol className="mt-4 space-y-2.5">
        {steps.slice(0, shown).map((step) => (
          <li
            key={step.label}
            className={`rounded-lg border px-3.5 py-2.5 text-sm leading-6 ${
              step.key
                ? "border-emerald-300/35 bg-emerald-300/[0.08] text-emerald-50"
                : "border-white/10 bg-black/20 text-white/85"
            }`}
          >
            <span className={`mr-2 text-xs font-black uppercase tracking-[0.14em] ${step.key ? "text-emerald-200" : "text-amber-200/80"}`}>
              {step.label}
            </span>
            {step.text}
          </li>
        ))}
      </ol>

      {shown < steps.length ? (
        <button
          onClick={reveal}
          className="mt-4 rounded-lg border border-amber-300/35 bg-amber-300/[0.1] px-3.5 py-2 text-sm font-bold text-amber-50 transition hover:border-amber-300/60 hover:bg-amber-300/[0.16]"
        >
          {shown === 0 ? "I'm stuck — show hint 1" : `Show ${steps[shown].label.toLowerCase()}`}
        </button>
      ) : (
        <p className="mt-4 text-sm font-bold text-emerald-200">
          That&apos;s everything. Have another go before reading the full walkthrough below.
        </p>
      )}
    </section>
  );
}
