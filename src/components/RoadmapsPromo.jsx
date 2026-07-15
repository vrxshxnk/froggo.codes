import Link from "next/link";

const roadmapCards = [
  {
    href: "/dsa",
    eyebrow: "90 Days. 90 Problems.",
    title: "The DSA Roadmap",
    description:
      "One problem a day for 90 days — the FAANG-repeated LeetCode patterns in the right order, with Codeforces mixed in so you solve, not memorize.",
    highlights: ["90 curated problems", "1 problem a day", "LeetCode + Codeforces"],
    cta: "Start Day 1",
  },
  {
    href: "/development",
    eyebrow: "Build. Don't Copy.",
    title: "The Development Roadmap",
    description:
      "Six projects of increasing depth, ending at a FAANG-level capstone. You get milestones, structure, and hints — never the code. Every line is yours.",
    highlights: ["6 real projects", "Step-by-step hints", "FAANG-level capstone"],
    cta: "Start Project 1",
  },
];

const RoadmapsPromo = () => {
  return (
    <section id="roadmaps" className="bg-[#181818] px-8 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-sm font-semibold text-emerald-300">
            100% Free — Sign in to track progress
          </span>
          <h2 className="mt-5 text-3xl font-extrabold text-white md:text-4xl">
            Two free roadmaps. Zero excuses.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            Not ready for the bootcamp yet? Start here. Both roadmaps are free
            forever, and your progress syncs to your account.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {roadmapCards.map((card) => (
            <div
              key={card.href}
              className="group flex flex-col rounded-xl border border-white/10 bg-[#1f1f1f] p-7 transition hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-950/30"
            >
              <div className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-300">
                {card.eyebrow}
              </div>
              <h3 className="mt-3 text-2xl font-extrabold text-white">
                {card.title}
              </h3>
              <p className="mt-3 flex-1 text-base leading-7 text-white/70">
                {card.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {card.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-full bg-white/[0.06] px-3 py-1 text-sm text-white/70"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
              <Link
                href={card.href}
                className="mt-7 inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition group-hover:bg-emerald-500"
              >
                {card.cta}
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoadmapsPromo;
