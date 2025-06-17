"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { courseService } from "@/libs/courseService";
import VideoPlayer from "@/components/VideoPlayer";
import Link from "next/link";

const CourseDetail = ({ params }) => {
  const courseId = use(params).courseId;
  const { user, loading } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);

  // Protect the route
  useEffect(() => {
    if (!loading && !user) {
      router.push("/?signin=true");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (user && courseId) {
        try {
          // Fetch course details including videos
          const courseDetails = await courseService.getCourseDetails(courseId);

          // Fetch progress for this course
          const courseProgress = await courseService.getCourseProgress(
            user.id,
            courseId
          );

          // Create a progress map for easier access
          const progressMap = {};
          courseProgress.videos.forEach((p) => {
            progressMap[p.video_id] = p.completed;
          });

          setCourse({
            ...courseDetails,
            videos: courseDetails.videos.map((video, index) => ({
              ...video,
              completed: progressMap[video.id] || false,
              // Add bunny_video_id if not present
              // Use simple Video1, Video2, etc. since each course has its own library
              bunny_video_id:
                video.bunny_video_id || `Video${video.order || index + 1}`,
            })),
          });
          setProgress(progressMap);
        } catch (error) {
          console.error("Error fetching course data:", error);
          router.push("/my-courses"); // Redirect on error
        }
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [user, courseId, router]);

  const handleVideoComplete = async (videoId) => {
    try {
      const newStatus = !progress[videoId];
      // Update progress in UI
      setProgress((prev) => ({
        ...prev,
        [videoId]: newStatus,
      }));

      // Update in database with courseId
      await courseService.updateVideoProgress(
        user.id,
        videoId,
        courseId,
        newStatus
      );

      // Update course state to reflect new progress
      if (course && course.videos) {
        setCourse((prev) => ({
          ...prev,
          videos: prev.videos.map((video) => ({
            ...video,
            completed: video.id === videoId ? newStatus : video.completed,
          })),
        }));
      }
    } catch (error) {
      console.error("Error updating video progress:", error);
      // Revert UI change if update fails
      setProgress((prev) => ({
        ...prev,
        [videoId]: !newStatus,
      }));
    }
  };

  const handleWatchVideo = (video) => {
    setSelectedVideo(video);
    setIsVideoPlayerOpen(true);
  };

  const handleVideoPlayerClose = () => {
    setIsVideoPlayerOpen(false);
    setSelectedVideo(null);
  };

  const handleVideoProgressUpdate = async (videoId, progressData) => {
    try {
      // Update progress in database if video is completed
      if (progressData.completed) {
        await courseService.updateVideoProgress(
          user.id,
          videoId,
          courseId,
          true
        );

        // Update local state
        setProgress((prev) => ({
          ...prev,
          [videoId]: true,
        }));

        // Update course state
        if (course && course.videos) {
          setCourse((prev) => ({
            ...prev,
            videos: prev.videos.map((video) => ({
              ...video,
              completed: video.id === videoId ? true : video.completed,
            })),
          }));
        }
      }
    } catch (error) {
      console.error("Error updating video progress from player:", error);
    }
  };

  const calculateProgress = () => {
    if (!course || !course.videos) return 0;
    const completed = course.videos.filter(
      (video) => progress[video.id] || video.completed
    ).length;
    return Math.round((completed / course.videos.length) * 100);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  if (!course) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-white">Course not found</div>
      </div>
    );
  }

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
            {course.videos &&
              course.videos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleVideoComplete(video.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        progress[video.id] || video.completed
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-gray-400"
                      }`}
                    >
                      {(progress[video.id] || video.completed) && (
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
                  <button
                    onClick={() => handleWatchVideo(video)}
                    className="text-emerald-500 hover:text-emerald-400 transition-colors"
                  >
                    Watch
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      <VideoPlayer
        isOpen={isVideoPlayerOpen}
        onClose={handleVideoPlayerClose}
        video={selectedVideo}
        courseId={courseId}
        onProgressUpdate={handleVideoProgressUpdate}
      />
    </main>
  );
};

export default CourseDetail;
