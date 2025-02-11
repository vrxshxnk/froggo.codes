"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const Profile = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const handleResetPassword = async () => {
    router.push('/reset-password');
  };

  return (
    <main className="min-h-screen bg-[#181818] py-24 px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="btn btn-ghost text-white mb-6 inline-flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Link>
        <h1 className="text-4xl font-bold text-white mb-8">Profile</h1>
        
        <div className="bg-neutral-800 rounded-lg p-8 shadow-lg border border-white/10">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-white">Email</h2>
              <p className="text-emerald-500">{user.email}</p>
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Full Name</h2>
              <p className="text-emerald-500">
                {user.user_metadata.full_name || "Not provided"}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Date of Birth</h2>
              <p className="text-emerald-500">
                {user.user_metadata.dob || "Not provided"}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">
                Account Created
              </h2>
              <p className="text-emerald-500">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-medium text-white">Password</h2>
              <p className="text-emerald-500">••••••••</p>
              <button
                onClick={handleResetPassword}
                className="text-emerald-500 hover:text-emerald-400 text-sm mt-2"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;
