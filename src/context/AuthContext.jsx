"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/libs/supabase";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/utils/errorHandling";
import { sessionManager } from "@/utils/sessionManager";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check and refresh session if needed
        const session = await sessionManager.refreshSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Auth initialization error:", error);
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN") {
        router.refresh();
      }
      if (event === "SIGNED_OUT") {
        router.refresh();
        router.push("/");
      }
      if (event === "USER_UPDATED") {
        setUser(session?.user ?? null);
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleAuthError = (error) => {
    const message = getErrorMessage(error);
    setError(message);
    return { error: message };
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) return handleAuthError(error);
    } catch (error) {
      return handleAuthError(error);
    }
  };

  const signInWithApple = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in with Apple:", error);
      throw error;
    }
  };

  const signInWithMagicLink = async (email) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error sending magic link:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const success = await sessionManager.clearSession();
      if (!success) throw new Error("Failed to sign out");
      router.push("/");
    } catch (error) {
      return handleAuthError(error);
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithApple,
    signInWithMagicLink,
    signOut,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
