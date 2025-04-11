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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [showVerificationResend, setShowVerificationResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(180); // 180 seconds countdown
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    notNameEmail: false,
  });

  const { signIn, signUp, sendPasswordResetEmail, resendVerificationEmail } =
    useAuth();
  const router = useRouter();

  // Timer to countdown for resend option
  useEffect(() => {
    let timer;
    if (signupSuccess && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000); // Decrease by 1 every second
    }

    if (resendCountdown === 0) {
      setShowVerificationResend(true);
    }

    return () => {
      clearInterval(timer);
    };
  }, [signupSuccess, resendCountdown]);

  // Format seconds to MM:SS display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle resend verification
  const handleResendVerification = async () => {
    try {
      setResendLoading(true);
      setResendError("");
      await resendVerificationEmail(signupEmail, signupPassword);
      setResendSuccess(true);
    } catch (error) {
      setResendError(error.message);
    } finally {
      setResendLoading(false);
    }
  };

  // Validate password whenever it changes
  useEffect(() => {
    if (isSignUp) {
      const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        notNameEmail: true,
      };

      // Check that password doesn't contain name or email
      if (fullName && password) {
        const nameLower = fullName.toLowerCase();
        const passwordLower = password.toLowerCase();
        if (passwordLower.includes(nameLower.split(" ")[0])) {
          checks.notNameEmail = false;
        }
      }

      if (email && password) {
        const emailUser = email.split("@")[0].toLowerCase();
        const passwordLower = password.toLowerCase();
        if (passwordLower.includes(emailUser)) {
          checks.notNameEmail = false;
        }
      }

      setPasswordChecks(checks);

      // Check if all requirements are met
      const isValid = Object.values(checks).every((check) => check === true);
      setPasswordValid(isValid);

      if (password.length === 0) {
        setPasswordMessage("");
      } else if (isValid) {
        setPasswordMessage("Password strength: Good");
      } else {
        setPasswordMessage("Password doesn&apos;t meet all requirements");
      }

      // Check if passwords match
      if (confirmPassword.length > 0) {
        setPasswordsMatch(password === confirmPassword);
      }
    }
  }, [password, confirmPassword, isSignUp, fullName, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp) {
      // Client-side validation
      if (!passwordValid) {
        setError("Password doesn&apos;t meet all requirements");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      setLoading(true);
      setError("");

      try {
        // Process signup and wait for result
        await signUp(email, password, fullName, dob);
        // Only show success if signup succeeded
        setSignupEmail(email);
        setSignupPassword(password);
        setSignupSuccess(true);
        setShowVerificationResend(false); // Reset the resend flag
        setResendCountdown(180); // Reset countdown
        setResendSuccess(false);
        setResendError("");
      } catch (error) {
        console.error("Signup error:", error);
        if (error.message.includes("already registered")) {
          setError("This email is already registered. Please sign in instead.");
        } else {
          setError(
            error.message ||
              "An error occurred during sign up. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      setError("");
      try {
        await signIn(email, password);
        setError("Successfully signed in! Redirecting...");
        setTimeout(() => {
          resetForm();
          onClose();
          // Redirect to my-courses instead of home page
          window.location.href = "/my-courses";
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordError("");

    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordError("Please enter your email address");
      return;
    }

    try {
      setForgotPasswordLoading(true);
      await sendPasswordResetEmail(forgotPasswordEmail);
      setForgotPasswordSuccess(true);
    } catch (error) {
      setForgotPasswordError(error.message);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleToggleMode = (e) => {
    e.preventDefault();
    setIsSignUp(!isSignUp);
    setSignupSuccess(false);
    setError("");
    setShowResend(false);
    setPasswordMessage("");
    setPasswordValid(false);
    setPasswordsMatch(false);
    setShowVerificationResend(false);
    setResendCountdown(180);
    setResendSuccess(false);
    setResendError("");
    setPasswordChecks({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      notNameEmail: false,
    });
    // Don't reset the form completely, just clear the additional fields
    if (!isSignUp) {
      setFullName("");
      setDob("");
      setConfirmPassword("");
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
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setForgotPasswordSuccess(false);
    setForgotPasswordError("");
    setForgotPasswordLoading(false);
    setPasswordValid(false);
    setPasswordMessage("");
    setPasswordsMatch(false);
    setShowVerificationResend(false);
    setResendCountdown(180);
    setResendSuccess(false);
    setResendError("");
    setPasswordChecks({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      notNameEmail: false,
    });
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
            <p className="text-gray-300 mb-6">
              Please check your email to verify your account before signing in.
            </p>

            <div className="border-t border-gray-700 pt-4">
              <div className="mb-3">
                {resendSuccess ? (
                  <p className="text-emerald-500 text-sm">
                    Verification email has been resent. Please check your inbox.
                  </p>
                ) : (
                  <>
                    <p className="text-gray-400 text-sm mb-2">
                      {resendCountdown > 0
                        ? `You can resend the verification email in ${formatTime(
                            resendCountdown
                          )}`
                        : "You can now resend the verification email"}
                    </p>

                    <button
                      onClick={handleResendVerification}
                      disabled={resendCountdown > 0 || resendLoading}
                      className={`${
                        resendCountdown > 0
                          ? "bg-gray-700 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      } text-white py-2 px-4 rounded-md transition-colors w-full`}
                    >
                      {resendLoading
                        ? "Sending..."
                        : "Resend Verification Email"}
                    </button>

                    {resendError && (
                      <p className="text-red-500 text-sm mt-2">{resendError}</p>
                    )}
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                resetForm();
                handleClose();
              }}
              className="w-full bg-neutral-700 hover:bg-neutral-600 text-white py-2 px-4 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-[#181818] rounded-lg p-8 max-w-md w-full border border-white/20 shadow-lg shadow-black/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Reset Password</h2>
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

          {forgotPasswordSuccess ? (
            <div className="text-center py-6">
              <div className="text-emerald-500 text-5xl mb-4">✉️</div>
              <h3 className="text-white text-xl font-semibold mb-2">
                Check Your Email
              </h3>
              <p className="text-gray-300 mb-6">
                If an account exists with this email, we&apos;ll sent
                instructions to reset your password.
              </p>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordSuccess(false);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-6 rounded-md transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-gray-300 text-sm mb-4">
                Enter your email address and we&apos;ll send you instructions to
                reset your password.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-white/10 rounded-md text-white"
                  required
                />
              </div>

              {forgotPasswordError && (
                <p className="text-red-500 text-sm">{forgotPasswordError}</p>
              )}

              <div className="flex flex-col space-y-2">
                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  {forgotPasswordLoading ? "Sending..." : "Send Reset Link"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full bg-neutral-700 hover:bg-neutral-600 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
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
              className={`w-full px-3 py-2 bg-neutral-800 border ${
                isSignUp && password
                  ? passwordValid
                    ? "border-green-500/50"
                    : "border-red-500/50"
                  : "border-white/10"
              } rounded-md text-white`}
              required
            />

            {isSignUp && password && (
              <div className="mt-2 space-y-1">
                <p
                  className={`text-xs ${
                    passwordChecks.length ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {passwordChecks.length ? "✓" : "✗"} At least 8 characters
                </p>
                <p
                  className={`text-xs ${
                    passwordChecks.uppercase ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {passwordChecks.uppercase ? "✓" : "✗"} At least 1 uppercase
                  letter
                </p>
                <p
                  className={`text-xs ${
                    passwordChecks.lowercase ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {passwordChecks.lowercase ? "✓" : "✗"} At least 1 lowercase
                  letter
                </p>
                <p
                  className={`text-xs ${
                    passwordChecks.number ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {passwordChecks.number ? "✓" : "✗"} At least 1 number
                </p>
                <p
                  className={`text-xs ${
                    passwordChecks.notNameEmail
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {passwordChecks.notNameEmail ? "✓" : "✗"} Password
                  shouldn&apos;t contain your name or email
                </p>
              </div>
            )}

            {isSignUp && passwordMessage && !password && (
              <p
                className={`text-xs mt-1 ${
                  passwordValid ? "text-green-500" : "text-red-500"
                }`}
              >
                {passwordMessage}
              </p>
            )}
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
                className={`w-full px-3 py-2 bg-neutral-800 border ${
                  confirmPassword
                    ? passwordsMatch
                      ? "border-green-500/50"
                      : "border-red-500/50"
                    : "border-white/10"
                } rounded-md text-white`}
                required
              />
              {confirmPassword && (
                <p
                  className={`text-xs mt-1 ${
                    passwordsMatch ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {passwordsMatch
                    ? "Passwords match"
                    : "Passwords do not match"}
                </p>
              )}
            </div>
          )}

          {!isSignUp && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(true);
                  setForgotPasswordEmail(email);
                }}
                className="text-sm text-emerald-500 hover:text-emerald-400"
              >
                Forgot Password?
              </button>
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

          {showResend && (
            <ResendVerification
              email={email}
              password={password}
              onSuccess={() => setShowResend(false)}
            />
          )}

          <button
            type="submit"
            disabled={
              loading || (isSignUp && (!passwordValid || !passwordsMatch))
            }
            className={`w-full ${
              isSignUp && (!passwordValid || !passwordsMatch)
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            } text-white py-2 px-4 rounded-md transition-colors`}
          >
            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </button>

          <div className="text-center py-3">
            <div className="inline-flex items-center justify-center w-full">
              <hr className="w-full h-px bg-gray-700 border-0" />
              <span className="absolute px-3 text-xs text-gray-400 bg-[#181818]">
                OR
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleMode}
            className="w-full border border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 py-2 px-4 rounded-md transition-colors"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don&apos;t have an account? Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignInModal;
