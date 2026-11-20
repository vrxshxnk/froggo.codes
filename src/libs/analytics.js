import { analyticsPromise } from "./firebase";
import { logEvent } from "firebase/analytics";

// Fire-and-forget: never blocks the UI, never throws
export const trackEvent = (eventName, eventParams = {}) => {
  analyticsPromise
    .then((analytics) => {
      if (analytics) logEvent(analytics, eventName, eventParams);
    })
    .catch((error) => {
      console.warn("Failed to track event:", error);
    });
};
