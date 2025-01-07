import { supabase } from "@/libs/supabase";

export const sessionManager = {
  async refreshSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;

      if (session && this.isSessionExpiringSoon(session)) {
        const {
          data: { session: newSession },
          error: refreshError,
        } = await supabase.auth.refreshSession();
        if (refreshError) throw refreshError;
        return newSession;
      }

      return session;
    } catch (error) {
      console.error("Error refreshing session:", error);
      return null;
    }
  },

  isSessionExpiringSoon(session) {
    if (!session?.expires_at) return false;
    const expirationTime = new Date(session.expires_at).getTime();
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    // Return true if session expires in less than 5 minutes
    return timeUntilExpiry < 300000;
  },

  async clearSession() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error clearing session:", error);
      return false;
    }
  },
};
