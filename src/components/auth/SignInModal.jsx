"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Add this import
import { useAuth } from "@/context/AuthContext";

const SignInModal = ({ isOpen, onClose }) => {
  const { signIn, checkUser, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const router = useRouter();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setPassword("");

    try {
      const { exists, error } = await checkUser(email);
      if (error) throw error;

      if (exists) {
        setShowPasswordForm(true);
        setMessage("Welcome back! Please enter your password to continue.");
      } else {
        setMessage("Account not found. Redirecting to sign up...");
        setTimeout(() => {
          router.push("/signup");
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Email check error:", error); // Debug log
      setMessage(error.message || "Error checking email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      onClose();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      setMessage("Password reset link sent to your email!");
    } catch (error) {
      setMessage(error.message || "Error sending reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowPasswordForm(false);
    setEmail("");
    setPassword("");
    setMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#181818] p-8 rounded-lg w-full max-w-md border border-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {showPasswordForm ? "Sign In" : "Log In"}
          </h2>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="text-white hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {!showPasswordForm ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Loading..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Loading..." : "Sign In"}
            </button>

            <div className="flex justify-between items-center mt-2">
              <button
                type="button"
                onClick={resetForm}
                className="text-emerald-500 hover:underline text-sm"
              >
                Back to Email
              </button>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-emerald-500 hover:underline text-sm"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        )}

        {message && (
          <p className="text-center text-sm text-emerald-500 mt-4">{message}</p>
        )}

        <div className="mt-6 pt-6 border-t border-white/10">
          <button
            onClick={() => {
              router.push("/signup");
              onClose();
            }}
            className="w-full bg-white hover:bg-emerald-100 text-emerald-700 py-2 px-4 rounded-md transition-all duration-300 ease-in-out"
          >
            New here? Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
