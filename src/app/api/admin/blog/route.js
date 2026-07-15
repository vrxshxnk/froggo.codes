import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/libs/firebaseAdmin";

const postsDirectory = path.join(process.cwd(), "content/blog");

function validateSlug(slug) {
  return typeof slug === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(slug);
}

function resolvePostPath(slug) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const resolvedPath = path.resolve(fullPath);
  const resolvedPostsDir = path.resolve(postsDirectory);

  if (!resolvedPath.startsWith(resolvedPostsDir)) {
    throw new Error("Invalid post path");
  }

  return resolvedPath;
}

function readPostsWithContent() {
  if (!fs.existsSync(postsDirectory)) return [];

  return fs
    .readdirSync(postsDirectory)
    .filter((name) => /^[a-zA-Z0-9_-]+\.md$/.test(name))
    .map((name) => {
      const slug = name.replace(/\.md$/, "");
      const fileContents = fs.readFileSync(resolvePostPath(slug), "utf8");
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: typeof data.title === "string" ? data.title : "Untitled",
        excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
        date:
          data.date instanceof Date
            ? data.date.toISOString()
            : typeof data.date === "string"
            ? data.date
            : new Date().toISOString(),
        author: typeof data.author === "string" ? data.author : "FroggoCodes",
        tags: Array.isArray(data.tags)
          ? data.tags.filter((tag) => typeof tag === "string")
          : [],
        featured: Boolean(data.featured),
        content,
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function yamlString(value) {
  return `"${String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function buildMarkdown(post) {
  const tags = Array.isArray(post.tags)
    ? post.tags.filter((tag) => typeof tag === "string" && tag.length <= 50)
    : [];

  const frontmatter = [
    "---",
    `title: ${yamlString(post.title)}`,
    `excerpt: ${yamlString(post.excerpt)}`,
    `date: ${yamlString(post.date || new Date().toISOString().slice(0, 10))}`,
    `author: ${yamlString(post.author || "FroggoCodes")}`,
    "tags:",
    ...tags.map((tag) => `  - ${yamlString(tag)}`),
    `featured: ${Boolean(post.featured)}`,
    "---",
    "",
  ].join("\n");

  return `${frontmatter}${typeof post.content === "string" ? post.content : ""}\n`;
}

async function requireAdmin(request) {
  const admin = await verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    return NextResponse.json({ posts: readPostsWithContent() });
  } catch (error) {
    console.error("Admin blog list failed:", error);
    return NextResponse.json({ error: "Failed to read posts" }, { status: 500 });
  }
}

export async function POST(request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const post = await request.json();
    if (!validateSlug(post.slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    if (typeof post.title !== "string" || post.title.trim().length < 3) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    fs.mkdirSync(postsDirectory, { recursive: true });
    fs.writeFileSync(resolvePostPath(post.slug), buildMarkdown(post), "utf8");

    return NextResponse.json({ success: true, slug: post.slug });
  } catch (error) {
    console.error("Admin blog save failed:", error);
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
  }
}
