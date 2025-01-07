"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AuthPage() {
  const [loading, setLoading] = useState({
    magic: false,
    google: false,
    apple: false,
  });
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { signInWithGoogle, signInWithApple, signInWithMagicLink } = useAuth();

  const handleGoogleSignIn = async () => {
    setLoading((prev) => ({ ...prev, google: true }));
    try {
      await signInWithGoogle();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading((prev) => ({ ...prev, google: false }));
    }
  };

  const handleAppleSignIn = async () => {
    setLoading((prev) => ({ ...prev, apple: true }));
    try {
      await signInWithApple();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading((prev) => ({ ...prev, apple: false }));
    }
  };

  const handleMagicLinkSignIn = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, magic: true }));
    setError("");

    try {
      await signInWithMagicLink(email);
      alert("Check your email for the login link!");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading((prev) => ({ ...prev, magic: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center">
      <div className="bg-neutral-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Sign In
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading.google}
            className="w-full bg-white text-gray-800 p-2 rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading.google ? (
              <LoadingSpinner />
            ) : (
              <>
                <img src="/google.svg" alt="Google" className="w-5 h-5" />
                Sign in with Google
              </>
            )}
          </button>

          <button
            onClick={handleAppleSignIn}
            disabled={loading.apple}
            className="w-full bg-black text-white p-2 rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading.apple ? (
              <LoadingSpinner />
            ) : (
              <>
                <img src="/apple.svg" alt="Apple" className="w-5 h-5" />
                Sign in with Apple
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-neutral-800 text-gray-400">Or</span>
            </div>
          </div>

          <form onSubmit={handleMagicLinkSignIn}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md bg-neutral-700 text-white"
            />
            <button
              type="submit"
              disabled={loading.magic}
              className="w-full mt-4 bg-emerald-500 text-white p-2 rounded-md disabled:opacity-50"
            >
              {loading.magic ? <LoadingSpinner /> : "Send Magic Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
