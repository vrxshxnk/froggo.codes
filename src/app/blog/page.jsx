"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { blogService } from "@/libs/blogService";

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("all");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const [allPosts, featured, tags] = await Promise.all([
          blogService.getAllPosts(),
          blogService.getFeaturedPosts(),
          blogService.getAllTags(),
        ]);

        setPosts(allPosts);
        setFeaturedPosts(featured);
        setAllTags(tags);
        setFilteredPosts(allPosts);
      } catch (error) {
        console.error("Error fetching blog data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogData();
  }, []);

  useEffect(() => {
    if (selectedTag === "all") {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter((post) => post.tags.includes(selectedTag)));
    }
  }, [selectedTag, posts]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#181818] py-24 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back to Home Button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-white hover:text-emerald-400 transition-colors"
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
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex flex-col items-center justify-center mb-6">
            <Image
              src="/froggo-thinks.png"
              alt="Froggo Thinks Logo"
              width={100}
              height={100}
              className="mb-4"
            />
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 pb-2">
              Froggo&apos;s Thoughts
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Insights, tutorials, and thoughts to help you build tomorrow&apos;s
            digital experiences.
          </p>
        </div>

        {/* Featured Posts Section */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8">Featured</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredPosts.slice(0, 3).map((post) => (
                <article
                  key={post.slug}
                  className="bg-neutral-800 rounded-lg p-6 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:-translate-y-1 shadow-md hover:shadow-lg"
                >
                  <div className="mb-4">
                    <span className="text-gray-400 text-sm">
                      {formatDate(post.date)}
                    </span>
                    <span className="ml-2 bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2 py-1 rounded">
                      Featured
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 hover:text-emerald-400 transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  <p className="text-gray-300 mb-4 line-clamp-3 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className="bg-neutral-700/50 hover:bg-emerald-600 text-gray-400 hover:text-white text-xs px-2 py-1 rounded transition-all duration-200"
                      >
                        {tag}
                      </button>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="text-gray-500 text-xs px-1 py-1 italic">
                        +{post.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-gray-400 text-sm">{post.author}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                      Read more →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* All Posts Grid */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-8">
            {selectedTag === "all"
              ? "All Articles"
              : `Articles tagged with #${selectedTag}`}
          </h2>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">
                {selectedTag === "all"
                  ? "No blog posts available yet. Check back soon!"
                  : `No articles found with tag #${selectedTag}`}
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-neutral-800 rounded-lg p-6 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:-translate-y-1 shadow-md hover:shadow-lg"
                >
                  <div className="mb-4">
                    <span className="text-gray-400 text-sm">
                      {formatDate(post.date)}
                    </span>
                    {post.featured && (
                      <span className="ml-2 bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2 py-1 rounded">
                        Featured
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 hover:text-emerald-400 transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  <p className="text-gray-300 mb-4 line-clamp-3 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className="bg-neutral-700/50 hover:bg-emerald-600 text-gray-400 hover:text-white text-xs px-2 py-1 rounded transition-all duration-200"
                      >
                        {tag}
                      </button>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="text-gray-500 text-xs px-1 py-1 italic">
                        +{post.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-gray-400 text-sm">{post.author}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                    >
                      Read more →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Filter Tags - Cleaner Design - Moved to Bottom */}
        <section className="mt-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-4 text-center">
                Filter by Topic
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setSelectedTag("all")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTag === "all"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-transparent text-gray-300 hover:bg-neutral-700 hover:text-white"
                  }`}
                >
                  All ({posts.length})
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedTag === tag
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-transparent text-gray-300 hover:bg-neutral-700 hover:text-white"
                    }`}
                  >
                    {tag} (
                    {posts.filter((post) => post.tags.includes(tag)).length})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default BlogPage;
