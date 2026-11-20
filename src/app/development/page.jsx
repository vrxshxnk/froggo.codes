import RoadmapPage from "@/components/RoadmapPage";
import { getDevBriefIds, getDevGuideMap } from "@/libs/devContent";

const title = "Development Roadmap — 7 Projects, Zero Copy-Paste | FroggoCodes";
const description =
  "Seven projects of increasing depth, including an AI app with RAG, up to a FAANG-level capstone. Milestones, structure, and hints — never the code. Free forever with progress tracking.";

export const metadata = {
  title,
  description,
  alternates: { canonical: "/development" },
  openGraph: { type: "website", siteName: "FroggoCodes", title, description, url: "/development" },
};

export default function DevelopmentPage() {
  return <RoadmapPage slug="development" guides={getDevGuideMap()} briefs={getDevBriefIds()} />;
}
