import { renderOgImage, ogSize } from "@/libs/ogImage";
import { getDevBriefIds, getDevProject } from "@/libs/devContent";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Development roadmap project brief";

export function generateStaticParams() {
  return getDevBriefIds().map((project) => ({ project }));
}

export default async function Image({ params }) {
  const { project: id } = await params;
  const project = getDevProject(id);
  return renderOgImage({
    eyebrow: `Project ${project.number} of ${project.total} · Development Roadmap`,
    title: `Build ${project.name}`,
    subtitle: `${project.tagline}. ${project.milestones.length} milestones, zero copy-paste.`,
  });
}
