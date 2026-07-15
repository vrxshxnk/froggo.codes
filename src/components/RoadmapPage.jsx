"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import SignInModal from "@/components/auth/SignInModal";
import { useAuth } from "@/context/AuthContext";
import { roadmapService } from "@/libs/roadmapService";
import { getDefaultRoadmap } from "@/data/roadmaps";

const difficultyStyles = {
  Easy: "bg-emerald-400/10 text-emerald-200 border-emerald-400/30",
  Medium: "bg-amber-400/10 text-amber-200 border-amber-400/30",
  Hard: "bg-rose-400/10 text-rose-200 border-rose-400/30",
  Foundation: "bg-sky-400/10 text-sky-200 border-sky-400/30",
  Core: "bg-violet-400/10 text-violet-200 border-violet-400/30",
  Intermediate: "bg-cyan-400/10 text-cyan-200 border-cyan-400/30",
  Advanced: "bg-orange-400/10 text-orange-200 border-orange-400/30",
  Portfolio: "bg-fuchsia-400/10 text-fuchsia-200 border-fuchsia-400/30",
};

function getDifficultyClass(difficulty) {
  if (difficultyStyles[difficulty]) return difficultyStyles[difficulty];
  if (typeof difficulty === "string" && difficulty.startsWith("CF")) {
    return "bg-indigo-400/10 text-indigo-200 border-indigo-400/30";
  }
  return "bg-white/10 text-white/80 border-white/20";
}

const CheckIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const LockIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path strokeLinecap="round" d="M8 11V8a4 4 0 118 0v3" />
  </svg>
);

const RoadmapPage = ({ slug }) => {
  const { user, loading } = useAuth();
  const [roadmap, setRoadmap] = useState(() => getDefaultRoadmap(slug));
  const [completed, setCompleted] = useState({});
  const [activeModule, setActiveModule] = useState(null);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [progressStatus, setProgressStatus] = useState("idle"); // idle | loading | ready
  const [progressNotice, setProgressNotice] = useState("");
  const [openHints, setOpenHints] = useState({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Mirror of `completed` so rapid toggles never read stale closures.
  const completedRef = useRef({});
  const savedTimerRef = useRef(null);

  const applyCompleted = (next) => {
    completedRef.current = next;
    setCompleted(next);
  };

  useEffect(() => {
    let isMounted = true;

    const loadRoadmap = async () => {
      const nextRoadmap = await roadmapService.getRoadmap(slug);
      if (!isMounted || !nextRoadmap) return;
      setRoadmap(nextRoadmap);
      setActiveModule(nextRoadmap.modules?.[0]?.id || null);
    };

    loadRoadmap();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    let isMounted = true;

    const loadProgress = async () => {
      if (!user?.id || !roadmap?.slug) {
        applyCompleted({});
        setProgressStatus("idle");
        return;
      }

      setProgressStatus("loading");
      const nextProgress = await roadmapService.getProgress(
        user.id,
        roadmap.slug
      );
      if (!isMounted) return;
      applyCompleted(nextProgress);
      setProgressStatus("ready");
    };

    loadProgress();
    return () => {
      isMounted = false;
    };
  }, [user?.id, roadmap?.slug]);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!roadmap?.modules?.length) return undefined;

    let frameId = null;

    const updateActiveModule = () => {
      frameId = null;
      const readingLine = window.innerHeight * 0.34;
      let nextActive = roadmap.modules[0].id;

      roadmap.modules.forEach((module) => {
        const node = document.getElementById(`module-${module.id}`);
        if (!node) return;

        if (node.getBoundingClientRect().top <= readingLine) {
          nextActive = module.id;
        }
      });

      setActiveModule((current) =>
        current === nextActive ? current : nextActive
      );
    };

    const requestUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateActiveModule);
    };

    updateActiveModule();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [roadmap?.modules, roadmap?.slug]);

  useEffect(() => {
    if (!activeModule) return;

    document
      .getElementById(`nav-module-${activeModule}`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [activeModule]);

  // Global "Day N" numbers (DSA) computed from item order.
  const itemNumbers = useMemo(() => {
    const numbers = {};
    let counter = 0;
    roadmap?.modules?.forEach((module) => {
      module.items.forEach((item) => {
        counter += 1;
        numbers[`${module.id}:${item.id}`] = counter;
      });
    });
    return numbers;
  }, [roadmap]);

  const validKeys = useMemo(() => {
    const keys = new Set();
    roadmap?.modules?.forEach((module) => {
      module.items.forEach((item) => keys.add(`${module.id}:${item.id}`));
    });
    return keys;
  }, [roadmap]);

  const totals = useMemo(() => {
    const total = validKeys.size;
    // Only count keys that still exist in the roadmap, so stale saved
    // entries never push the percentage past reality.
    const done = Object.entries(completed).filter(
      ([key, value]) => value && validKeys.has(key)
    ).length;
    const percent = total ? Math.round((done / total) * 100) : 0;
    return { total, done, percent };
  }, [validKeys, completed]);

  const firstIncompleteModuleId = useMemo(() => {
    for (const stage of roadmap?.modules || []) {
      for (const item of stage.items) {
        if (!completed[`${stage.id}:${item.id}`]) return stage.id;
      }
    }
    return roadmap?.modules?.[0]?.id || null;
  }, [roadmap, completed]);

  if (!roadmap) {
    return (
      <main className="min-h-screen bg-[#111111] text-white">
        <div className="mx-auto max-w-5xl px-6 py-32 text-center">
          <h1 className="text-4xl font-black">Roadmap not found</h1>
          <Link href="/" className="mt-6 inline-flex text-emerald-300">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  const isUnlocked = Boolean(user);
  const numberingLabel = roadmap.numbering === "day" ? "Day" : "Step";

  const scrollToModule = (moduleId) => {
    setActiveModule(moduleId);
    document
      .getElementById(`module-${moduleId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePrimaryAction = () => {
    if (!isUnlocked) {
      setIsAuthModalOpen(true);
      return;
    }
    scrollToModule(firstIncompleteModuleId);
  };

  const toggleHint = (key) => {
    if (!isUnlocked) {
      setIsAuthModalOpen(true);
      return;
    }
    setOpenHints((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleItem = async (moduleId, itemId) => {
    if (!user?.id) {
      setIsAuthModalOpen(true);
      return;
    }

    const key = `${moduleId}:${itemId}`;
    const previousValue = Boolean(completedRef.current[key]);
    const nextCompleted = { ...completedRef.current, [key]: !previousValue };

    applyCompleted(nextCompleted);
    setSaveState("saving");
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);

    try {
      await roadmapService.setProgress(user.id, roadmap.slug, nextCompleted);
      setProgressNotice("");
      setSaveState("saved");
      savedTimerRef.current = setTimeout(() => setSaveState("idle"), 2000);
    } catch (error) {
      // Roll back only this item; other in-flight toggles stay intact.
      const rolledBack = { ...completedRef.current, [key]: previousValue };
      applyCompleted(rolledBack);
      setSaveState("error");
      setProgressNotice(
        "That change couldn't be saved. Check your connection and try again."
      );
    }
  };

  const progressStatusText = !isUnlocked
    ? "Sign in to start tracking."
    : progressStatus === "loading"
      ? "Loading your progress..."
      : saveState === "saving"
        ? "Saving..."
        : saveState === "saved"
          ? "Saved — synced to your account."
          : "Progress is synced to your account.";

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_18%_12%,rgba(16,185,129,0.18),transparent_32%),linear-gradient(135deg,#121212_0%,#16201d_46%,#17171d_100%)]">
        <div className="mx-auto max-w-7xl px-6 pt-8 md:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/80 transition hover:border-emerald-300/35 hover:bg-emerald-300/[0.08] hover:text-emerald-100"
          >
            <span aria-hidden="true">&larr;</span>
            Back to Home
          </Link>
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 px-6 pb-12 pt-8 md:grid-cols-[1.05fr_0.95fr] md:px-10 md:pb-16 md:pt-12">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3.5 py-1.5 text-sm font-semibold text-emerald-100">
              {roadmap.eyebrow}
            </div>
            <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-normal md:text-5xl">
              {roadmap.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/72">
              {roadmap.description}
            </p>
            <p className="mt-4 max-w-2xl rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm leading-6 text-white/72">
              {roadmap.freeCopy}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handlePrimaryAction}
                className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-400"
              >
                {isUnlocked && totals.done > 0
                  ? "Continue where you left off"
                  : roadmap.primaryAction}
              </button>
              <a
                href="#roadmap"
                className="rounded-lg border border-white/15 px-5 py-2.5 text-center text-sm font-bold text-white/85 transition hover:border-white/35 hover:bg-white/5"
              >
                View Roadmap
              </a>
            </div>

            {roadmap.crossLink && (
              <Link
                href={roadmap.crossLink.href}
                className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-cyan-200/85 transition hover:text-cyan-100"
              >
                {roadmap.crossLink.label}
                <span aria-hidden="true">&rarr;</span>
              </Link>
            )}
          </div>

          <div className="rounded-lg border border-white/10 bg-[#171717]/86 p-4 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="grid grid-cols-3 gap-3">
              {roadmap.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-3"
                >
                  <div className="text-xl font-black text-white">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/55">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] p-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-emerald-100">
                    Personal progress
                  </div>
                  <div className="mt-1 text-2xl font-black">
                    {totals.percent}%
                  </div>
                </div>
                <div className="text-right text-sm text-white/60">
                  {totals.done} of {totals.total} done
                </div>
              </div>
              <div
                className={`mt-3 h-2.5 overflow-hidden rounded-full bg-black/40 ${
                  progressStatus === "loading" ? "animate-pulse" : ""
                }`}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-amber-300 transition-all duration-500"
                  style={{ width: `${totals.percent}%` }}
                />
              </div>
              <div
                className={`mt-4 text-xs ${
                  saveState === "saved" ? "text-emerald-200/90" : "text-white/55"
                }`}
                aria-live="polite"
              >
                {progressStatusText}
              </div>
              {progressNotice && (
                <div className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.08] px-3 py-2 text-xs leading-5 text-amber-50/85">
                  {progressNotice}
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-2.5">
              {roadmap.heroCallouts.map((callout) => (
                <div
                  key={callout}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white/75"
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.45)]" />
                  {callout}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="roadmap" className="mx-auto max-w-7xl px-6 py-12 md:px-10">
        {!loading && !isUnlocked && (
          <div className="mb-8 rounded-lg border border-amber-300/25 bg-amber-300/[0.08] p-5 text-sm leading-6 text-amber-50">
            Every stage stays visible so you can inspect the full path. Sign in
            to open links, reveal hints, and keep your progress synced to your
            account.
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="h-fit rounded-lg border border-white/10 bg-[#171717]/95 p-4 shadow-xl shadow-black/20 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]">
            <div className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.18em] text-white/55">
              Stages
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-color:rgba(255,255,255,0.16)_transparent] [scrollbar-width:thin] lg:grid lg:max-h-[calc(100vh-8rem)] lg:gap-2 lg:overflow-x-visible lg:overflow-y-auto lg:pb-0 lg:pr-1 lg:[mask-image:linear-gradient(to_bottom,transparent,black_10px,black_calc(100%-10px),transparent)] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-emerald-200/30">
              {roadmap.modules.map((module, index) => {
                const done = module.items.filter(
                  (item) => completed[`${module.id}:${item.id}`]
                ).length;
                const stagePercent = module.items.length
                  ? Math.round((done / module.items.length) * 100)
                  : 0;
                const isActive = activeModule === module.id;

                return (
                  <button
                    key={module.id}
                    id={`nav-module-${module.id}`}
                    onClick={() => scrollToModule(module.id)}
                    className={`group relative min-w-[200px] shrink-0 overflow-hidden rounded-lg border px-3.5 py-2.5 text-left transition lg:min-w-0 lg:shrink ${
                      isActive
                        ? "border-emerald-300/55 bg-emerald-300/[0.1] shadow-[inset_3px_0_0_rgba(110,231,183,0.9)]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`text-xs font-black ${
                          isActive ? "text-emerald-200" : "text-white/50"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-xs text-white/55">
                        {done}/{module.items.length}
                      </span>
                    </div>
                    <div
                      className={`mt-1.5 text-sm font-bold ${
                        isActive ? "text-white" : "text-white/78"
                      }`}
                    >
                      {module.title}
                    </div>
                    <div className="mt-1 text-xs text-white/55">
                      {module.duration}
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/40">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          stagePercent === 100
                            ? "bg-emerald-300"
                            : "bg-emerald-400/60"
                        }`}
                        style={{ width: `${stagePercent}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="grid gap-6">
            {roadmap.modules.map((module, moduleIndex) => {
              const done = module.items.filter(
                (item) => completed[`${module.id}:${item.id}`]
              ).length;
              const stageComplete =
                module.items.length > 0 && done === module.items.length;

              return (
                <article
                  key={module.id}
                  id={`module-${module.id}`}
                  className="scroll-mt-8 overflow-hidden rounded-lg border border-white/10 bg-[#171717] shadow-xl shadow-black/15"
                >
                  <div className="border-b border-white/10 bg-white/[0.03] p-4 md:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-sm font-black text-emerald-200">
                          Stage {moduleIndex + 1} / {roadmap.modules.length}
                          {module.duration ? (
                            <span className="ml-3 font-bold text-white/45">
                              {module.duration}
                            </span>
                          ) : null}
                        </div>
                        <h2 className="mt-2 text-xl font-black md:text-2xl">
                          {module.title}
                        </h2>
                        <p className="mt-2.5 max-w-3xl text-sm leading-6 text-white/65">
                          {module.focus}
                        </p>
                        {module.guide ? (
                          <Link
                            href={module.guide}
                            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-300 transition hover:text-emerald-200 hover:underline"
                          >
                            Read the full build guide
                            <span aria-hidden="true">→</span>
                          </Link>
                        ) : null}
                      </div>
                      <div
                        className={`min-w-32 rounded-lg border px-3.5 py-2.5 text-sm ${
                          stageComplete
                            ? "border-emerald-300/40 bg-emerald-300/[0.08] text-emerald-100"
                            : "border-white/10 bg-black/20 text-white/70"
                        }`}
                      >
                        {stageComplete ? (
                          <span className="font-black">Stage complete</span>
                        ) : (
                          <>
                            <span className="font-black text-white">{done}</span>
                            /{module.items.length} complete
                          </>
                        )}
                      </div>
                    </div>
                    <p className="mt-4 rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] p-3.5 text-sm leading-6 text-cyan-50/85">
                      {module.interviewCopy}
                    </p>
                  </div>

                  <div className="divide-y divide-white/10">
                    {module.items.map((item, itemIndex) => {
                      const key = `${module.id}:${item.id}`;
                      const isDone = Boolean(completed[key]);
                      const itemNumber =
                        roadmap.numbering === "day"
                          ? itemNumbers[key]
                          : itemIndex + 1;
                      const hintOpen = Boolean(openHints[key]);

                      return (
                        <div
                          key={item.id}
                          className={`grid gap-4 p-4 transition md:grid-cols-[auto_1fr_auto] md:items-center md:p-5 ${
                            isDone ? "bg-emerald-300/[0.035]" : ""
                          }`}
                        >
                          <button
                            onClick={() => toggleItem(module.id, item.id)}
                            aria-pressed={isDone}
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition ${
                              isDone
                                ? "border-emerald-300 bg-emerald-500 text-white"
                                : isUnlocked
                                  ? "border-white/15 bg-white/[0.03] text-white/20 hover:border-emerald-300/50 hover:text-emerald-200/70"
                                  : "border-white/10 bg-white/[0.025] text-white/40 hover:border-amber-300/40 hover:text-amber-100"
                            }`}
                            aria-label={
                              isUnlocked
                                ? `Mark ${item.title} ${
                                    isDone ? "incomplete" : "complete"
                                  }`
                                : "Sign in to track this item"
                            }
                          >
                            {!isUnlocked && !isDone ? (
                              <LockIcon />
                            ) : (
                              <CheckIcon />
                            )}
                          </button>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-emerald-300/25 bg-emerald-300/[0.08] px-2 py-0.5 text-xs font-black text-emerald-100">
                                {numberingLabel} {itemNumber}
                              </span>
                              <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">
                                {item.source}
                              </span>
                              <span
                                className={`rounded-full border px-2 py-0.5 text-xs font-bold ${getDifficultyClass(
                                  item.difficulty
                                )}`}
                              >
                                {item.difficulty}
                              </span>
                            </div>
                            <h3 className="mt-1.5 text-base font-black text-white">
                              {item.title}
                            </h3>
                            <div className="mt-2.5 flex flex-wrap gap-2">
                              {item.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-white/60"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            {item.hint && isUnlocked && hintOpen && (
                              <div className="mt-3 rounded-lg border border-cyan-300/20 bg-cyan-300/[0.05] px-3.5 py-2.5 text-sm leading-6 text-cyan-50/90">
                                <span className="mr-2 font-black uppercase tracking-[0.14em] text-cyan-200/80 text-xs">
                                  Hint
                                </span>
                                {item.hint}
                              </div>
                            )}
                          </div>

                          {!isUnlocked ? (
                            <button
                              onClick={() => setIsAuthModalOpen(true)}
                              className="rounded-lg border border-amber-300/25 bg-amber-300/[0.06] px-3.5 py-1.5 text-sm font-bold text-amber-50/80 transition hover:border-amber-300/45 hover:bg-amber-300/[0.1] hover:text-amber-50"
                            >
                              Sign in
                            </button>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-lg border border-white/15 px-3.5 py-1.5 text-center text-sm font-bold text-white/80 transition hover:border-emerald-300/50 hover:bg-emerald-300/[0.08]"
                                >
                                  Open
                                </a>
                              )}
                              {item.hint && (
                                <button
                                  onClick={() => toggleHint(key)}
                                  aria-expanded={hintOpen}
                                  className={`rounded-lg border px-3.5 py-1.5 text-sm font-bold transition ${
                                    hintOpen
                                      ? "border-cyan-300/50 bg-cyan-300/[0.1] text-cyan-100"
                                      : "border-white/15 text-white/80 hover:border-cyan-300/50 hover:bg-cyan-300/[0.08]"
                                  }`}
                                >
                                  {hintOpen ? "Hide hint" : "Show hint"}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <SignInModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        redirectOnSuccess={false}
      />
    </main>
  );
};

export default RoadmapPage;
