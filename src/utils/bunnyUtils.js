import config from "@/config";

/**
 * Bunny.net video streaming utilities
 */
export const bunnyUtils = {
  /**
   * Generate Bunny.net embed URL for a video
   * @param {string} libraryId - The Bunny.net library ID (single library for all courses)
   * @param {string} videoId - The Bunny.net video ID (includes collection/course prefix)
   * @param {Object} options - Optional parameters for the embed URL
   * @returns {string} Complete embed URL
   */
  generateEmbedUrl(libraryId, videoId, options = {}) {
    const { embedBaseUrl } = config.bunny;
    const baseUrl = `${embedBaseUrl}/${libraryId}/${videoId}`;

    // Add query parameters if provided
    const params = new URLSearchParams();
    if (options.autoplay !== undefined)
      params.set("autoplay", options.autoplay);
    if (options.muted !== undefined) params.set("muted", options.muted);
    if (options.preload !== undefined) params.set("preload", options.preload);
    if (options.t !== undefined) params.set("t", options.t); // Start time

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  },

  /**
   * Generate collection-based video ID for single library approach
   * @param {string} courseId - The course identifier (used as collection name)
   * @param {number} videoSequence - The video sequence number in the course
   * @returns {string} Bunny.net video ID with collection prefix
   */
  generateCollectionVideoId(courseId, videoSequence) {
    return `${courseId}/Video${videoSequence}`;
  },

  /**
   * Legacy: Generate Bunny.net video ID from video sequence (for backward compatibility)
   * @param {number} videoSequence - The video sequence number in the course
   * @returns {string} Bunny.net video ID
   */
  generateVideoId(videoSequence) {
    return `Video${videoSequence}`;
  },

  /**
   * Legacy method for backward compatibility
   * Generate Bunny.net video ID from course and video sequence
   * @param {string} courseId - The course identifier
   * @param {number} videoSequence - The video sequence number in the course
   * @returns {string} Bunny.net video ID
   */
  generateLegacyVideoId(courseId, videoSequence) {
    return `${courseId}-Video${videoSequence}`;
  },

  /**
   * Load Player.js library dynamically
   * @returns {Promise} Promise that resolves when Player.js is loaded
   */
  loadPlayerJs() {
    return new Promise((resolve, reject) => {
      // Check if Player.js is already loaded
      if (typeof window !== "undefined" && window.playerjs) {
        resolve(window.playerjs);
        return;
      }

      const script = document.createElement("script");
      script.src = config.bunny.playerJsUrl;
      script.type = "text/javascript";

      script.onload = () => {
        if (window.playerjs) {
          resolve(window.playerjs);
        } else {
          reject(new Error("Player.js failed to load properly"));
        }
      };

      script.onerror = () => {
        reject(new Error("Failed to load Player.js library"));
      };

      document.head.appendChild(script);
    });
  },

  /**
   * Validate video access permissions
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @param {Function} checkUserCourse - Function to check if user has access to course
   * @returns {Promise<boolean>} Whether user has access to the video
   */
  async validateVideoAccess(userId, courseId, checkUserCourse) {
    try {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const hasAccess = await checkUserCourse(userId, courseId);
      if (!hasAccess) {
        throw new Error("User has not purchased this course");
      }

      return true;
    } catch (error) {
      console.error("Video access validation failed:", error);
      return false;
    }
  },
};
