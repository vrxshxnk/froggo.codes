import { renderOgImage, ogSize } from "@/libs/ogImage";
import { getDevMilestone, getDevMilestoneParams } from "@/libs/devContent";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Development roadmap milestone guide";

export function generateStaticParams() {
  return getDevMilestoneParams();
}

export default async function Image({ params }) {
  const { project, milestone } = await params;
  const m = getDevMilestone(project, milestone);
  return renderOgImage({
    eyebrow: `${m.project.name.split(" — ")[0]} · Step ${m.step} of ${m.stepCount}`,
    title: m.title,
    subtitle: `${m.time} · You write every line`,
  });
}
