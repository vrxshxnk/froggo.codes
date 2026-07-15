"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { bunnyUtils } from "@/utils/bunnyUtils";
import { auth } from "@/libs/firebase";

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
  const [signedUrl, setSignedUrl] = useState(null);
  const iframeRef = useRef(null);
  const lastPositionSaveRef = useRef(0);

  /**
   * Fetch signed video URL from secure API
   * This verifies access server-side and returns a time-limited signed URL.
   * Preview videos don't require sign-in; everything else does.
   */
  const fetchSignedVideoUrl = useCallback(async () => {
    if (!video?.bunny_video_id) {
      throw new Error(
        "This video isn't linked to a Bunny video yet. Please contact support."
      );
    }

    if (!user && !video.is_preview) {
      throw new Error("Please log in to access this video");
    }

    try {
      // Attach the user's ID token when available (required for paid videos)
      const idToken = await auth.currentUser?.getIdToken();

      const response = await fetch("/api/get-video-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          videoId: video.bunny_video_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 401) {
          throw new Error("Please log in to access this video");
        } else if (response.status === 403) {
          throw new Error("You don't have access to this video. Please purchase the course first.");
        } else if (response.status === 429) {
          throw new Error("Too many requests. Please wait a moment and try again.");
        }

        throw new Error(errorData.error || "Failed to load video");
      }

      const data = await response.json();

      // Resume where the viewer left off (skip if barely started or completed)
      if (video.position > 30 && !video.completed) {
        return `${data.url}&t=${Math.floor(video.position)}`;
      }

      return data.url;

    } catch (err) {
      console.error("Error fetching signed video URL:", err);
      throw err;
    }
  }, [user, video]);

  // Verify access and fetch signed URL when component mounts or video changes
  useEffect(() => {
    const loadVideo = async () => {
      if (!isOpen || !video || (!user && !video.is_preview)) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSignedUrl(null);

      try {
        // Fetch signed URL from secure API (this also verifies access server-side)
        const url = await fetchSignedVideoUrl();

        if (url) {
          setSignedUrl(url);
          setHasAccess(true);
        } else {
          setError("Unable to load video. Please try again.");
          setHasAccess(false);
        }
      } catch (err) {
        console.error("Error loading video:", err);
        setError(err.message || "Failed to load video. Please try again.");
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideo();
  }, [isOpen, user, video, courseId, fetchSignedVideoUrl]);

  // Initialize Player.js when video is ready to play
  useEffect(() => {
    const initializePlayer = async () => {
      if (!hasAccess || !signedUrl || !iframeRef.current || player) return;

      try {
        // Load Player.js library
        const playerjs = await bunnyUtils.loadPlayerJs();

        // Create player instance
        const playerInstance = new playerjs.Player(iframeRef.current);

        // Set up event listeners
        playerInstance.on("ready", () => {});

        playerInstance.on("play", () => {});

        playerInstance.on("pause", () => {});

        playerInstance.on("timeupdate", (data) => {
          try {
            const timingData = typeof data === "string" ? JSON.parse(data) : data;
            const { seconds, duration } = timingData;

            if (!duration) return;

            // Save the playback position at most every 15 seconds so the
            // viewer can resume later without spamming Firestore writes
            const now = Date.now();
            if (onProgressUpdate && now - lastPositionSaveRef.current > 15000) {
              lastPositionSaveRef.current = now;
              onProgressUpdate(video.id, {
                currentTime: seconds,
                duration: duration,
                progressPercentage: (seconds / duration) * 100,
              });
            }
          } catch (err) {
            console.error("Error parsing timeupdate data:", err);
          }
        });

        playerInstance.on("ended", () => {
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
  }, [hasAccess, signedUrl, video, onProgressUpdate, player]);

  // Reset player when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPlayer(null);
      setSignedUrl(null);
      setHasAccess(false);
    }
  }, [isOpen]);

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
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <div className="text-white">Loading video...</div>
              </div>
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
          ) : hasAccess && signedUrl ? (
            <div className="relative" style={{ paddingTop: "56.25%" }}>
              <iframe
                ref={iframeRef}
                src={signedUrl}
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
