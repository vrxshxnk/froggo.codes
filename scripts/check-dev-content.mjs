#!/usr/bin/env node
// Lints Development roadmap guides against content/dev/README.md: frontmatter,
// required sections, roadmap ids, code-block size (we never hand out the
// code), doc links and a few known traps.
//
//   node scripts/check-dev-content.mjs              # everything
//   node scripts/check-dev-content.mjs devboard     # some project ids
//   node scripts/check-dev-content.mjs --links      # also fetch every doc link
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

process.removeAllListeners("warning"); // roadmaps.js is ESM in a CommonJS package; Node warns, harmlessly
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const { defaultRoadmaps } = await import(path.join(ROOT, "src/data/roadmaps.js"));
const projects = defaultRoadmaps.development.modules;

const DIR = path.join(ROOT, "content/dev");
const args = process.argv.slice(2);
const checkLinks = args.includes("--links");
const only = args.filter((a) => !a.startsWith("--"));
const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const MILESTONE_SECTIONS = [
  "What you're building",
  "Why it matters",
  "Before you start",
  "Build it step by step",
  "Common mistakes",
  "Say it in the interview",
];
const OPTIONAL_MILESTONE = ["Stretch goals"];
const PROJECT_SECTIONS = [
  "What you're building",
  "Features",
  "The stack",
  "How it fits together",
  "Out of scope",
  "How to work through it",
  "Show it off",
];
const FENCES = new Set(["text", "json", "bash", "sql", "html", "css", "javascript", "jsx", "typescript", "tsx", "python", "yaml"]);
const OFFICIAL = [
  "developer.mozilla.org", "web.dev", "react.dev", "nextjs.org", "nodejs.org", "www.postgresql.org", "redis.io",
  "docs.stripe.com", "stripe.com", "socket.io", "github.com", "docs.github.com", "vercel.com", "docs.netlify.com",
  "www.w3.org", "html.spec.whatwg.org", "developer.chrome.com", "expressjs.com", "www.typescriptlang.org", "zod.dev",
  "docs.python.org", "fastapi.tiangolo.com", "docs.pydantic.dev", "platform.openai.com", "docs.anthropic.com",
  "docs.claude.com", "ai.google.dev", "ollama.com", "github.com/pgvector", "supabase.com", "neon.com", "neon.tech",
  "www.prisma.io", "orm.drizzle.team", "authjs.dev", "k6.io", "grafana.com", "docs.sentry.io", "resend.com",
  "postmarkapp.com", "docs.docker.com", "docs.aws.amazon.com", "developers.cloudflare.com", "railway.com",
  "docs.railway.com", "render.com", "fly.io", "opentelemetry.io", "www.artillery.io", "bullmq.io", "docs.bullmq.io",
  "pnpm.io", "turbo.build", "docs.npmjs.com", "playwright.dev", "vitest.dev", "jestjs.io", "testing-library.com",
  "tailwindcss.com", "excalidraw.com", "formspree.io", "web3forms.com", "pagespeed.web.dev", "schema.org",
  "ogp.me", "owasp.org", "cheatsheetseries.owasp.org", "datatracker.ietf.org", "www.rfc-editor.org", "jwt.io",
  "huggingface.co", "sbert.net", "www.sbert.net", "docs.cohere.com", "cookbook.openai.com", "modelcontextprotocol.io",
];
const words = (s) => s.replace(/```[\s\S]*?```/g, "").split(/\s+/).filter(Boolean).length;
const headingsOf = (s) => [...s.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
const links = [];

function checkBody(where, body) {
  for (const m of body.matchAll(/^```(\w*)\n([\s\S]*?)^```/gm)) {
    const [, lang, code] = m;
    if (!FENCES.has(lang)) err(where, `code fence language "${lang || "(none)"}" won't highlight — use one of ${[...FENCES].join(", ")}`);
    const lines = code.replace(/\n$/, "").split("\n").length;
    const max = lang === "text" ? 20 : 12;
    if (lines > max) warn(where, `a ${lang} block is ${lines} lines — is it handing out the code? (soft limit ${max})`);
  }
  if (/\b(Day|Week) \d+/.test(body)) err(where, "mentions a day/week number — the roadmap shows the schedule");
  if (/\b(let's dive in|in this guide we will|game[- ]changer)\b/i.test(body)) warn(where, "filler phrase");
  if (/<[a-z][^>]*>/i.test(body.replace(/```[\s\S]*?```/g, "").replace(/`[^`]*`/g, ""))) warn(where, "contains raw HTML");
  for (const m of body.matchAll(/\]\((\/development\/[^)#\s]+)/g)) {
    const [proj, ms] = m[1].replace(/^\/development\//, "").split("/");
    const p = projects.find((x) => x.id === proj);
    if (!p || (ms && !p.items.some((i) => i.id === ms))) err(where, `internal link ${m[1]} doesn't match a roadmap project/milestone`);
  }
  for (const m of body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) links.push([where, m[1]]);
}

function officialHost(url) {
  try {
    const u = new URL(url);
    return OFFICIAL.some((h) => (h.includes("/") ? `${u.host}${u.pathname}`.startsWith(h) : u.host === h || u.host.endsWith(`.${h}`)));
  } catch {
    return false;
  }
}

const covered = { briefs: 0, milestones: 0 };
const total = { briefs: projects.length, milestones: projects.reduce((n, p) => n + p.items.length, 0) };

for (const project of projects) {
  const pdir = path.join(DIR, project.id);
  if (!fs.existsSync(pdir)) continue;
  if (only.length && !only.includes(project.id)) {
    covered.briefs += fs.existsSync(path.join(pdir, "project.md")) ? 1 : 0;
    covered.milestones += project.items.filter((i) => fs.existsSync(path.join(pdir, `${i.id}.md`))).length;
    continue;
  }
  const known = new Set(["project.md", ...project.items.map((i) => `${i.id}.md`)]);
  for (const f of fs.readdirSync(pdir)) if (!known.has(f)) err(`dev/${project.id}/${f}`, "not a roadmap milestone id (or project.md)");

  // Project brief
  const briefFile = path.join(pdir, "project.md");
  if (fs.existsSync(briefFile)) {
    const where = `dev/${project.id}/project.md`;
    try {
      const { data: d, content } = matter(fs.readFileSync(briefFile, "utf8"));
      covered.briefs += 1;
      for (const f of ["id", "name", "tagline", "summary", "time"]) if (!d[f]) err(where, `missing frontmatter "${f}"`);
      if (d.id !== project.id) err(where, `id "${d.id}" should be "${project.id}"`);
      if (d.tagline && d.tagline.length > 70) warn(where, `tagline is ${d.tagline.length} chars (aim for < 70)`);
      const hs = headingsOf(content);
      PROJECT_SECTIONS.forEach((h) => !hs.includes(h) && err(where, `missing section "## ${h}"`));
      const order = hs.filter((h) => PROJECT_SECTIONS.includes(h));
      if (order.join("|") !== PROJECT_SECTIONS.filter((h) => hs.includes(h)).join("|")) err(where, "sections are out of order");
      if (!/```text\n/.test(content)) warn(where, `"How it fits together" has no text diagram`);
      checkBody(where, content);
      const n = words(content);
      if (n < 500 || n > 1200) warn(where, `${n} words (aim for 500–1200)`);
    } catch (e) {
      err(where, `frontmatter doesn't parse: ${e.message.split("\n")[0]}`);
    }
  } else err(`dev/${project.id}`, "no project.md");

  // Milestones
  for (const item of project.items) {
    const file = path.join(pdir, `${item.id}.md`);
    const where = `dev/${project.id}/${item.id}.md`;
    if (!fs.existsSync(file)) {
      warn(where, "not written yet");
      continue;
    }
    let parsed;
    try {
      parsed = matter(fs.readFileSync(file, "utf8"));
    } catch (e) {
      err(where, `frontmatter doesn't parse: ${e.message.split("\n")[0]}`);
      continue;
    }
    covered.milestones += 1;
    const { data: d, content } = parsed;
    for (const f of ["id", "project", "title", "summary", "time", "doneWhen", "docs"]) if (d[f] === undefined || d[f] === "") err(where, `missing frontmatter "${f}"`);
    if (d.id !== item.id) err(where, `id "${d.id}" should be "${item.id}"`);
    if (d.project !== project.id) err(where, `project "${d.project}" should be "${project.id}"`);
    if (d.title && d.title !== item.title) warn(where, `title differs from roadmap "${item.title}"`);
    if (!Array.isArray(d.doneWhen) || d.doneWhen.length < 3 || d.doneWhen.length > 7 || d.doneWhen.some((x) => typeof x !== "string" || !x.trim()))
      err(where, "doneWhen must be 3–7 non-empty strings");
    if (!Array.isArray(d.docs) || d.docs.length < 1 || d.docs.length > 6) err(where, "docs must be a list of 1–6 {label, url}");
    else
      for (const doc of d.docs) {
        if (!doc?.label || !/^https:\/\//.test(doc?.url || "")) err(where, `doc link needs a label and an https url: ${JSON.stringify(doc)}`);
        else {
          if (!officialHost(doc.url)) warn(where, `doc link ${doc.url} isn't on the official-docs list — is it official?`);
          links.push([where, doc.url]);
        }
      }
    const hs = headingsOf(content);
    MILESTONE_SECTIONS.forEach((h) => !hs.includes(h) && err(where, `missing section "## ${h}"`));
    for (const h of hs) if (![...MILESTONE_SECTIONS, ...OPTIONAL_MILESTONE].includes(h)) err(where, `unexpected section "## ${h}"`);
    const order = hs.filter((h) => MILESTONE_SECTIONS.includes(h));
    if (order.join("|") !== MILESTONE_SECTIONS.filter((h) => hs.includes(h)).join("|")) err(where, "sections are out of order");
    const steps = [...content.matchAll(/^### Step (\d+):/gm)].map((m) => Number(m[1]));
    if (steps.length < 3) err(where, `needs at least 3 "### Step N: ..." headings (found ${steps.length})`);
    else if (steps.some((s, i) => s !== i + 1)) err(where, "step numbers should run 1, 2, 3, ...");
    checkBody(where, content);
    const n = words(content);
    if (n < 500 || n > 1300) warn(where, `${n} words (aim for 500–1300)`);
  }
}

if (checkLinks) {
  const unique = [...new Map(links.map(([w, u]) => [u, w])).entries()];
  await Promise.all(
    unique.map(async ([url, where]) => {
      try {
        let res = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(15000) });
        if (res.status === 405 || res.status === 403) res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
        if (res.status === 404 || res.status === 410) err(where, `dead link (${res.status}): ${url}`);
        else if (!res.ok) warn(where, `link returned ${res.status}: ${url}`);
      } catch (e) {
        warn(where, `couldn't fetch ${url}: ${e.cause?.code || e.name}`);
      }
    })
  );
  console.log(`Checked ${unique.length} unique links.`);
}

for (const w of warnings) console.log(`⚠️  ${w}`);
for (const e of errors) console.log(`❌ ${e}`);
console.log(`\n${covered.briefs}/${total.briefs} project briefs, ${covered.milestones}/${total.milestones} milestone guides.`);
console.log(errors.length ? `${errors.length} error(s), ${warnings.length} warning(s)` : `No errors (${warnings.length} warning(s)).`);
process.exit(errors.length ? 1 : 0);
