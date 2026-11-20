import { renderOgImage, ogSize } from "@/libs/ogImage";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "90-Day DSA Roadmap — 90 problems, 1 a day";

export default function Image() {
  return renderOgImage({
    eyebrow: "Free · 90-Day DSA Roadmap",
    title: "90 problems. 1 a day. Interview ready.",
    subtitle: "FAANG-repeated patterns in the right order, with Codeforces mixed in.",
  });
}
