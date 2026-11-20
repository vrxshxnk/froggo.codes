import { renderOgImage, ogSize } from "@/libs/ogImage";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "FroggoCodes — free DSA and Development roadmaps";

export default function Image() {
  return renderOgImage({
    eyebrow: "FroggoCodes 🐸",
    title: "Learn to code. Get interview ready.",
    subtitle: "Free 90-day DSA roadmap + 7 real projects. Track your streak.",
  });
}
