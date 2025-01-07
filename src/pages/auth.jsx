import { useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const router = useRouter();

  const handleSignInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) console.error("Error signing in with Google:", error.message);
  };

  const handleSignInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
    });
    if (error) console.error("Error signing in with Apple:", error.message);
  };

  const handleMagicLinkSignIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) console.error("Error sending magic link:", error.message);
  };

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      phone,
      options: {
        data: {
          name,
        },
      },
    });
    if (error) console.error("Error signing up:", error.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      console.error("Error signing in:", error.message);
      return;
    }
    if (data.user) {
      router.push("/dashboard");
    } else {
      setIsNewUser(true);
    }
  };

  return (
    <div className="auth-container">
      <h1>Sign In</h1>
      <button onClick={handleSignInWithGoogle}>Sign In with Google</button>
      <button onClick={handleSignInWithApple}>Sign In with Apple</button>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Magic Link</button>
      </form>
      {isNewUser && (
        <form onSubmit={handleSignUp}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <button type="submit">Sign Up</button>
        </form>
      )}
    </div>
  );
};

export default AuthPage;
