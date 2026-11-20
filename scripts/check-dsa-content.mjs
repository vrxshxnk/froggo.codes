#!/usr/bin/env node
// Lints DSA walkthroughs and primers against content/dsa/README.md: frontmatter,
// required sections, roadmap ids, solution files, and a few known traps.
//
//   node scripts/check-dsa-content.mjs            # everything
//   node scripts/check-dsa-content.mjs 3sum       # some problem slugs (primers are always checked)
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

process.removeAllListeners("warning"); // roadmaps.js is ESM in a CommonJS package; Node warns, harmlessly
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const { defaultRoadmaps } = await import(path.join(ROOT, "src/data/roadmaps.js"));
const roadmap = defaultRoadmaps.dsa;
const modules = [...roadmap.modules, ...(roadmap.bonus?.modules || [])];
const items = new Map(modules.flatMap((m) => m.items.map((it) => [it.id, { ...it, module: m.id }])));

const PROBLEMS = path.join(ROOT, "content/dsa/problems");
const PATTERNS = path.join(ROOT, "content/dsa/patterns");
const only = process.argv.slice(2);
const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const REQUIRED = [
  "The problem in plain English",
  "Building the intuition",
  "The optimal approach",
  "Complexity",
  "Edge cases and traps",
  "Say it in the interview",
  "Follow-ups interviewers ask",
];
const FENCES = new Set(["python", "cpp", "java", "javascript", "text", ""]);
const words = (s) => s.replace(/```[\s\S]*?```/g, "").split(/\s+/).filter(Boolean).length;

function checkBody(where, body) {
  for (const m of body.matchAll(/^```(\w*)/gm)) if (!FENCES.has(m[1])) err(where, `code fence language "${m[1]}" won't highlight`);
  if (/\bDay \d+/.test(body)) err(where, `mentions a day number — refer to stages by name instead`);
  if (/<[a-z][^>]*>/i.test(body.replace(/```[\s\S]*?```/g, "").replace(/`[^`]*`/g, ""))) warn(where, "contains raw HTML");
}

const seenIds = new Map();
const slugs = fs.existsSync(PROBLEMS) ? fs.readdirSync(PROBLEMS).filter((s) => fs.statSync(path.join(PROBLEMS, s)).isDirectory()) : [];
for (const slug of slugs.filter((s) => !only.length || only.includes(s)).sort()) {
  const dir = path.join(PROBLEMS, slug);
  const where = `problems/${slug}`;
  const mdFile = path.join(dir, "problem.md");
  if (!fs.existsSync(mdFile)) {
    err(where, "no problem.md");
    continue;
  }
  let parsed;
  try {
    parsed = matter(fs.readFileSync(mdFile, "utf8"));
  } catch (e) {
    err(where, `frontmatter doesn't parse: ${e.message.split("\n")[0]}`);
    continue;
  }
  const { data: d, content } = parsed;

  for (const f of ["id", "title", "pattern", "timeBox", "summary", "hints", "insight", "time", "space", "related"])
    if (d[f] === undefined || d[f] === "") err(where, `missing frontmatter "${f}"`);
  const item = items.get(d.id);
  if (d.id && !item) err(where, `id ${d.id} is not on the DSA roadmap`);
  if (item && d.title !== item.title) warn(where, `title "${d.title}" differs from roadmap "${item.title}"`);
  if (seenIds.has(d.id)) err(where, `id ${d.id} is also used by ${seenIds.get(d.id)}`);
  seenIds.set(d.id, slug);
  if (typeof d.timeBox !== "number") err(where, "timeBox must be a number of minutes");
  if (!Array.isArray(d.hints) || d.hints.length !== 3 || d.hints.some((h) => typeof h !== "string" || !h.trim()))
    err(where, "hints must be exactly 3 non-empty strings");
  if (!Array.isArray(d.related)) err(where, "related must be a list of roadmap ids");
  else for (const r of d.related) if (!items.has(r)) err(where, `related id ${r} is not on the roadmap`);

  const markers = content.split("{{code}}").length - 1;
  if (markers !== 1) err(where, `needs exactly one {{code}} marker (found ${markers})`);
  const headings = [...content.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
  for (const h of REQUIRED) if (!headings.includes(h)) err(where, `missing section "## ${h}"`);
  if (headings.includes("Remember this pattern")) err(where, `"Remember this pattern" was dropped from the template`);
  const isBasics = item?.module === "basics";
  if (!headings.includes("Start with brute force") && !isBasics) warn(where, `no "## Start with brute force" section`);
  checkBody(where, content);
  const n = words(content);
  const [lo, hi] = isBasics ? [200, 800] : [450, 1600];
  if (n < lo || n > hi) warn(where, `${n} words (aim for ${lo}–${hi})`);

  const tests = path.join(dir, "tests.json");
  let stdio = false;
  if (!fs.existsSync(tests)) err(where, "no tests.json");
  else {
    try {
      const spec = JSON.parse(fs.readFileSync(tests, "utf8"));
      stdio = spec.mode === "stdio";
      if (!spec.cases?.length) err(where, "tests.json has no cases");
      else if (spec.cases.length < 5) warn(where, `only ${spec.cases.length} test cases`);
    } catch (e) {
      err(where, `tests.json doesn't parse: ${e.message}`);
    }
  }
  for (const f of ["solution.py", "solution.cpp", "solution.java", "solution.js"]) {
    const file = path.join(dir, f);
    if (!fs.existsSync(file)) {
      err(where, `missing ${f}`);
      continue;
    }
    const src = fs.readFileSync(file, "utf8");
    if (!stdio && f === "solution.cpp" && /#include|using namespace std/.test(src)) err(where, `${f}: drop #include / using namespace (LeetCode and the harness add them)`);
    if (!stdio && f === "solution.java" && /^import /m.test(src)) err(where, `${f}: drop imports (LeetCode and the harness add them)`);
    if (/^\s*(struct|class)\s+(ListNode|TreeNode|Node)\b/m.test(src) || /^\s*(function|class)\s+(ListNode|TreeNode|_Node)\b/m.test(src))
      err(where, `${f}: defines ListNode/TreeNode/Node — leave those to the harness (keep them as a comment if you like)`);
    if (f === "solution.py" && (/\bmatch\s+\w+.*:\s*$/m.test(src) || /->\s*\w+\s*\|/.test(src))) err(where, `${f}: needs to run on Python 3.9`);
  }
}

const primerIds = fs.existsSync(PATTERNS) ? fs.readdirSync(PATTERNS).filter((f) => f.endsWith(".md")) : [];
for (const file of primerIds) {
  const where = `patterns/${file}`;
  let parsed;
  try {
    parsed = matter(fs.readFileSync(path.join(PATTERNS, file), "utf8"));
  } catch (e) {
    err(where, `frontmatter doesn't parse: ${e.message.split("\n")[0]}`);
    continue;
  }
  const { data: d, content } = parsed;
  const id = file.replace(/\.md$/, "");
  if (!modules.some((m) => m.id === id)) err(where, `${id} is not a DSA roadmap module id`);
  if (d.module !== id) err(where, `frontmatter module "${d.module}" should be "${id}"`);
  for (const f of ["title", "readTime", "summary"]) if (!d[f]) err(where, `missing frontmatter "${f}"`);
  checkBody(where, content);
  const n = words(content);
  if (n < 600 || n > 2200) warn(where, `${n} words (aim for 900–1500)`);
}

for (const w of warnings) console.log(`⚠️  ${w}`);
for (const e of errors) console.log(`❌ ${e}`);
const covered = [...seenIds.keys()].filter((id) => items.has(id)).length;
console.log(`\n${covered}/${items.size} roadmap problems have walkthroughs; ${primerIds.length}/${modules.length} stages have primers.`);
console.log(errors.length ? `${errors.length} error(s), ${warnings.length} warning(s)` : `No errors (${warnings.length} warning(s)).`);
process.exit(errors.length ? 1 : 0);
