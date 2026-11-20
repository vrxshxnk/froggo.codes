import RoadmapPage from "@/components/RoadmapPage";

const title = "Development Roadmap — 6 Projects, Zero Copy-Paste | FroggoCodes";
const description =
  "Six projects of increasing depth up to a FAANG-level capstone. Milestones, structure, and hints — never the code. Free forever with progress tracking.";

export const metadata = {
  title,
  description,
  alternates: { canonical: "/development" },
  openGraph: { type: "website", siteName: "FroggoCodes", title, description, url: "/development" },
};

export default function DevelopmentPage() {
  return <RoadmapPage slug="development" />;
}
