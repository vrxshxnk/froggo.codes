"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/libs/analytics";

// "Done when" self-check for a milestone. Ticks are a per-browser convenience
// (localStorage); real progress lives on the roadmap for signed-in users.
export default function DoneChecklist({ items = [], storageKey, projectId, milestoneId }) {
  const [checked, setChecked] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(saved)) setChecked(saved.filter((i) => Number.isInteger(i) && i < items.length));
    } catch {
      // storage blocked or corrupt: start empty
    }
  }, [storageKey, items.length]);

  const toggle = (i) => {
    const next = checked.includes(i) ? checked.filter((x) => x !== i) : [...checked, i];
    setChecked(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore
    }
    if (next.length === items.length && checked.length < items.length) trackEvent("dev_milestone_selfcheck_done", { project: projectId, milestone: milestoneId });
  };

  const allDone = items.length > 0 && checked.length === items.length;

  return (
    <section id="done-when" aria-labelledby="done-when-heading" className="mt-12 scroll-mt-24 rounded-lg border border-emerald-300/25 bg-emerald-300/[0.05] p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="done-when-heading" className="text-xl font-black md:text-2xl">Done when</h2>
        <span className="text-xs font-bold text-emerald-100/60">
          {checked.length}/{items.length} checked
        </span>
      </div>
      <p className="mt-1.5 text-sm leading-6 text-white/65">Test each one yourself. If one fails, you&apos;re not done yet, and that&apos;s fine.</p>
      <ul className="mt-4 space-y-2">
        {items.map((text, i) => {
          const on = checked.includes(i);
          return (
            <li key={i}>
              <label className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-2.5 text-sm leading-6 transition ${on ? "border-emerald-300/40 bg-emerald-300/[0.08] text-emerald-50" : "border-white/10 bg-black/20 text-white/85 hover:border-emerald-300/30"}`}>
                <input type="checkbox" checked={on} onChange={() => toggle(i)} className="mt-1 h-4 w-4 shrink-0 accent-emerald-500" />
                <span className={on ? "line-through decoration-emerald-300/50" : ""}>{text}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {allDone && (
        <p className="mt-4 text-sm font-bold text-emerald-100">
          Milestone done 🐸{" "}
          <Link href={`/development#module-${projectId}`} className="text-emerald-300 underline-offset-4 hover:underline">
            Tick it off on the roadmap →
          </Link>
        </p>
      )}
    </section>
  );
}
