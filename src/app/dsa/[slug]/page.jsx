import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown, { headingsOf } from "@/components/dsa/Markdown";
import CodeTabs from "@/components/dsa/CodeTabs";
import HintLadder from "@/components/dsa/HintLadder";
import TrackView from "@/components/dsa/TrackView";
import { getProblem, getProblemSlugs } from "@/libs/dsaContent";
import { highlight } from "@/libs/highlight";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProblemSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const problem = getProblem(slug);
  if (!problem) return {};
  const title = `${problem.title} — Explained Simply, with Code in Python, C++, Java & JS | FroggoCodes`;
  const description = `${problem.summary} Hints, intuition, a dry run, ${problem.time} solution and interview tips — ${problem.dayLabel} of the free DSA roadmap.`;
  return {
    title,
    description,
    alternates: { canonical: `/dsa/${slug}` },
    openGraph: { type: "article", siteName: "FroggoCodes", title, description, url: `/dsa/${slug}` },
  };
}

const difficultyStyles = {
  Easy: "bg-emerald-400/10 text-emerald-200 border-emerald-400/30",
  Medium: "bg-amber-400/10 text-amber-200 border-amber-400/30",
  Hard: "bg-rose-400/10 text-rose-200 border-rose-400/30",
};
const difficultyClass = (d) =>
  difficultyStyles[d] || (String(d).startsWith("CF") ? "bg-indigo-400/10 text-indigo-200 border-indigo-400/30" : "bg-white/10 text-white/80 border-white/20");

function NavCard({ link, direction }) {
  if (!link) return <div />;
  return (
    <Link
      href={link.href}
      className={`group rounded-lg border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-300/40 hover:bg-emerald-300/[0.05] ${direction === "next" ? "text-right" : ""}`}
    >
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
        {direction === "next" ? "Next →" : "← Previous"} · {link.dayLabel.replace(/ of \d+$/, "")}
      </div>
      <div className="mt-1 font-black text-white group-hover:text-emerald-100">{link.title}</div>
      {!link.hasWalkthrough && <div className="mt-1 text-xs text-white/45">Walkthrough coming soon</div>}
    </Link>
  );
}

export default async function WalkthroughPage({ params }) {
  const { slug } = await params;
  const problem = getProblem(slug);
  if (!problem) notFound();

  const tabs = await Promise.all(
    problem.code.map(async (c) => ({ id: c.id, label: c.label, source: c.source, html: await highlight(c.source, c.id) }))
  );
  const toc = [...headingsOf(problem.before), { text: "The code", id: "the-code" }, ...headingsOf(problem.after)];
  const sourceLabel = problem.item.source === "Codeforces" ? "Solve on Codeforces" : "Solve on LeetCode";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${problem.title} — explained`,
    description: problem.summary,
    url: `https://www.froggo.codes/dsa/${slug}`,
    proficiencyLevel: problem.item.difficulty,
    about: problem.pattern,
    isPartOf: { "@type": "Course", name: "FroggoCodes 90-Day DSA Roadmap", url: "https://www.froggo.codes/dsa" },
    publisher: { "@type": "Organization", name: "FroggoCodes", url: "https://www.froggo.codes" },
  };

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <TrackView event="walkthrough_view" params={{ slug, day: problem.day, module: problem.module.id }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_18%_12%,rgba(16,185,129,0.16),transparent_34%),linear-gradient(135deg,#121212_0%,#16201d_46%,#17171d_100%)]">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 md:px-10 md:pb-12">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/55">
            <Link href="/dsa" className="font-semibold hover:text-emerald-200">DSA Roadmap</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/dsa#module-${problem.module.id}`} className="font-semibold hover:text-emerald-200">{problem.module.title}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/75">{problem.dayLabel}</span>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-300/25 bg-emerald-300/[0.08] px-2.5 py-0.5 text-xs font-black text-emerald-100">
              {problem.dayLabel}
            </span>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${difficultyClass(problem.item.difficulty)}`}>
              {problem.item.difficulty}
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">{problem.item.source}</span>
          </div>
          <h1 className="mt-3 text-3xl font-black leading-tight md:text-5xl">{problem.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/75">{problem.summary}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={problem.item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
            >
              {sourceLabel} ↗
            </a>
            <Link
              href={`/dsa#module-${problem.module.id}`}
              className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-bold text-white/85 transition hover:border-emerald-300/45 hover:bg-emerald-300/[0.06]"
            >
              Back to the roadmap
            </Link>
          </div>

          <dl className="mt-7 grid max-w-2xl grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {[
              ["Pattern", problem.pattern],
              ["Time box", `${problem.timeBox} min`],
              ["Time", problem.time],
              ["Space", problem.space],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2.5">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">{label}</dt>
                <dd className="mt-1 font-bold text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:px-10 lg:grid-cols-[minmax(0,1fr)_240px]">
        <article className="min-w-0">
          <HintLadder hints={problem.hints} insight={problem.insight} timeBox={problem.timeBox} slug={slug} />

          <Markdown>{problem.before}</Markdown>

          <h2 id="the-code" className="mt-12 scroll-mt-24 text-xl font-black md:text-2xl">The code</h2>
          <p className="mt-3 leading-7 text-white/70">
            Every solution below is tested against the examples and edge cases before it ships. Pick your language — we&apos;ll remember it.
          </p>
          <CodeTabs tabs={tabs} slug={slug} />

          <Markdown>{problem.after}</Markdown>

          {problem.related.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-black md:text-2xl">Practise the same idea</h2>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {problem.related.map((r) => (
                  <li key={r.id}>
                    <Link href={r.href} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-emerald-300/40">
                      <span>
                        <span className="block text-xs font-bold text-white/45">{r.dayLabel.replace(/ of \d+$/, "")}</span>
                        <span className="font-bold text-white">{r.title}</span>
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${difficultyClass(r.difficulty)}`}>{r.difficulty}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <nav aria-label="Roadmap navigation" className="mt-12 grid gap-3 sm:grid-cols-2">
            <NavCard link={problem.prev} direction="prev" />
            <NavCard link={problem.next} direction="next" />
          </nav>

          <section className="mt-10 rounded-lg border border-emerald-300/25 bg-emerald-300/[0.06] p-5 md:p-6">
            <h2 className="text-lg font-black">
              {problem.isBonus ? "This is a bonus day of the free DSA plan 🐸" : `This is Day ${problem.day} of a free 90-day plan 🐸`}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/75">
              90 problems in the order that builds on itself, one a day, with a walkthrough like this for each. Tick them off and keep your streak.
            </p>
            <Link href="/dsa" className="mt-4 inline-flex rounded-lg bg-emerald-500 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-400">
              Get the full roadmap — free
            </Link>
          </section>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-6">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.14em] text-white/45">On this page</div>
              <ul className="mt-3 space-y-1.5 border-l border-white/10 text-sm">
                {toc.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="-ml-px block border-l border-transparent pl-3 text-white/60 transition hover:border-emerald-300 hover:text-white">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {problem.hasPrimer && (
              <Link href={`/dsa/patterns/${problem.module.id}`} className="block rounded-lg border border-cyan-300/25 bg-cyan-300/[0.05] p-3.5 text-sm transition hover:border-cyan-300/45">
                <span className="block text-xs font-black uppercase tracking-[0.14em] text-cyan-200/80">Pattern primer</span>
                <span className="mt-1 block font-bold text-white">{problem.module.title}: the ideas behind this stage →</span>
              </Link>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
