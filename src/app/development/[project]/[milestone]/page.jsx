import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown, { headingsOf } from "@/components/dsa/Markdown";
import TrackView from "@/components/dsa/TrackView";
import DoneChecklist from "@/components/dev/DoneChecklist";
import { getDevMilestone, getDevMilestoneParams } from "@/libs/devContent";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDevMilestoneParams();
}

export async function generateMetadata({ params }) {
  const { project, milestone } = await params;
  const m = getDevMilestone(project, milestone);
  if (!m) return {};
  const title = `${m.title} — ${m.project.name.split(" — ")[0]} Step ${m.step} | FroggoCodes`;
  const url = `/development/${project}/${milestone}`;
  return {
    title,
    description: m.summary,
    alternates: { canonical: url },
    openGraph: { type: "article", siteName: "FroggoCodes", title, description: m.summary, url },
  };
}

function StepNav({ link, direction, projectId }) {
  if (!link) {
    return direction === "next" ? (
      <Link href={`/development/${projectId}`} className="group rounded-lg border border-white/10 bg-white/[0.03] p-4 text-right transition hover:border-emerald-300/40">
        <div className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">Last step</div>
        <div className="mt-1 font-black text-white group-hover:text-emerald-100">Back to the project brief →</div>
      </Link>
    ) : (
      <div />
    );
  }
  const body = (
    <>
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
        {direction === "next" ? `Next · Step ${link.step} →` : `← Step ${link.step}`}
      </div>
      <div className="mt-1 font-black text-white group-hover:text-emerald-100">{link.title}</div>
      {!link.href && <div className="mt-1 text-xs text-white/45">Guide coming soon</div>}
    </>
  );
  const cls = `group rounded-lg border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-300/40 hover:bg-emerald-300/[0.05] ${direction === "next" ? "text-right" : ""}`;
  return link.href ? <Link href={link.href} className={cls}>{body}</Link> : <div className={cls}>{body}</div>;
}

export default async function MilestonePage({ params }) {
  const { project: projectId, milestone } = await params;
  const m = getDevMilestone(projectId, milestone);
  if (!m) notFound();
  const projectName = m.project.name.split(" — ")[0];
  const sections = headingsOf(m.content);
  const toc = [
    ...sections.filter((h) => h.id !== "stretch-goals"),
    { text: "Done when", id: "done-when" },
    ...sections.filter((h) => h.id === "stretch-goals"),
    { text: "Go deeper", id: "go-deeper" },
  ];
  // Put "Done when" right after the interview section, before stretch goals
  const [main, stretch = ""] = m.content.split(/^(?=## Stretch goals$)/m);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: m.title,
    description: m.summary,
    url: `https://www.froggo.codes/development/${projectId}/${milestone}`,
    step: [...m.content.matchAll(/^### Step \d+: (.+)$/gm)].map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s[1].replace(/[`*]/g, "") })),
    isPartOf: { "@type": "Course", name: "FroggoCodes Development Roadmap", url: "https://www.froggo.codes/development" },
  };

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <TrackView event="dev_milestone_view" params={{ project: projectId, milestone }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_18%_12%,rgba(16,185,129,0.16),transparent_34%),linear-gradient(135deg,#121212_0%,#16201d_46%,#17171d_100%)]">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 md:px-10 md:pb-12">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/55">
            <Link href="/development" className="font-semibold hover:text-emerald-200">Development Roadmap</Link>
            <span aria-hidden="true">/</span>
            {m.project.hasBrief ? (
              <Link href={`/development/${projectId}`} className="font-semibold hover:text-emerald-200">Project {m.project.number} · {projectName}</Link>
            ) : (
              <span>Project {m.project.number} · {projectName}</span>
            )}
            <span aria-hidden="true">/</span>
            <span className="text-white/75">Step {m.step}</span>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-300/25 bg-emerald-300/[0.08] px-2.5 py-0.5 text-xs font-black text-emerald-100">
              Step {m.step} of {m.stepCount}
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-bold text-white/80">{m.item.difficulty}</span>
            {m.item.tags.map((t) => (
              <span key={t} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-white/60">{t}</span>
            ))}
          </div>
          <h1 className="mt-3 text-3xl font-black leading-tight md:text-5xl">{m.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/75">{m.summary}</p>
          <dl className="mt-6 grid max-w-xl grid-cols-2 gap-3 text-sm">
            {[
              ["Project", projectName],
              ["Time", m.time],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2.5">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">{label}</dt>
                <dd className="mt-1 font-bold text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-6 md:px-10 lg:grid-cols-[minmax(0,1fr)_240px]">
        <article className="min-w-0 pb-6">
          <p className="mt-6 rounded-lg border border-amber-300/25 bg-amber-300/[0.05] px-4 py-3 text-sm leading-6 text-amber-50/85">
            <span className="font-black text-amber-100">You write the code.</span> This guide explains the ideas, the order of work and the traps. It never hands you the finished code, because building it yourself is the point.
          </p>

          <Markdown>{main}</Markdown>

          <DoneChecklist items={m.doneWhen} storageKey={`froggo-dev-check:${projectId}/${milestone}`} projectId={projectId} milestoneId={milestone} />

          {stretch && <Markdown>{stretch}</Markdown>}

          <section className="mt-12">
            <h2 id="go-deeper" className="scroll-mt-24 text-xl font-black md:text-2xl">Go deeper</h2>
            <p className="mt-3 leading-7 text-white/70">The official docs for everything in this step.</p>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {m.docs.map((d) => (
                <li key={d.url}>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex h-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white transition hover:border-emerald-300/40">
                    <span>{d.label}</span>
                    <span aria-hidden="true" className="text-emerald-300">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <nav aria-label="Milestone navigation" className="mt-12 grid gap-3 sm:grid-cols-2">
            <StepNav link={m.prev} direction="prev" projectId={projectId} />
            <StepNav link={m.next} direction="next" projectId={projectId} />
          </nav>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-6 pt-6">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.14em] text-white/45">On this page</div>
              <ul className="mt-3 space-y-1.5 border-l border-white/10 text-sm">
                {toc.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="-ml-px block border-l border-transparent pl-3 text-white/60 transition hover:border-emerald-300 hover:text-white">{h.text}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-[0.14em] text-white/45">{projectName}</div>
              <ol className="mt-3 space-y-1 text-sm">
                {m.milestones.map((s) => (
                  <li key={s.id}>
                    {s.href ? (
                      <Link href={s.href} aria-current={s.id === milestone ? "page" : undefined} className={`block rounded px-2 py-1 transition ${s.id === milestone ? "bg-emerald-300/[0.1] font-bold text-emerald-100" : "text-white/60 hover:text-white"}`}>
                        {s.step}. {s.title}
                      </Link>
                    ) : (
                      <span className="block px-2 py-1 text-white/35">{s.step}. {s.title}</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
