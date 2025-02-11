import { analytics } from './firebase';
import { logEvent } from 'firebase/analytics';

export const trackEvent = (eventName, eventParams = {}) => {
  if (analytics) {
    try {
      logEvent(analytics, eventName, eventParams);
    } catch (error) {
      console.warn('Failed to track event:', error);
    }
  }
};