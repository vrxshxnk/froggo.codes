import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ResendVerification from "./ResendVerification";

const SignInModal = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      setLoading(true);
      // Store the email for verification message
      setSignupEmail(email);
      setSignupPassword(password);
      // Show verification message immediately
      setSignupSuccess(true);
      setLoading(false);

      // Process signup in the background
      signUp(email, password, fullName, dob).catch((error) => {
        console.error("Signup error:", error);
      });
    } else {
      setLoading(true);
      setError("");
      try {
        await signIn(email, password);
        setError("Successfully signed in! Redirecting...");
        setTimeout(() => {
          resetForm();
          onClose();
          window.location.href = "/";
        }, 1000);
      } catch (error) {
        if (error.message.includes("verify your email")) {
          setShowResend(true);
        }
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleMode = (e) => {
    e.preventDefault();
    setIsSignUp(!isSignUp);
    setSignupSuccess(false);
    setError("");
    setShowResend(false);
    // Don't reset the form completely, just clear the additional fields
    if (!isSignUp) {
      setFullName("");
      setDob("");
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setDob("");
    setError("");
    setShowResend(false);
    setIsSignUp(false);
    setLoading(false);
    setSignupSuccess(false);
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    // Reset form when modal is closed
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (signupSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-[#181818] rounded-lg p-8 max-w-md w-full border border-white/10 shadow-lg shadow-black/50">
          <div className="text-center space-y-4">
            <div className="text-emerald-500 text-6xl mb-4">✉️</div>
            <h3 className="text-white text-xl font-semibold">
              Verify Your Email
            </h3>
            <p className="text-gray-300">
              Please check your email to verify your account before signing in.
            </p>
            <button
              onClick={() => {
                resetForm();
                handleClose();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors mt-4"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#181818] rounded-lg p-8 max-w-md w-full border border-white/20 shadow-lg shadow-black/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isSignUp ? "Create Account" : "Sign In"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
            type="button"
          >
            <svg
              className="w-6 h-6"
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-white/10 rounded-md text-white"
              required
            />
          </div>

          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-white/10 rounded-md text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-white/10 rounded-md text-white"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-white/10 rounded-md text-white"
              required
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-white/10 rounded-md text-white"
                required
              />
            </div>
          )}

          {error && (
            <p
              className={`text-sm ${
                error.includes("Successfully")
                  ? "text-emerald-500"
                  : "text-red-500"
              }`}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </button>

          <button
            type="button"
            onClick={handleToggleMode}
            className="w-full text-emerald-500 hover:text-emerald-400 text-sm"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignInModal;
