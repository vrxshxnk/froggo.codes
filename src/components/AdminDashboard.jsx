"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/libs/firebase";
import { roadmapService } from "@/libs/roadmapService";
import CoursesAdmin from "@/components/admin/CoursesAdmin";

const roadmapIds = ["dsa", "development"];

function openSignIn() {
  window.dispatchEvent(
    new CustomEvent("open-signin-modal", {
      detail: { startWithSignUp: false },
    })
  );
}

const emptyPost = {
  slug: "",
  title: "",
  excerpt: "",
  date: new Date().toISOString().slice(0, 10),
  author: "FroggoCodes",
  tags: "",
  featured: false,
  content: "",
};

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [activeTab, setActiveTab] = useState("courses");
  const [selectedRoadmap, setSelectedRoadmap] = useState("dsa");
  const [roadmapJson, setRoadmapJson] = useState("");
  const [roadmapStatus, setRoadmapStatus] = useState("");
  const [posts, setPosts] = useState([]);
  const [postForm, setPostForm] = useState(emptyPost);
  const [blogStatus, setBlogStatus] = useState("");

  useEffect(() => {
    let isMounted = true;

    const checkAdmin = async () => {
      setIsCheckingAdmin(true);

      try {
        if (!auth.currentUser) {
          if (isMounted) setIsAdmin(false);
          return;
        }

        const token = await auth.currentUser.getIdTokenResult(true);
        if (isMounted) setIsAdmin(Boolean(token.claims.admin));
      } catch {
        if (isMounted) setIsAdmin(false);
      } finally {
        if (isMounted) setIsCheckingAdmin(false);
      }
    };

    if (!loading) checkAdmin();

    return () => {
      isMounted = false;
    };
  }, [loading, user?.id]);

  useEffect(() => {
    const loadRoadmap = async () => {
      const roadmap = await roadmapService.getRoadmap(selectedRoadmap);
      setRoadmapJson(JSON.stringify(roadmap, null, 2));
      setRoadmapStatus("");
    };

    if (isAdmin) loadRoadmap();
  }, [isAdmin, selectedRoadmap]);

  const authHeader = async () => {
    const token = await auth.currentUser?.getIdToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const loadPosts = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const response = await fetch("/api/admin/blog", {
        headers: await authHeader(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load posts");
      setPosts(data.posts || []);
    } catch (error) {
      setBlogStatus(error.message);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && activeTab === "blog") loadPosts();
  }, [isAdmin, activeTab, loadPosts]);

  const roadmapSummary = useMemo(() => {
    try {
      const parsed = JSON.parse(roadmapJson);
      const modules = parsed.modules || [];
      const items = modules.reduce(
        (count, module) => count + (module.items?.length || 0),
        0
      );
      return `${modules.length} modules, ${items} tracked items`;
    } catch {
      return "Invalid JSON";
    }
  }, [roadmapJson]);

  const saveRoadmap = async () => {
    setRoadmapStatus("Saving...");

    try {
      const parsed = JSON.parse(roadmapJson);
      if (!Array.isArray(parsed.modules) || parsed.modules.length === 0) {
        throw new Error("Roadmap must include modules");
      }

      await roadmapService.saveRoadmap(selectedRoadmap, parsed);
      setRoadmapStatus("Saved roadmap changes.");
    } catch (error) {
      setRoadmapStatus(error.message);
    }
  };

  const selectPost = (post) => {
    setPostForm({
      slug: post.slug || "",
      title: post.title || "",
      excerpt: post.excerpt || "",
      date: (post.date || new Date().toISOString()).slice(0, 10),
      author: post.author || "FroggoCodes",
      tags: (post.tags || []).join(", "),
      featured: Boolean(post.featured),
      content: post.content || "",
    });
    setBlogStatus("");
  };

  const savePost = async () => {
    setBlogStatus("Saving...");

    try {
      const payload = {
        ...postForm,
        tags: postForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      const response = await fetch("/api/admin/blog", {
        method: "POST",
        headers: await authHeader(),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save post");

      setBlogStatus("Saved blog post.");
      await loadPosts();
    } catch (error) {
      setBlogStatus(error.message);
    }
  };

  if (loading || isCheckingAdmin) {
    return (
      <main className="min-h-screen bg-[#111111] text-white">
        <Suspense>
          <Header />
        </Suspense>
        <div className="mx-auto max-w-6xl px-6 py-28">Checking access...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#111111] text-white">
        <Suspense>
          <Header />
        </Suspense>
        <section className="mx-auto max-w-3xl px-6 py-28 text-center">
          <h1 className="text-4xl font-black">Admin access</h1>
          <p className="mt-4 text-white/65">
            Sign in with an account that has the Firebase admin custom claim.
          </p>
          <button
            onClick={openSignIn}
            className="mt-8 rounded-lg bg-emerald-500 px-6 py-3 font-black text-white hover:bg-emerald-400"
          >
            Sign In
          </button>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[#111111] text-white">
        <Suspense>
          <Header />
        </Suspense>
        <section className="mx-auto max-w-3xl px-6 py-28 text-center">
          <h1 className="text-4xl font-black">Not authorized</h1>
          <p className="mt-4 text-white/65">
            This dashboard only opens for users with the admin custom claim.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <Suspense>
        <Header />
      </Suspense>
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-10">
        <div className="mb-8 rounded-lg border border-white/10 bg-[linear-gradient(135deg,#171717,#14231f_50%,#181820)] p-6">
          <div className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200">
            Admin
          </div>
          <h1 className="mt-3 text-4xl font-black">Content Control Center</h1>
          <p className="mt-3 max-w-3xl text-white/65">
            Manage courses, videos, pricing, free roadmaps, and Markdown blog
            posts. Course and video changes go straight to Firestore.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {["courses", "roadmaps", "blog"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg border px-5 py-3 text-sm font-black capitalize transition ${
                activeTab === tab
                  ? "border-emerald-300/40 bg-emerald-300/[0.1] text-emerald-50"
                  : "border-white/10 bg-white/[0.03] text-white/65 hover:border-white/25"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "courses" ? (
          <CoursesAdmin />
        ) : activeTab === "roadmaps" ? (
          <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="rounded-lg border border-white/10 bg-[#171717] p-4">
              <div className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.16em] text-white/40">
                Roadmaps
              </div>
              {roadmapIds.map((id) => (
                <button
                  key={id}
                  onClick={() => setSelectedRoadmap(id)}
                  className={`mb-2 w-full rounded-lg border px-4 py-3 text-left font-bold capitalize ${
                    selectedRoadmap === id
                      ? "border-emerald-300/40 bg-emerald-300/[0.08]"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  {id}
                </button>
              ))}
            </aside>

            <div className="rounded-lg border border-white/10 bg-[#171717] p-5">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-black capitalize">
                    {selectedRoadmap} roadmap
                  </h2>
                  <p className="mt-1 text-sm text-white/50">
                    {roadmapSummary}
                  </p>
                </div>
                <button
                  onClick={saveRoadmap}
                  className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-black text-white hover:bg-emerald-400"
                >
                  Save Roadmap
                </button>
              </div>
              <textarea
                value={roadmapJson}
                onChange={(event) => setRoadmapJson(event.target.value)}
                spellCheck={false}
                className="min-h-[620px] w-full rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-sm leading-6 text-white/85 outline-none focus:border-emerald-300/50"
              />
              {roadmapStatus && (
                <p className="mt-3 text-sm text-white/65">{roadmapStatus}</p>
              )}
            </div>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
            <aside className="rounded-lg border border-white/10 bg-[#171717] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">
                  Posts
                </div>
                <button
                  onClick={() => setPostForm(emptyPost)}
                  className="text-xs font-bold text-emerald-200"
                >
                  New
                </button>
              </div>
              <div className="grid gap-2">
                {posts.map((post) => (
                  <button
                    key={post.slug}
                    onClick={() => selectPost(post)}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-left hover:border-white/25"
                  >
                    <div className="font-bold">{post.title}</div>
                    <div className="mt-1 text-xs text-white/45">
                      /blog/{post.slug}
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            <div className="rounded-lg border border-white/10 bg-[#171717] p-5">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-black">Blog editor</h2>
                  <p className="mt-1 text-sm text-white/50">
                    Writes Markdown files into content/blog after admin token
                    verification.
                  </p>
                </div>
                <button
                  onClick={savePost}
                  className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-black text-white hover:bg-emerald-400"
                >
                  Save Post
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {["slug", "title", "excerpt", "date", "author", "tags"].map(
                  (field) => (
                    <label key={field} className="grid gap-2 text-sm">
                      <span className="font-bold capitalize text-white/70">
                        {field}
                      </span>
                      <input
                        value={postForm[field]}
                        onChange={(event) =>
                          setPostForm((prev) => ({
                            ...prev,
                            [field]: event.target.value,
                          }))
                        }
                        className="rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-white outline-none focus:border-emerald-300/50"
                      />
                    </label>
                  )
                )}
              </div>

              <label className="mt-4 flex items-center gap-3 text-sm font-bold text-white/70">
                <input
                  type="checkbox"
                  checked={postForm.featured}
                  onChange={(event) =>
                    setPostForm((prev) => ({
                      ...prev,
                      featured: event.target.checked,
                    }))
                  }
                />
                Featured post
              </label>

              <label className="mt-4 grid gap-2 text-sm">
                <span className="font-bold text-white/70">Markdown content</span>
                <textarea
                  value={postForm.content}
                  onChange={(event) =>
                    setPostForm((prev) => ({
                      ...prev,
                      content: event.target.value,
                    }))
                  }
                  className="min-h-[420px] rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-sm leading-6 text-white/85 outline-none focus:border-emerald-300/50"
                />
              </label>

              {blogStatus && (
                <p className="mt-3 text-sm text-white/65">{blogStatus}</p>
              )}
            </div>
          </section>
        )}
      </section>
      <Footer />
    </main>
  );
};

export default AdminDashboard;
