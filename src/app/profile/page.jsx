"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const Profile = () => {
  const {
    user,
    loading,
    updateUserFullName,
    updateUserDob,
    getRemainingChanges,
  } = useAuth();
  const router = useRouter();
  const [editingName, setEditingName] = useState(false);
  const [editingDob, setEditingDob] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDob, setNewDob] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [remainingChanges, setRemainingChanges] = useState({
    nameChangesRemaining: 0,
    dobChangesRemaining: 0,
  });

  const fetchRemainingChanges = useCallback(async () => {
    try {
      const changes = await getRemainingChanges();
      setRemainingChanges(changes);
    } catch (error) {
      console.error("Error fetching remaining changes:", error);
      setRemainingChanges({
        nameChangesRemaining: 2,
        dobChangesRemaining: 2,
      });
    }
  }, [getRemainingChanges]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }

    if (user) {
      setNewName(user.user_metadata?.full_name || "");
      setNewDob(user.user_metadata?.dob || "");
      fetchRemainingChanges();
    }
  }, [user, loading, router, fetchRemainingChanges]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!newName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      await updateUserFullName(newName);
      setSuccessMessage("Name updated successfully");
      setEditingName(false);
      fetchRemainingChanges();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDob = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!newDob) {
      setError("Date of birth cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      await updateUserDob(newDob);
      setSuccessMessage("Date of birth updated successfully");
      setEditingDob(false);
      fetchRemainingChanges();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    router.push("/reset-password");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#181818] py-24 px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="btn btn-ghost text-white mb-6 inline-flex items-center"
        >
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

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
            <p className="text-emerald-500">{successMessage}</p>
          </div>
        )}

        <div className="bg-neutral-800 rounded-lg p-8 shadow-lg border border-white/10">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-white">Email</h2>
              <p className="text-emerald-500">{user.email}</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-medium text-white">Full Name</h2>
                {!editingName && (
                  <button
                    onClick={() => setEditingName(true)}
                    disabled={remainingChanges.nameChangesRemaining < 1}
                    className={`text-sm ${
                      remainingChanges.nameChangesRemaining > 0
                        ? "text-emerald-500 hover:text-emerald-400"
                        : "text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {remainingChanges.nameChangesRemaining > 0
                      ? "Edit"
                      : "No changes left"}
                  </button>
                )}
              </div>
              {editingName ? (
                <form onSubmit={handleUpdateName} className="flex space-x-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-grow px-3 py-1 bg-neutral-700 border border-white/10 rounded-md text-white"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingName(false);
                      setNewName(user.user_metadata?.full_name || "");
                    }}
                    className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white rounded-md"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div>
                  <p className="text-emerald-500">
                    {user.user_metadata?.full_name || "Not provided"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Changes remaining: {remainingChanges.nameChangesRemaining}/2
                  </p>
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-medium text-white">
                  Date of Birth
                </h2>
                {!editingDob && (
                  <button
                    onClick={() => setEditingDob(true)}
                    disabled={remainingChanges.dobChangesRemaining < 1}
                    className={`text-sm ${
                      remainingChanges.dobChangesRemaining > 0
                        ? "text-emerald-500 hover:text-emerald-400"
                        : "text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {remainingChanges.dobChangesRemaining > 0
                      ? "Edit"
                      : "No changes left"}
                  </button>
                )}
              </div>
              {editingDob ? (
                <form onSubmit={handleUpdateDob} className="flex space-x-2">
                  <input
                    type="date"
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    className="flex-grow px-3 py-1 bg-neutral-700 border border-white/10 rounded-md text-white"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDob(false);
                      setNewDob(user.user_metadata?.dob || "");
                    }}
                    className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white rounded-md"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div>
                  <p className="text-emerald-500">
                    {user.user_metadata?.dob || "Not provided"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Changes remaining: {remainingChanges.dobChangesRemaining}/2
                  </p>
                </div>
              )}
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
