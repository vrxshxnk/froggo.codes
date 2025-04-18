"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { vimeoService } from "@/libs/vimeoService";

const VideoPlayer = ({ videoId, courseId, onComplete }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Load Vimeo Player SDK
    const script = document.createElement("script");
    script.src = "https://player.vimeo.com/api/player.js";
    script.async = true;
    script.onload = () => initializePlayer();
    document.body.appendChild(script);

    return () => {
      // Clean up the script and player when component unmounts
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      document.body.removeChild(script);
    };
  }, []);

  const initializePlayer = async () => {
    if (!user || !videoId || !courseId) {
      setError("Missing required data");
      setLoading(false);
      return;
    }

    try {
      // Verify purchase and get secure token for this video
      const token = await vimeoService.generateVideoToken(
        user.id,
        videoId,
        courseId
      );

      // Create Vimeo player with private video access token
      if (window.Vimeo && containerRef.current) {
        playerRef.current = new window.Vimeo.Player(containerRef.current, {
          id: videoId,
          width: "100%",
          height: "100%",
          responsive: true,
          controls: true,
          dnt: true, // Do not track
          playsinline: true,
          title: false,
          byline: false,
          portrait: false,
          autopause: true,
          autoplay: false,
          pip: true,
          // Add the token for private video access
          ...(token && { token }),
        });

        // Set up event listeners
        playerRef.current.on("loaded", () => {
          setPlayerReady(true);
          setLoading(false);
        });

        playerRef.current.on("ended", () => {
          if (onComplete && typeof onComplete === "function") {
            onComplete(videoId);
          }
        });

        playerRef.current.on("error", (err) => {
          console.error("Vimeo player error:", err);
          setError("Failed to load video");
          setLoading(false);
        });
      }
    } catch (err) {
      console.error("Error initializing video player:", err);
      setError(err.message || "Failed to load video");
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-neutral-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
        <div className="text-white text-center p-6">
          <p className="mb-2">Error: {error}</p>
          <p className="text-sm text-gray-400">
            {error === "User has not purchased this course"
              ? "Purchase this course to watch the video"
              : "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-neutral-900 rounded-lg overflow-hidden aspect-video">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white">Loading video...</div>
        </div>
      )}
      <div
        ref={containerRef}
        className={`w-full h-full ${loading ? "opacity-0" : "opacity-100"}`}
      />
    </div>
  );
};

export default VideoPlayer;
