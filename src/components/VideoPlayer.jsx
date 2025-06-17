"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { courseService } from "@/libs/courseService";
import { bunnyUtils } from "@/utils/bunnyUtils";
import config from "@/config";

const VideoPlayer = ({
  isOpen,
  onClose,
  video,
  courseId,
  onProgressUpdate,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null);
  const iframeRef = useRef(null);

  // Verify access when component mounts or video changes
  useEffect(() => {
    const verifyAccess = async () => {
      if (!isOpen || !user || !video || !courseId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Verify user has purchased the course
        const accessGranted = await courseService.verifyUserCourseAccess(
          user.id,
          courseId
        );

        if (!accessGranted) {
          setError(
            "You don't have access to this video. Please purchase the course first."
          );
          setHasAccess(false);
        } else {
          setHasAccess(true);
        }
      } catch (err) {
        console.error("Error verifying video access:", err);
        setError("Failed to verify video access. Please try again.");
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAccess();
  }, [isOpen, user, video, courseId]);

  // Initialize Player.js when video is ready to play
  useEffect(() => {
    const initializePlayer = async () => {
      if (!hasAccess || !iframeRef.current || player) return;

      try {
        // Load Player.js library
        const playerjs = await bunnyUtils.loadPlayerJs();

        // Create player instance
        const playerInstance = new playerjs.Player(iframeRef.current);

        // Set up event listeners
        playerInstance.on("ready", () => {
          console.log("Video player ready");
        });

        playerInstance.on("play", () => {
          console.log("Video started playing");
        });

        playerInstance.on("pause", () => {
          console.log("Video paused");
        });

        playerInstance.on("timeupdate", (data) => {
          try {
            const timingData = JSON.parse(data);
            const { seconds, duration } = timingData;

            // Calculate progress percentage
            const progressPercentage = (seconds / duration) * 100;

            // Update progress every 10% milestone to avoid too frequent updates
            const milestone = Math.floor(progressPercentage / 10) * 10;

            // Call progress update callback if provided
            if (onProgressUpdate && milestone > 0) {
              onProgressUpdate(video.id, {
                currentTime: seconds,
                duration: duration,
                progressPercentage: progressPercentage,
              });
            }
          } catch (err) {
            console.error("Error parsing timeupdate data:", err);
          }
        });

        playerInstance.on("ended", () => {
          console.log("Video ended");
          // Mark video as completed
          if (onProgressUpdate) {
            onProgressUpdate(video.id, {
              completed: true,
              progressPercentage: 100,
            });
          }
        });

        setPlayer(playerInstance);
      } catch (err) {
        console.error("Error initializing video player:", err);
        setError(
          "Failed to initialize video player. Please refresh and try again."
        );
      }
    };

    initializePlayer();

    // Cleanup function
    return () => {
      if (player) {
        try {
          player.off("ready");
          player.off("play");
          player.off("pause");
          player.off("timeupdate");
          player.off("ended");
        } catch (err) {
          console.error("Error cleaning up player:", err);
        }
      }
    };
  }, [hasAccess, video, onProgressUpdate, player]);

  // Generate video embed URL
  const getEmbedUrl = () => {
    if (!video || !video.bunny_video_id) {
      return null;
    }

    // Get library ID from video's course data or fallback to global config
    const libraryId = video.course_bunny_library_id || config.bunny.libraryId;

    if (!libraryId) {
      console.error("No library ID found for video:", video);
      return null;
    }

    return bunnyUtils.generateEmbedUrl(libraryId, video.bunny_video_id, {
      autoplay: false,
      preload: true,
      muted: false,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">
            {video?.title || "Video Player"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Video Content */}
        <div className="mb-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 bg-neutral-700 rounded-lg">
              <div className="text-white">Loading video...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 bg-neutral-700 rounded-lg">
              <div className="text-red-400 text-center">
                <p className="mb-2">⚠️ {error}</p>
                <button
                  onClick={onClose}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : hasAccess && getEmbedUrl() ? (
            <div className="relative" style={{ paddingTop: "56.25%" }}>
              <iframe
                ref={iframeRef}
                src={getEmbedUrl()}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-neutral-700 rounded-lg">
              <div className="text-gray-400">Video not available</div>
            </div>
          )}
        </div>

        {/* Video Info */}
        {video && (
          <div className="text-gray-400">
            <p className="mb-2">{video.description}</p>
            <p className="text-sm">Duration: {video.duration}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
