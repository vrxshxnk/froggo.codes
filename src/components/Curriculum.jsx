"use client";

import { useEffect, useState } from "react";
import config from "@/config";
import VideoPlayer from "@/components/VideoPlayer";

// Public course syllabus for the featured course. Preview lessons are
// playable by anyone; the rest show a lock and drive to pricing.
const Curriculum = () => {
  const [videos, setVideos] = useState([]);
  const [previewVideo, setPreviewVideo] = useState(null);

  useEffect(() => {
    const loadCurriculum = async () => {
      try {
        const response = await fetch(
          `/api/course-curriculum?courseId=${config.featuredCourseId}`
        );
        if (!response.ok) return;
        const data = await response.json();
        setVideos(data.videos || []);
      } catch {
        // Section simply doesn't render if the curriculum can't load
      }
    };

    loadCurriculum();
  }, []);

  if (videos.length === 0) return null;

  return (
    <section className="bg-[#181818] py-16 md:py-24 px-8" id="curriculum">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-center font-extrabold text-4xl md:text-5xl tracking-tight leading-normal mb-4">
          <span className="leading-loose text-5xl">🗺️</span>
          <br />
          <span className="text-white">What&apos;s Inside The Course</span>
        </h2>
        <p className="text-center text-neutral-400 text-lg mb-10 max-w-2xl mx-auto">
          {videos.length} lessons — watch the free previews before you decide 🐸
        </p>

        <div className="space-y-3">
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="flex items-center justify-between p-4 bg-neutral-800 border border-white/10 rounded-lg"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-neutral-500 font-mono text-sm w-6 text-right flex-shrink-0">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="text-white font-medium truncate">
                    {video.title}
                  </h3>
                  {video.duration && (
                    <p className="text-gray-500 text-sm">{video.duration}</p>
                  )}
                </div>
              </div>

              {video.is_preview && video.bunny_video_id ? (
                <button
                  onClick={() => setPreviewVideo(video)}
                  className="flex-shrink-0 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  ▶ Free Preview
                </button>
              ) : (
                <span className="flex-shrink-0 text-neutral-500" title="Unlocks with purchase">
                  🔒
                </span>
              )}
            </div>
          ))}
        </div>

        <p className="text-center mt-8">
          <a
            href="#pricing"
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-lg transition-colors"
          >
            Unlock All {videos.length} Lessons
          </a>
        </p>
      </div>

      <VideoPlayer
        isOpen={Boolean(previewVideo)}
        onClose={() => setPreviewVideo(null)}
        video={previewVideo}
        courseId={config.featuredCourseId}
      />
    </section>
  );
};

export default Curriculum;
