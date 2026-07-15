import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { auth, db } from "@/libs/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { locationService } from "@/libs/locationService";

const SignInModal = ({ isOpen, onClose, redirectOnSuccess = true }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // In consent-required jurisdictions (EU/UK/EEA/CH) the newsletter is an
  // explicit unchecked opt-in; everywhere else it's implied via the notice
  const [needsConsent, setNeedsConsent] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);

  const { signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    locationService
      .requiresMarketingConsent()
      .then(setNeedsConsent)
      .catch(() => setNeedsConsent(true));
  }, [isOpen]);

  // Record the newsletter preference on the user doc, but only the first
  // time — a later plain sign-in must not overwrite an existing choice
  const recordNewsletterPreference = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const userRef = doc(db, "users", uid);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists() && snapshot.data().newsletter !== undefined) return;

      await setDoc(
        userRef,
        {
          newsletter: needsConsent ? newsletterOptIn : true,
          newsletter_updated_at: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Could not save newsletter preference:", err.message);
    }
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setError("");
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);


  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      await signInWithGoogle();
      await recordNewsletterPreference();
      onClose();

      // Check if user was trying to enroll in a course before signing in
      const pendingEnrollment = sessionStorage.getItem("pendingCourseEnrollment");
      
      if (pendingEnrollment) {
        const enrollmentData = JSON.parse(pendingEnrollment);
        
        // Clear the pending enrollment
        sessionStorage.removeItem("pendingCourseEnrollment");
        
        // Check if enrollment is still valid (not too old - 30 minutes)
        const isValidEnrollment = Date.now() - enrollmentData.timestamp < 30 * 60 * 1000;
        
        if (isValidEnrollment) {
          // Add a small delay to ensure auth state is fully updated
          setTimeout(() => {
            router.push(`/process-enrollment?courseId=${enrollmentData.courseId}`);
          }, 100);
          return;
        }
      }
      
      // Default redirect to my-courses if no pending enrollment
      if (redirectOnSuccess) {
        router.push("/my-courses");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleClose = () => {
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-[#181818] rounded-lg p-8 max-w-md w-full border border-white/20 shadow-lg shadow-black/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Sign In</h2>
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

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-300 mb-6">
              Welcome to FroggoCodes! Sign in with your Google account to get started.
            </p>
          </div>

          {error && (
            <div className="text-center">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          {needsConsent ? (
            <>
              <label className="flex items-start gap-2.5 text-left text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newsletterOptIn}
                  onChange={(e) => setNewsletterOptIn(e.target.checked)}
                  className="mt-1 accent-emerald-500"
                />
                <span>
                  Send me the Froggo newsletter — practical insights on coding,
                  AI, and shipping products, to stay on top of your field.
                  (optional)
                </span>
              </label>
              <div className="text-center text-sm text-gray-400">
                By continuing, you agree to our Terms of Service and Privacy
                Policy.
              </div>
            </>
          ) : (
            <div className="text-center text-sm text-gray-400">
              By continuing, you agree to our Terms of Service and Privacy
              Policy. You&apos;ll also get the Froggo newsletter — practical
              insights to stay on top of your field. Unsubscribe anytime.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
