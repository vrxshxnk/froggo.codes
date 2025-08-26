"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "@/libs/firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get additional user data from Firestore
        let dobFromFirestore = "";
        try {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            dobFromFirestore = userDoc.data().dob || "";
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
        }

        setUser({
          id: user.uid,
          email: user.email,
          user_metadata: {
            full_name: user.displayName,
            dob: dobFromFirestore,
          },
          created_at: user.metadata.creationTime,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create or update user document in Firestore
      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(userRef, {
            email: user.email,
            full_name: user.displayName,
            dob: "", // Initialize with empty DOB since Google doesn't provide this
            created_at: new Date().toISOString(),
            name_changes: 0,
            dob_changes: 0,
          });
        }
      } catch (dbError) {
        console.error("Firestore write error:", dbError);
        // Continue with sign in even if Firestore write fails
      }

      return user;
    } catch (error) {
      console.error("Google OAuth error details:", error);
      switch (error.code) {
        case "auth/cancelled-popup-request":
        case "auth/popup-closed-by-user":
          throw new Error("Sign in was cancelled. Please try again.");
        case "auth/popup-blocked":
          throw new Error("Popup blocked. Please allow popups and try again.");
        case "auth/operation-not-allowed":
          throw new Error("Google sign-in is not enabled. Please contact support.");
        case "auth/unauthorized-domain":
          throw new Error("This domain is not authorized. Please contact support.");
        default:
          throw new Error(`Google sign-in failed: ${error.message || error.code || 'Unknown error'}`);
      }
    }
  };

  // Google OAuth handles both sign in and sign up
  const signIn = signInWithGoogle;
  const signUp = signInWithGoogle;

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      throw error;
    }
  };


  const updateUserFullName = async (newFullName) => {
    try {
      if (!auth.currentUser) {
        throw new Error("You must be logged in to update your profile");
      }

      // Get the current user doc from Firestore
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      let userData;

      // If user document doesn't exist, create it
      if (!userDoc.exists()) {
        userData = {
          email: auth.currentUser.email,
          full_name: auth.currentUser.displayName || "",
          dob: "", // Initialize with empty DOB
          created_at: new Date().toISOString(),
          name_changes: 0,
          dob_changes: 0,
        };
        try {
          await setDoc(userRef, userData);
        } catch (error) {
          console.error("Error creating user document:", error);
          // Continue with the update even if document creation fails
        }
      } else {
        userData = userDoc.data();
      }

      const nameChanges = userData.name_changes || 0;

      if (nameChanges >= 2) {
        throw new Error(
          "You have reached the maximum number of name changes allowed (2)"
        );
      }

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: newFullName,
      });

      // Update Firestore document
      await updateDoc(userRef, {
        full_name: newFullName,
        name_changes: nameChanges + 1,
      });

      // Update local user state
      setUser((prev) => ({
        ...prev,
        user_metadata: {
          ...prev.user_metadata,
          full_name: newFullName,
        },
      }));

      return {
        success: true,
        message: "Full name has been updated successfully.",
      };
    } catch (error) {
      console.error("Update full name error:", error);
      throw error;
    }
  };

  const updateUserDob = async (newDob) => {
    try {
      if (!auth.currentUser) {
        throw new Error("You must be logged in to update your profile");
      }

      // Get the current user doc from Firestore
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      let userData;

      // If user document doesn't exist, create it
      if (!userDoc.exists()) {
        userData = {
          email: auth.currentUser.email,
          full_name: auth.currentUser.displayName || "",
          dob: "", // Initialize with empty DOB
          created_at: new Date().toISOString(),
          name_changes: 0,
          dob_changes: 0,
        };
        try {
          await setDoc(userRef, userData);
        } catch (error) {
          console.error("Error creating user document:", error);
          // Continue with the update even if document creation fails
        }
      } else {
        userData = userDoc.data();
      }

      const dobChanges = userData.dob_changes || 0;

      if (dobChanges >= 2) {
        throw new Error(
          "You have reached the maximum number of date of birth changes allowed (2)"
        );
      }

      // Google OAuth users don't need to update Firebase Auth profile for DOB
      // DOB is stored only in Firestore

      // Update Firestore document
      await updateDoc(userRef, {
        dob: newDob,
        dob_changes: dobChanges + 1,
      });

      // Update local user state
      setUser((prev) => ({
        ...prev,
        user_metadata: {
          ...prev.user_metadata,
          dob: newDob,
        },
      }));

      return {
        success: true,
        message: "Date of birth has been updated successfully.",
      };
    } catch (error) {
      console.error("Update DOB error:", error);
      throw error;
    }
  };

  const getRemainingChanges = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error("You must be logged in to check profile limits");
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      // If user document doesn't exist in Firestore, create it with default values
      if (!userDoc.exists()) {
        // Initialize with default values
        const defaultUserData = {
          email: auth.currentUser.email,
          full_name: auth.currentUser.displayName || "",
          dob: "", // Initialize with empty DOB
          created_at: new Date().toISOString(),
          name_changes: 0,
          dob_changes: 0,
        };

        try {
          await setDoc(userRef, defaultUserData);
          return {
            nameChangesRemaining: 2,
            dobChangesRemaining: 2,
          };
        } catch (writeError) {
          console.error("Error initializing user data:", writeError);
          // Return default values even if write fails
          return {
            nameChangesRemaining: 2,
            dobChangesRemaining: 2,
          };
        }
      }

      const userData = userDoc.data();

      // Handle case where fields may not exist for existing users
      if (
        userData.name_changes === undefined ||
        userData.dob_changes === undefined
      ) {
        try {
          // Update document to add the missing fields
          await updateDoc(userRef, {
            name_changes: userData.name_changes || 0,
            dob_changes: userData.dob_changes || 0,
          });
        } catch (updateError) {
          console.error("Error updating user change counts:", updateError);
          // Continue even if update fails
        }
      }

      return {
        nameChangesRemaining: 2 - (userData.name_changes || 0),
        dobChangesRemaining: 2 - (userData.dob_changes || 0),
      };
    } catch (error) {
      console.error("Get remaining changes error:", error);
      // Return default values instead of throwing to prevent UI errors
      return {
        nameChangesRemaining: 2,
        dobChangesRemaining: 2,
      };
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        updateUserFullName,
        updateUserDob,
        getRemainingChanges,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
