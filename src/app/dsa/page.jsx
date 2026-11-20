import RoadmapPage from "@/components/RoadmapPage";

const title = "90-Day DSA Roadmap — 90 Problems, 1 a Day | FroggoCodes";
const description =
  "The 90 FAANG-repeated interview problems in the right order, one a day, with Codeforces mixed in. Free forever — sign in to track your progress.";

export const metadata = {
  title,
  description,
  alternates: { canonical: "/dsa" },
  openGraph: { type: "website", siteName: "FroggoCodes", title, description, url: "/dsa" },
};

export default function DsaPage() {
  return <RoadmapPage slug="dsa" />;
}
