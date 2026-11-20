import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getPrimerIds, getProblemSlugs } from "@/libs/dsaContent";

const siteUrl = "https://www.froggo.codes";

function blogEntries() {
  const dir = path.join(process.cwd(), "content/blog");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((name) => /^[a-zA-Z0-9_-]+\.md$/.test(name))
    .map((name) => {
      const { data } = matter(fs.readFileSync(path.join(dir, name), "utf8"));
      const date = data.date ? new Date(data.date) : null;
      return {
        url: `${siteUrl}/blog/${name.replace(/\.md$/, "")}`,
        ...(date && !Number.isNaN(date.getTime()) ? { lastModified: date } : {}),
        changeFrequency: "monthly",
        priority: 0.6,
      };
    });
}

export default function sitemap() {
  return [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/dsa`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/development`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.7 },
    ...getPrimerIds().map((id) => ({ url: `${siteUrl}/dsa/patterns/${id}`, changeFrequency: "monthly", priority: 0.7 })),
    ...getProblemSlugs().map((slug) => ({ url: `${siteUrl}/dsa/${slug}`, changeFrequency: "monthly", priority: 0.7 })),
    ...blogEntries(),
    { url: `${siteUrl}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/tos`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
