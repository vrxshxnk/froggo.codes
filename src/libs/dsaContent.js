// Server-only loader for DSA walkthroughs (content/dsa/problems/<slug>/) and
// pattern primers (content/dsa/patterns/<moduleId>.md). Everything here runs
// at build time — the pages that use it are statically generated.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { defaultRoadmaps } from "@/data/roadmaps";

const PROBLEMS_DIR = path.join(process.cwd(), "content/dsa/problems");
const PATTERNS_DIR = path.join(process.cwd(), "content/dsa/patterns");
const CODE_MARKER = "{{code}}";

export const LANGUAGES = [
  { id: "python", label: "Python", file: "solution.py" },
  { id: "cpp", label: "C++", file: "solution.cpp" },
  { id: "java", label: "Java", file: "solution.java" },
  { id: "javascript", label: "JavaScript", file: "solution.js" },
];

// Every roadmap item in order, with its day number (bonus days continue at 91)
function roadmapIndex() {
  const roadmap = defaultRoadmaps.dsa;
  const mainCount = roadmap.modules.reduce((n, m) => n + m.items.length, 0);
  const entries = [];
  let day = 0;
  for (const mod of [...roadmap.modules, ...(roadmap.bonus?.modules || [])]) {
    mod.items.forEach((item, indexInModule) => {
      day += 1;
      entries.push({ item, module: mod, day, indexInModule, isBonus: day > mainCount });
    });
  }
  return { entries, mainCount };
}

function readProblemDirs() {
  if (!fs.existsSync(PROBLEMS_DIR)) return [];
  return fs
    .readdirSync(PROBLEMS_DIR)
    .filter((slug) => fs.existsSync(path.join(PROBLEMS_DIR, slug, "problem.md")));
}

function readFrontmatter(slug) {
  const raw = fs.readFileSync(path.join(PROBLEMS_DIR, slug, "problem.md"), "utf8");
  return matter(raw);
}

// item id (e.g. "lc-1") -> walkthrough slug (e.g. "two-sum")
export function getWalkthroughMap() {
  const map = {};
  for (const slug of readProblemDirs()) {
    map[readFrontmatter(slug).data.id] = slug;
  }
  return map;
}

export function getProblemSlugs() {
  return readProblemDirs();
}

export function getPrimerIds() {
  if (!fs.existsSync(PATTERNS_DIR)) return [];
  return fs
    .readdirSync(PATTERNS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

function dayLabel(entry, mainCount) {
  return entry.isBonus ? `Bonus Day ${entry.day}` : `Day ${entry.day} of ${mainCount}`;
}

export function getProblem(slug) {
  if (!readProblemDirs().includes(slug)) return null;

  const { data, content } = readFrontmatter(slug);
  const { entries, mainCount } = roadmapIndex();
  const walkthroughs = getWalkthroughMap();
  const position = entries.findIndex((e) => e.item.id === data.id);
  const entry = entries[position];
  if (!entry) throw new Error(`Walkthrough ${slug} has id ${data.id}, which is not on the DSA roadmap`);

  const [before, after = ""] = content.split(CODE_MARKER);
  const dir = path.join(PROBLEMS_DIR, slug);
  const code = LANGUAGES.filter((l) => fs.existsSync(path.join(dir, l.file))).map((l) => ({
    ...l,
    source: fs.readFileSync(path.join(dir, l.file), "utf8").trimEnd(),
  }));

  const toLink = (e) =>
    e && {
      id: e.item.id,
      title: e.item.title,
      difficulty: e.item.difficulty,
      day: e.day,
      dayLabel: dayLabel(e, mainCount),
      href: walkthroughs[e.item.id] ? `/dsa/${walkthroughs[e.item.id]}` : `/dsa#module-${e.module.id}`,
      hasWalkthrough: Boolean(walkthroughs[e.item.id]),
    };

  const related = (data.related || [])
    .map((id) => entries.find((e) => e.item.id === id))
    .filter(Boolean)
    .map(toLink);

  return {
    slug,
    ...data,
    item: entry.item,
    module: { id: entry.module.id, title: entry.module.title, duration: entry.module.duration },
    day: entry.day,
    dayLabel: dayLabel(entry, mainCount),
    isBonus: entry.isBonus,
    hasPrimer: getPrimerIds().includes(entry.module.id),
    before: before.trim(),
    after: after.trim(),
    code,
    related,
    prev: toLink(entries[position - 1]),
    next: toLink(entries[position + 1]),
  };
}

export function getPrimer(moduleId) {
  const file = path.join(PATTERNS_DIR, `${moduleId}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const { entries, mainCount } = roadmapIndex();
  const walkthroughs = getWalkthroughMap();
  const problems = entries
    .filter((e) => e.module.id === moduleId)
    .map((e) => ({
      id: e.item.id,
      title: e.item.title,
      difficulty: e.item.difficulty,
      dayLabel: dayLabel(e, mainCount),
      href: walkthroughs[e.item.id] ? `/dsa/${walkthroughs[e.item.id]}` : null,
    }));
  const stage = entries.find((e) => e.module.id === moduleId)?.module;
  return { ...data, content, problems, duration: stage?.duration, firstProblem: problems.find((p) => p.href) };
}
