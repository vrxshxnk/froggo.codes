// Server-only loader for Development roadmap guides: a brief per project
// (content/dev/<project>/project.md) and a guide per milestone
// (content/dev/<project>/<milestone>.md). Runs at build time only.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { defaultRoadmaps } from "@/data/roadmaps";

const DIR = path.join(process.cwd(), "content/dev");
const projects = () => defaultRoadmaps.development.modules;

const read = (file) => matter(fs.readFileSync(file, "utf8"));
const briefFile = (projectId) => path.join(DIR, projectId, "project.md");
const milestoneFile = (projectId, id) => path.join(DIR, projectId, `${id}.md`);
const hasBrief = (projectId) => fs.existsSync(briefFile(projectId));
const hasMilestone = (projectId, id) => fs.existsSync(milestoneFile(projectId, id));

// "Project 2 · DevBoard — Kanban Task Manager" -> { number: 2, name: "DevBoard — Kanban Task Manager" }
function splitTitle(title) {
  const m = /^Project (\d+) · (.+)$/.exec(title);
  return m ? { number: Number(m[1]), name: m[2] } : { number: null, name: title };
}

export function getDevBriefIds() {
  return projects().filter((p) => hasBrief(p.id)).map((p) => p.id);
}

// "module:item" -> guide href, for the roadmap page buttons
export function getDevGuideMap() {
  const map = {};
  for (const p of projects()) for (const item of p.items) if (hasMilestone(p.id, item.id)) map[`${p.id}:${item.id}`] = `/development/${p.id}/${item.id}`;
  return map;
}

export function getDevMilestoneParams() {
  return projects().flatMap((p) => p.items.filter((i) => hasMilestone(p.id, i.id)).map((i) => ({ project: p.id, milestone: i.id })));
}

function milestoneLinks(project) {
  return project.items.map((item, i) => ({
    id: item.id,
    step: i + 1,
    title: item.title,
    tags: item.tags,
    href: hasMilestone(project.id, item.id) ? `/development/${project.id}/${item.id}` : null,
    time: hasMilestone(project.id, item.id) ? read(milestoneFile(project.id, item.id)).data.time : null,
  }));
}

export function getDevProject(projectId) {
  const all = projects();
  const index = all.findIndex((p) => p.id === projectId);
  const project = all[index];
  if (!project || !hasBrief(projectId)) return null;
  const { data, content } = read(briefFile(projectId));
  const neighbour = (p) => p && { id: p.id, ...splitTitle(p.title), href: hasBrief(p.id) ? `/development/${p.id}` : `/development#module-${p.id}` };
  return {
    ...splitTitle(project.title),
    ...data,
    module: { id: project.id, title: project.title, duration: project.duration, focus: project.focus, interviewCopy: project.interviewCopy, guide: project.guide },
    content,
    milestones: milestoneLinks(project),
    total: all.length,
    prev: neighbour(all[index - 1]),
    next: neighbour(all[index + 1]),
  };
}

export function getDevMilestone(projectId, milestoneId) {
  const project = projects().find((p) => p.id === projectId);
  const index = project?.items.findIndex((i) => i.id === milestoneId) ?? -1;
  if (index < 0 || !hasMilestone(projectId, milestoneId)) return null;
  const item = project.items[index];
  const { data, content } = read(milestoneFile(projectId, milestoneId));
  const links = milestoneLinks(project);
  return {
    ...data,
    item,
    step: index + 1,
    stepCount: project.items.length,
    project: { id: project.id, ...splitTitle(project.title), duration: project.duration, hasBrief: hasBrief(project.id) },
    content,
    milestones: links,
    prev: links[index - 1] || null,
    next: links[index + 1] || null,
  };
}
