"use client";

import { useEffect, useRef, useState } from "react";
import { locationService } from "@/libs/locationService";

// Newsletter consent for every email/sign-in form. Ticked by default,
// except where marketing consent must be an explicit opt-in (EU/UK/EEA/CH)
// or the country couldn't be determined — there it starts unticked.
export function useNewsletterConsent(active = true) {
  const [needsConsent, setNeedsConsent] = useState(true);
  const [optIn, setOptInState] = useState(false);
  const touched = useRef(false);

  useEffect(() => {
    if (!active) return undefined;
    let live = true;

    locationService
      .requiresMarketingConsent()
      .then((needs) => {
        if (!live) return;
        setNeedsConsent(needs);
        // Never override a box the visitor already clicked
        if (!touched.current) setOptInState(!needs);
      })
      .catch(() => {
        if (live) setNeedsConsent(true);
      });

    return () => {
      live = false;
    };
  }, [active]);

  const setOptIn = (value) => {
    touched.current = true;
    setOptInState(value);
  };

  return { needsConsent, optIn, setOptIn };
}

export default function NewsletterCheckbox({ checked, onChange, className = "" }) {
  return (
    <label
      className={`flex items-start gap-2.5 text-left text-xs text-white/60 cursor-pointer ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 accent-emerald-500"
      />
      <span>
        Send me the FroggoCodes newsletter — roadmap updates and practical
        insights on coding, AI, and shipping products. No spam, unsubscribe
        anytime.
      </span>
    </label>
  );
}
