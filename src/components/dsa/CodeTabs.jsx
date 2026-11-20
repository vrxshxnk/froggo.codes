"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/libs/analytics";

const STORAGE_KEY = "froggo_code_lang";

export default function CodeTabs({ tabs, slug }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && tabs.some((t) => t.id === saved)) setActive(saved);
    } catch {}
  }, [tabs]);

  const choose = (id) => {
    setActive(id);
    setCopied(false);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
    trackEvent("walkthrough_language", { slug, language: id });
  };

  const current = tabs.find((t) => t.id === active) || tabs[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(current.source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      trackEvent("walkthrough_copy_code", { slug, language: current.id });
    } catch {}
  };

  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-[#0d1117]">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-white/[0.03] px-2">
        <div role="tablist" aria-label="Solution language" className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={tab.id === current.id}
              onClick={() => choose(tab.id)}
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-bold transition ${
                tab.id === current.id
                  ? "border-emerald-400 text-white"
                  : "border-transparent text-white/50 hover:text-white/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={copy}
          className="shrink-0 rounded-md border border-white/10 px-2.5 py-1 text-xs font-bold text-white/70 transition hover:border-emerald-300/40 hover:text-emerald-100"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          hidden={tab.id !== current.id}
          className="code-block text-[13px] leading-6"
          dangerouslySetInnerHTML={{ __html: tab.html }}
        />
      ))}
    </div>
  );
}
