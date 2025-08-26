"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { blogService } from "@/libs/blogService";

const BlogPostPage = () => {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postData = await blogService.getPostBySlug(params.slug);

        if (!postData) {
          setError("Post not found");
          return;
        }

        setPost(postData);

        // Fetch related posts based on tags
        if (postData.tags.length > 0) {
          const allPosts = await blogService.getAllPosts();
          const related = allPosts
            .filter(
              (p) =>
                p.slug !== postData.slug &&
                p.tags.some((tag) => postData.tags.includes(tag))
            )
            .slice(0, 3);
          setRelatedPosts(related);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        setError("Failed to load post");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.slug) {
      fetchPost();
    }
  }, [params.slug]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const estimateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <p className="text-gray-300 mb-8">{error || "Post not found"}</p>
          <Link
            href="/blog"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Froggo&apos;s Thoughts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#181818] py-24 px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <Link
          href="/blog"
          className="text-emerald-400 hover:text-emerald-300 inline-flex items-center mb-8 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to Froggo&apos;s Thoughts
        </Link>

        {/* Article Header */}
        <header className="mb-12">
          <div className="mb-6">
            {post.featured && (
              <span className="bg-emerald-500 text-white text-sm font-semibold px-3 py-1 rounded-full mr-3">
                Featured
              </span>
            )}
            <span className="text-gray-400">
              {formatDate(post.date)} • {estimateReadTime(post.content)} min
              read
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 mb-6 pb-2 leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-gray-300 leading-relaxed mb-8">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between mb-8 py-6 border-y border-white/5 bg-neutral-800/20 rounded-lg px-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-emerald-500/30">
                <Image
                  src="/froggo-slays.png"
                  alt={post.author}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-white font-medium">{post.author}</p>
                <p className="text-gray-400 text-sm">Author</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${tag}`}
                  className="bg-neutral-700/50 hover:bg-emerald-600 text-gray-400 hover:text-white text-sm px-3 py-1.5 rounded-lg transition-all duration-200"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-lg prose-invert max-w-none mb-16">
          <div className="blog-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom styling for different elements
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-emerald-400 mb-6 mt-8">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-white mb-4 mt-8">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-bold text-white mb-3 mt-6">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="text-gray-300 list-disc list-inside mb-4 space-y-2">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="text-gray-300 list-decimal list-inside mb-4 space-y-2">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-300">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-emerald-500 pl-6 py-2 mb-4 bg-neutral-800/50 rounded-r">
                    {children}
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="bg-neutral-700/50 text-emerald-300 px-2 py-1 rounded-md text-sm font-mono border border-neutral-600/30">
                        {children}
                      </code>
                    );
                  }

                  // Check if it's a bash/terminal command
                  const isBashCommand =
                    className?.includes("language-bash") ||
                    className?.includes("language-shell");
                  const isJsonCode = className?.includes("language-json");
                  const isFileStructure = className?.includes(
                    "language-filestructure"
                  );

                  if (isBashCommand) {
                    return (
                      <div className="bg-gray-800 border border-gray-600/40 rounded-lg p-4 mb-6 shadow-lg">
                        <div className="flex items-center mb-2">
                          <div className="flex space-x-1.5">
                            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          </div>
                          <span className="ml-3 text-gray-300 text-sm font-mono">
                            Terminal
                          </span>
                        </div>
                        <div className="bg-gray-900/60 rounded-md p-3 overflow-x-auto">
                          <pre className="text-green-300 font-mono text-sm leading-relaxed">
                            <code>{children}</code>
                          </pre>
                        </div>
                      </div>
                    );
                  }

                  if (isJsonCode) {
                    return (
                      <div className="bg-slate-800/80 border border-slate-600/30 rounded-lg p-4 mb-6 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center mb-2">
                          <div className="flex space-x-1.5">
                            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          </div>
                          <span className="ml-3 text-slate-300 text-sm font-mono">
                            Code Editor
                          </span>
                        </div>
                        <div className="bg-slate-900/60 rounded-md p-4 overflow-x-auto">
                          <pre className="text-blue-300 font-mono text-sm leading-relaxed">
                            <code>{children}</code>
                          </pre>
                        </div>
                      </div>
                    );
                  }

                  // Warm theme for file structures
                  if (isFileStructure) {
                    return (
                      <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4 mb-6 shadow-lg">
                        <div className="flex items-center mb-2">
                          <div className="flex space-x-1.5">
                            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          </div>
                          <span className="ml-3 text-amber-300 text-sm font-mono">
                            File Manager
                          </span>
                        </div>
                        <div className="bg-amber-950/40 rounded-md p-4 overflow-x-auto">
                          <pre className="text-amber-200 font-mono text-sm leading-relaxed">
                            <code>{children}</code>
                          </pre>
                        </div>
                      </div>
                    );
                  }

                  // Enhanced Catppuccin theme for regular code blocks - most prominent
                  return (
                    <div className="bg-gradient-to-br from-[#1e1e2e] to-[#181825] border border-[#45475a]/60 rounded-lg p-4 mb-6 shadow-xl backdrop-blur-sm ring-1 ring-[#89b4fa]/10">
                      <div className="flex items-center mb-2">
                        <div className="flex space-x-1.5">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                        <span className="ml-3 text-[#cba6f7] text-sm font-mono">
                          Code Editor
                        </span>
                      </div>
                      <div className="bg-[#11111b]/80 rounded-md p-4 overflow-x-auto border border-[#313244]/30">
                        <pre className="text-[#f38ba8] font-mono text-sm leading-relaxed">
                          <code>{children}</code>
                        </pre>
                      </div>
                    </div>
                  );
                },
                hr: () => (
                  <div className="my-12 flex items-center justify-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </div>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-emerald-400 hover:text-emerald-300 underline transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full border border-white/20 rounded-lg">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="bg-neutral-800 text-white font-bold px-4 py-2 border border-white/20">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="text-gray-300 px-4 py-2 border border-white/20">
                    {children}
                  </td>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-3xl font-bold text-white mb-8">
              Related Articles
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost.slug}
                  className="bg-neutral-800 rounded-lg p-6 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:-translate-y-1"
                >
                  <span className="text-gray-400 text-sm mb-2 block">
                    {formatDate(relatedPost.date)}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-3 hover:text-emerald-400 transition-colors">
                    <Link href={`/blog/${relatedPost.slug}`}>
                      {relatedPost.title}
                    </Link>
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {relatedPost.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {relatedPost.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="bg-neutral-700/50 text-gray-400 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/blog/${relatedPost.slug}`}
                    className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                  >
                    Read more →
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-neutral-800 to-neutral-900 rounded-xl p-8 mt-16 text-center border border-emerald-500/20">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Level Up Your Skills?
          </h3>
          <p className="text-gray-300 mb-6">
            Join thousands of developers who are building amazing projects and
            advancing their careers.
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Explore Our Courses
          </Link>
        </section>
      </div>
    </main>
  );
};

export default BlogPostPage;
