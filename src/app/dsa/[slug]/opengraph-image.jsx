import { renderOgImage, ogSize } from "@/libs/ogImage";
import { getProblem, getProblemSlugs } from "@/libs/dsaContent";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "DSA problem walkthrough";

export function generateStaticParams() {
  return getProblemSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }) {
  const { slug } = await params;
  const problem = getProblem(slug);
  return renderOgImage({
    eyebrow: `${problem.dayLabel} · ${problem.item.difficulty}`,
    title: `${problem.title}, explained`,
    subtitle: `${problem.pattern} · ${problem.time} · Python, C++, Java & JS`,
  });
}
