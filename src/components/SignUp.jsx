"use client";

import { useState } from "react";
import { supabase } from "@/libs/supabase";
import { useRouter } from "next/navigation";
import { validatePassword, validateEmail } from "@/utils/validation";

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    // Validate email
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate password
    const { isValid, errors } = validatePassword(password);
    if (!isValid) {
      setError(errors.join("\n"));
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      alert("Check your email for the confirmation link!");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border rounded"
      />
      {error && (
        <div className="text-red-500 text-sm whitespace-pre-line">{error}</div>
      )}
      <button
        onClick={handleSignUp}
        disabled={loading}
        className="bg-emerald-500 text-white p-2 rounded disabled:opacity-50"
      >
        {loading ? "Creating Account..." : "Sign Up"}
      </button>
    </div>
  );
}
