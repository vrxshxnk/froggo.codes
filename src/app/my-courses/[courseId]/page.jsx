"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { courseService } from "@/libs/courseService";
import Link from "next/link";

const CourseDetail = ({ params }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/?signin=true");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (user) {
        try {
          const courseData = await courseService.getCourseDetails(
            params.courseId
          );
          const progressData = await courseService.getCourseProgress(
            user.id,
            params.courseId
          );

          const progressLookup = progressData.reduce((acc, curr) => {
            acc[curr.video_id] = curr.completed;
            return acc;
          }, {});

          setCourse({
            ...courseData,
            videos: courseData.videos.sort(
              (a, b) => a.order_index - b.order_index
            ),
          });
          setProgress(progressLookup);

          await courseService.updateLastAccessed(user.id, params.courseId);
        } catch (error) {
          console.error("Error fetching course details:", error);
        }
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [user, params.courseId]);

  const handleVideoComplete = async (videoId) => {
    try {
      const newStatus = !progress[videoId];
      await courseService.updateVideoProgress(user.id, videoId, newStatus);
      setProgress((prev) => ({
        ...prev,
        [videoId]: newStatus,
      }));
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!course) return null;

  const calculateProgress = () => {
    const totalVideos = course.videos.length;
    const completedVideos = Object.values(progress).filter(Boolean).length;
    return Math.round((completedVideos / totalVideos) * 100);
  };

  return (
    <main className="min-h-screen bg-[#181818] py-24 px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/my-courses"
          className="text-white hover:text-gray-300 mb-8 inline-flex items-center"
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
          Back to My Courses
        </Link>

        <div className="bg-neutral-800 rounded-lg p-8 shadow-lg border border-white/10">
          <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
          <p className="text-gray-400 mb-8">{course.description}</p>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white">Course Progress</h2>
              <span className="text-emerald-500">{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4">
            {course.videos.map((video) => (
              <div
                key={video.id}
                className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleVideoComplete(video.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      progress[video.id]
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-gray-400"
                    }`}
                  >
                    {progress[video.id] && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                  <div>
                    <h3 className="text-white font-medium">{video.title}</h3>
                    <p className="text-gray-400 text-sm">{video.duration}</p>
                  </div>
                </div>
                <button className="text-emerald-500 hover:text-emerald-400">
                  Watch
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default CourseDetail;
