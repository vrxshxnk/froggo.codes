import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown, { headingsOf } from "@/components/dsa/Markdown";
import TrackView from "@/components/dsa/TrackView";
import { getDevBriefIds, getDevProject } from "@/libs/devContent";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDevBriefIds().map((project) => ({ project }));
}

export async function generateMetadata({ params }) {
  const { project: id } = await params;
  const project = getDevProject(id);
  if (!project) return {};
  const title = `Build ${project.name}: ${project.tagline} | FroggoCodes`;
  return {
    title,
    description: project.summary,
    alternates: { canonical: `/development/${id}` },
    openGraph: { type: "article", siteName: "FroggoCodes", title, description: project.summary, url: `/development/${id}` },
  };
}

function ProjectNav({ link, direction }) {
  if (!link) return <div />;
  return (
    <Link
      href={link.href}
      className={`group rounded-lg border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-300/40 hover:bg-emerald-300/[0.05] ${direction === "next" ? "text-right" : ""}`}
    >
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
        {direction === "next" ? "Next project →" : "← Previous project"}
      </div>
      <div className="mt-1 font-black text-white group-hover:text-emerald-100">{link.name}</div>
    </Link>
  );
}

export default async function ProjectBriefPage({ params }) {
  const { project: id } = await params;
  const project = getDevProject(id);
  if (!project) notFound();
  const first = project.milestones.find((m) => m.href);
  const toc = [...headingsOf(project.content), { text: "The milestones", id: "the-milestones" }];

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <TrackView event="dev_brief_view" params={{ project: id }} />
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_18%_12%,rgba(16,185,129,0.16),transparent_34%),linear-gradient(135deg,#121212_0%,#16201d_46%,#17171d_100%)]">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 md:px-10 md:pb-12">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-white/55">
            <Link href="/development" className="font-semibold hover:text-emerald-200">Development Roadmap</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/75">Project {project.number}</span>
          </nav>
          <div className="mt-6 text-sm font-black text-emerald-200">
            Project {project.number} of {project.total}
            <span className="ml-3 font-bold text-white/45">{project.time}</span>
          </div>
          <h1 className="mt-2 text-3xl font-black leading-tight md:text-5xl">{project.name}</h1>
          <p className="mt-2 text-lg font-bold text-white/80">{project.tagline}</p>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/75">{project.summary}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {first && (
              <Link href={first.href} className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400">
                Start milestone 1 →
              </Link>
            )}
            <Link href={`/development#module-${id}`} className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-bold text-white/85 transition hover:border-emerald-300/45 hover:bg-emerald-300/[0.06]">
              Track it on the roadmap
            </Link>
          </div>
          <p className="mt-6 max-w-3xl rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] p-3.5 text-sm leading-6 text-cyan-50/85">{project.module.interviewCopy}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-6 md:px-10 lg:grid-cols-[minmax(0,1fr)_240px]">
        <article className="min-w-0 pb-6">
          <Markdown>{project.content}</Markdown>

          <section className="mt-12">
            <h2 id="the-milestones" className="scroll-mt-24 text-xl font-black md:text-2xl">The milestones</h2>
            <p className="mt-3 leading-7 text-white/70">Do them in order. Each guide explains the concepts and the steps, and ends with a checklist so you know when you&apos;re done. You write all the code.</p>
            <ol className="mt-4 divide-y divide-white/10 overflow-hidden rounded-lg border border-white/10">
              {project.milestones.map((m) => (
                <li key={m.id}>
                  {m.href ? (
                    <Link href={m.href} className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-emerald-300/[0.05]">
                      <span className="min-w-0">
                        <span className="mr-3 text-xs font-bold text-white/45">Step {m.step}</span>
                        <span className="font-bold">{m.title}</span>
                        {m.time && <span className="ml-2 text-xs text-white/45">· {m.time}</span>}
                      </span>
                      <span className="shrink-0 text-sm font-bold text-emerald-300">Guide →</span>
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between gap-3 px-4 py-3 text-white/55">
                      <span><span className="mr-3 text-xs font-bold">Step {m.step}</span>{m.title}</span>
                      <span className="text-xs">Coming soon</span>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </section>

          {project.module.guide && (
            <p className="mt-8 text-sm leading-6 text-white/65">
              Want the thinking behind the design?{" "}
              <Link href={project.module.guide} className="font-semibold text-emerald-300 underline-offset-4 hover:underline">Read the long-form essay on {project.name} →</Link>
            </p>
          )}

          <nav aria-label="Project navigation" className="mt-12 grid gap-3 sm:grid-cols-2">
            <ProjectNav link={project.prev} direction="prev" />
            <ProjectNav link={project.next} direction="next" />
          </nav>
        </article>
        <aside className="hidden lg:block">
          <div className="sticky top-6 pt-6">
            <div className="text-xs font-black uppercase tracking-[0.14em] text-white/45">On this page</div>
            <ul className="mt-3 space-y-1.5 border-l border-white/10 text-sm">
              {toc.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="-ml-px block border-l border-transparent pl-3 text-white/60 transition hover:border-emerald-300 hover:text-white">{h.text}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
