import { renderOgImage, ogSize } from "@/libs/ogImage";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Development Roadmap — 6 projects, zero copy-paste";

export default function Image() {
  return renderOgImage({
    eyebrow: "Free · Development Roadmap",
    title: "6 real projects. Zero copy-paste.",
    subtitle: "From a portfolio site to a FAANG-level capstone, milestone by milestone.",
  });
}
