export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "Invalid login credentials",
  EMAIL_IN_USE: "Email already registered",
  WEAK_PASSWORD: "Password is too weak",
  INVALID_EMAIL: "Invalid email format",
  RATE_LIMIT: "Too many attempts, please try again later",
  NETWORK_ERROR: "Network error, please check your connection",
  DEFAULT: "An unexpected error occurred",
};

export const getErrorMessage = (error) => {
  if (!error) return null;

  // Supabase specific error handling
  if (error.message?.includes("Email not confirmed")) {
    return "Please check your email to confirm your account";
  }

  if (error.message?.includes("Invalid login credentials")) {
    return "Invalid email or password";
  }

  if (error.message?.includes("Email rate limit exceeded")) {
    return "Too many attempts, please try again later";
  }

  // Map known error messages to user-friendly messages
  const errorMap = {
    "User already registered": "This email is already registered",
    "Invalid email": "Please enter a valid email address",
    "Password should be at least 6 characters":
      "Password must be at least 6 characters",
    "Rate limit exceeded": "Too many attempts, please try again later",
  };

  return errorMap[error.message] || AUTH_ERRORS.DEFAULT;
};
