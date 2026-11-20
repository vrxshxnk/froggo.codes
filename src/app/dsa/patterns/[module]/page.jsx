import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown, { headingsOf } from "@/components/dsa/Markdown";
import TrackView from "@/components/dsa/TrackView";
import { getPrimer, getPrimerIds } from "@/libs/dsaContent";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPrimerIds().map((module) => ({ module }));
}

export async function generateMetadata({ params }) {
  const { module } = await params;
  const primer = getPrimer(module);
  if (!primer) return {};
  const title = `${primer.title} Pattern — The Ideas Behind the Problems | FroggoCodes`;
  return {
    title,
    description: primer.summary,
    alternates: { canonical: `/dsa/patterns/${module}` },
    openGraph: { type: "article", siteName: "FroggoCodes", title, description: primer.summary, url: `/dsa/patterns/${module}` },
  };
}

export default async function PrimerPage({ params }) {
  const { module } = await params;
  const primer = getPrimer(module);
  if (!primer) notFound();
  const toc = headingsOf(primer.content);

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <TrackView event="primer_view" params={{ module }} />
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.14),transparent_34%),linear-gradient(135deg,#121212_0%,#16201d_46%,#17171d_100%)]">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 md:px-10 md:pb-12">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-white/55">
            <Link href="/dsa" className="font-semibold hover:text-emerald-200">DSA Roadmap</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/75">Pattern primer</span>
          </nav>
          <div className="mt-6 text-sm font-black text-cyan-200">
            Pattern primer · {primer.readTime} min read{primer.duration ? ` · ${primer.duration}` : ""}
          </div>
          <h1 className="mt-2 text-3xl font-black leading-tight md:text-5xl">{primer.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/75">{primer.summary}</p>
          {primer.firstProblem && (
            <Link href={primer.firstProblem.href} className="mt-6 inline-flex rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-black text-white transition hover:bg-emerald-400">
              Start with {primer.firstProblem.title} →
            </Link>
          )}
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-6 md:px-10 lg:grid-cols-[minmax(0,1fr)_240px]">
        <article className="min-w-0 pb-6">
          <Markdown>{primer.content}</Markdown>

          <section className="mt-12">
            <h2 className="text-xl font-black md:text-2xl">Walkthroughs in this stage</h2>
            <ul className="mt-4 divide-y divide-white/10 overflow-hidden rounded-lg border border-white/10">
              {primer.problems.map((p) => (
                <li key={p.id}>
                  {p.href ? (
                    <Link href={p.href} className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-emerald-300/[0.05]">
                      <span><span className="mr-3 text-xs font-bold text-white/45">{p.dayLabel.replace(/ of \d+$/, "")}</span><span className="font-bold">{p.title}</span></span>
                      <span className="text-sm font-bold text-emerald-300">Read →</span>
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between gap-3 px-4 py-3 text-white/55">
                      <span><span className="mr-3 text-xs font-bold">{p.dayLabel.replace(/ of \d+$/, "")}</span>{p.title}</span>
                      <span className="text-xs">Coming soon</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
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
