"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/libs/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

const emptyCourse = {
  id: "",
  title: "",
  description: "",
  thumbnail: "",
  price_india: 9999,
  price_int: 499,
  discount: 50,
  highlight: false,
  paddle_price_id: "",
};

const emptyFeatures = {
  videoCount: "30+",
  projectCount: "10+",
  description: "",
  features: "",
};

const emptyVideo = {
  id: null,
  title: "",
  description: "",
  duration: "",
  order: 1,
  bunny_video_id: "",
  is_preview: false,
};

const inputClass =
  "rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-white outline-none focus:border-emerald-300/50";

const Field = ({ label, children }) => (
  <label className="grid gap-2 text-sm">
    <span className="font-bold text-white/70">{label}</span>
    {children}
  </label>
);

const CoursesAdmin = () => {
  const [courses, setCourses] = useState([]);
  const [selectedId, setSelectedId] = useState(null); // null = creating new
  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [featuresForm, setFeaturesForm] = useState(emptyFeatures);
  const [videos, setVideos] = useState([]);
  const [videoForm, setVideoForm] = useState(emptyVideo);
  const [status, setStatus] = useState("");

  const loadCourses = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, "courses"));
      setCourses(
        snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }))
      );
    } catch (error) {
      setStatus(`Failed to load courses: ${error.message}`);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const loadVideos = useCallback(async (courseId) => {
    const snapshot = await getDocs(
      query(collection(db, "videos"), where("course_id", "==", courseId))
    );
    const list = snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    }));
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    setVideos(list);
  }, []);

  const selectCourse = async (course) => {
    setSelectedId(course.id);
    setStatus("");
    setVideoForm(emptyVideo);
    setCourseForm({
      id: course.id,
      title: course.title || "",
      description: course.description || "",
      thumbnail: course.thumbnail || "",
      price_india: course.price_india ?? 9999,
      price_int: course.price_int ?? 499,
      discount: course.discount ?? 50,
      highlight: Boolean(course.highlight),
      paddle_price_id: course.paddle_price_id || "",
    });

    try {
      const featureDoc = await getDoc(doc(db, "features", course.id));
      if (featureDoc.exists()) {
        const data = featureDoc.data();
        setFeaturesForm({
          videoCount: data.videoCount || "",
          projectCount: data.projectCount || "",
          description: data.description || "",
          features: (data.features || []).join("\n"),
        });
      } else {
        setFeaturesForm(emptyFeatures);
      }

      await loadVideos(course.id);
    } catch (error) {
      setStatus(`Failed to load course details: ${error.message}`);
    }
  };

  const startNewCourse = () => {
    setSelectedId(null);
    setCourseForm(emptyCourse);
    setFeaturesForm(emptyFeatures);
    setVideos([]);
    setVideoForm(emptyVideo);
    setStatus("");
  };

  const setCourseField = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setCourseForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveCourse = async () => {
    setStatus("Saving course...");

    try {
      const courseId = (selectedId || courseForm.id).trim();
      if (!/^[a-zA-Z0-9_-]{1,50}$/.test(courseId)) {
        throw new Error(
          "Course ID must be a slug (letters, numbers, - and _), e.g. zero-to-hero"
        );
      }
      if (!courseForm.title.trim()) {
        throw new Error("Title is required");
      }

      await setDoc(
        doc(db, "courses", courseId),
        {
          title: courseForm.title.trim(),
          description: courseForm.description,
          thumbnail: courseForm.thumbnail,
          price_india: Number(courseForm.price_india) || 0,
          price_int: Number(courseForm.price_int) || 0,
          discount: Number(courseForm.discount) || 0,
          highlight: Boolean(courseForm.highlight),
          paddle_price_id: courseForm.paddle_price_id.trim(),
        },
        { merge: true }
      );

      setSelectedId(courseId);
      setStatus("Course saved.");
      await loadCourses();
    } catch (error) {
      setStatus(error.message);
    }
  };

  const deleteCourse = async () => {
    if (!selectedId) return;
    if (
      !window.confirm(
        `Delete course "${selectedId}"? Existing buyers keep their enrollment records, but the course page will stop working. This cannot be undone.`
      )
    ) {
      return;
    }

    setStatus("Deleting course...");
    try {
      await deleteDoc(doc(db, "courses", selectedId));
      startNewCourse();
      setStatus("Course deleted.");
      await loadCourses();
    } catch (error) {
      setStatus(error.message);
    }
  };

  const saveFeatures = async () => {
    if (!selectedId) {
      setStatus("Save the course first, then its features.");
      return;
    }

    setStatus("Saving features...");
    try {
      await setDoc(doc(db, "features", selectedId), {
        videoCount: featuresForm.videoCount,
        projectCount: featuresForm.projectCount,
        description: featuresForm.description,
        features: featuresForm.features
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      });
      setStatus("Features saved.");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const setVideoField = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setVideoForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveVideo = async () => {
    if (!selectedId) {
      setStatus("Save the course first, then add videos.");
      return;
    }

    setStatus("Saving video...");
    try {
      if (!videoForm.title.trim()) {
        throw new Error("Video title is required");
      }
      const guid = videoForm.bunny_video_id.trim();
      if (!/^[a-zA-Z0-9-]{8,100}$/.test(guid)) {
        throw new Error(
          "Bunny Video ID must be the GUID shown on the video's page in the Bunny dashboard"
        );
      }

      const data = {
        course_id: selectedId,
        title: videoForm.title.trim(),
        description: videoForm.description,
        duration: videoForm.duration,
        order: Number(videoForm.order) || 0,
        bunny_video_id: guid,
        is_preview: Boolean(videoForm.is_preview),
      };

      if (videoForm.id) {
        await setDoc(doc(db, "videos", videoForm.id), data, { merge: true });
      } else {
        await addDoc(collection(db, "videos"), data);
      }

      setVideoForm(emptyVideo);
      setStatus("Video saved.");
      await loadVideos(selectedId);
    } catch (error) {
      setStatus(error.message);
    }
  };

  const deleteVideo = async (video) => {
    if (!window.confirm(`Delete video "${video.title}"?`)) return;

    setStatus("Deleting video...");
    try {
      await deleteDoc(doc(db, "videos", video.id));
      if (videoForm.id === video.id) setVideoForm(emptyVideo);
      setStatus("Video deleted.");
      await loadVideos(selectedId);
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-lg border border-white/10 bg-[#171717] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">
            Courses
          </div>
          <button
            onClick={startNewCourse}
            className="text-xs font-bold text-emerald-200"
          >
            New
          </button>
        </div>
        <div className="grid gap-2">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => selectCourse(course)}
              className={`rounded-lg border p-3 text-left ${
                selectedId === course.id
                  ? "border-emerald-300/40 bg-emerald-300/[0.08]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/25"
              }`}
            >
              <div className="font-bold">{course.title || course.id}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-white/45">
                <span>{course.id}</span>
                {course.highlight && (
                  <span className="rounded bg-emerald-400/20 px-1.5 py-0.5 text-emerald-300">
                    on landing page
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <div className="grid gap-6">
        {/* Course details */}
        <div className="rounded-lg border border-white/10 bg-[#171717] p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">
                {selectedId ? `Edit: ${selectedId}` : "New course"}
              </h2>
              <p className="mt-1 text-sm text-white/50">
                Prices are the pre-discount anchors. &quot;Show on landing
                page&quot; sets the highlight flag used by the pricing
                slideshow.
              </p>
            </div>
            <div className="flex gap-3">
              {selectedId && (
                <button
                  onClick={deleteCourse}
                  className="rounded-lg border border-red-400/40 px-5 py-3 text-sm font-black text-red-300 hover:bg-red-400/10"
                >
                  Delete
                </button>
              )}
              <button
                onClick={saveCourse}
                className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-black text-white hover:bg-emerald-400"
              >
                Save Course
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {!selectedId && (
              <Field label="Course ID (slug, permanent)">
                <input
                  value={courseForm.id}
                  onChange={setCourseField("id")}
                  placeholder="zero-to-hero"
                  className={inputClass}
                />
              </Field>
            )}
            <Field label="Title">
              <input
                value={courseForm.title}
                onChange={setCourseField("title")}
                className={inputClass}
              />
            </Field>
            <Field label="Thumbnail URL">
              <input
                value={courseForm.thumbnail}
                onChange={setCourseField("thumbnail")}
                className={inputClass}
              />
            </Field>
            <Field label="Price India (₹)">
              <input
                type="number"
                value={courseForm.price_india}
                onChange={setCourseField("price_india")}
                className={inputClass}
              />
            </Field>
            <Field label="Price International ($, shown only)">
              <input
                type="number"
                value={courseForm.price_int}
                onChange={setCourseField("price_int")}
                className={inputClass}
              />
            </Field>
            <Field label="Discount %">
              <input
                type="number"
                value={courseForm.discount}
                onChange={setCourseField("discount")}
                className={inputClass}
              />
            </Field>
            <Field label="Paddle Price ID (intl. checkout, e.g. pri_...)">
              <input
                value={courseForm.paddle_price_id}
                onChange={setCourseField("paddle_price_id")}
                placeholder="leave empty to charge everyone via Razorpay INR"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={courseForm.description}
              onChange={setCourseField("description")}
              className={`${inputClass} mt-3 min-h-[80px]`}
            />
          </Field>

          <label className="mt-4 flex items-center gap-3 text-sm font-bold text-white/70">
            <input
              type="checkbox"
              checked={courseForm.highlight}
              onChange={setCourseField("highlight")}
            />
            Show on landing page (highlight)
          </label>
        </div>

        {/* Pricing-card features */}
        <div className="rounded-lg border border-white/10 bg-[#171717] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black">Pricing card content</h3>
              <p className="mt-1 text-sm text-white/50">
                Stats and bullet points shown next to the price. One feature
                per line.
              </p>
            </div>
            <button
              onClick={saveFeatures}
              className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-black text-white hover:bg-emerald-400"
            >
              Save Features
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Video count (e.g. 30+)">
              <input
                value={featuresForm.videoCount}
                onChange={(e) =>
                  setFeaturesForm((prev) => ({
                    ...prev,
                    videoCount: e.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Project count (e.g. 10+)">
              <input
                value={featuresForm.projectCount}
                onChange={(e) =>
                  setFeaturesForm((prev) => ({
                    ...prev,
                    projectCount: e.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Tagline">
              <input
                value={featuresForm.description}
                onChange={(e) =>
                  setFeaturesForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Features (one per line)">
            <textarea
              value={featuresForm.features}
              onChange={(e) =>
                setFeaturesForm((prev) => ({
                  ...prev,
                  features: e.target.value,
                }))
              }
              className={`${inputClass} mt-3 min-h-[140px]`}
            />
          </Field>
        </div>

        {/* Videos */}
        <div className="rounded-lg border border-white/10 bg-[#171717] p-5">
          <div className="mb-4">
            <h3 className="text-xl font-black">Videos</h3>
            <p className="mt-1 text-sm text-white/50">
              Upload the video in the Bunny dashboard first, then paste its
              Video GUID here. &quot;Free preview&quot; videos are watchable by
              anyone from the landing page.
            </p>
          </div>

          <div className="mb-5 grid gap-2">
            {videos.map((video) => (
              <div
                key={video.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3"
              >
                <div>
                  <div className="font-bold">
                    {video.order}. {video.title}
                    {video.is_preview && (
                      <span className="ml-2 rounded bg-emerald-400/20 px-1.5 py-0.5 text-xs text-emerald-300">
                        free preview
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-mono text-xs text-white/40">
                    {video.bunny_video_id || "⚠ no Bunny GUID — won't play"}
                  </div>
                </div>
                <div className="flex gap-3 text-sm font-bold">
                  <button
                    onClick={() =>
                      setVideoForm({
                        id: video.id,
                        title: video.title || "",
                        description: video.description || "",
                        duration: video.duration || "",
                        order: video.order || 0,
                        bunny_video_id: video.bunny_video_id || "",
                        is_preview: Boolean(video.is_preview),
                      })
                    }
                    className="text-emerald-200 hover:text-emerald-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteVideo(video)}
                    className="text-red-300 hover:text-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {videos.length === 0 && (
              <div className="rounded-lg border border-dashed border-white/15 p-4 text-sm text-white/40">
                No videos yet.
              </div>
            )}
          </div>

          <div className="rounded-lg border border-white/10 bg-black/25 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-black">
                {videoForm.id ? "Edit video" : "Add video"}
              </div>
              {videoForm.id && (
                <button
                  onClick={() => setVideoForm(emptyVideo)}
                  className="text-xs font-bold text-white/50 hover:text-white/80"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Title">
                <input
                  value={videoForm.title}
                  onChange={setVideoField("title")}
                  className={inputClass}
                />
              </Field>
              <Field label="Bunny Video GUID">
                <input
                  value={videoForm.bunny_video_id}
                  onChange={setVideoField("bunny_video_id")}
                  placeholder="e.g. 8f3a1c2e-1d4b-4a9e-93a7-2f6c1b0d9e42"
                  className={`${inputClass} font-mono`}
                />
              </Field>
              <Field label="Order">
                <input
                  type="number"
                  value={videoForm.order}
                  onChange={setVideoField("order")}
                  className={inputClass}
                />
              </Field>
              <Field label="Duration (e.g. 12:34)">
                <input
                  value={videoForm.duration}
                  onChange={setVideoField("duration")}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                value={videoForm.description}
                onChange={setVideoField("description")}
                className={`${inputClass} mt-3 min-h-[60px]`}
              />
            </Field>

            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center gap-3 text-sm font-bold text-white/70">
                <input
                  type="checkbox"
                  checked={videoForm.is_preview}
                  onChange={setVideoField("is_preview")}
                />
                Free preview (watchable without purchase)
              </label>
              <button
                onClick={saveVideo}
                className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-black text-white hover:bg-emerald-400"
              >
                Save Video
              </button>
            </div>
          </div>
        </div>

        {status && <p className="text-sm text-white/65">{status}</p>}
      </div>
    </section>
  );
};

export default CoursesAdmin;
