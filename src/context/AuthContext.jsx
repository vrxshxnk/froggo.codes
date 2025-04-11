"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  updateProfile,
  sendEmailVerification,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "@/libs/firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        setUser({
          id: user.uid,
          email: user.email,
          user_metadata: {
            full_name: user.displayName,
            dob: user.photoURL,
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

  const signIn = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      if (!user.emailVerified) {
        await firebaseSignOut(auth);
        throw new Error(
          "Please verify your email before signing in. Check your inbox for the verification link."
        );
      }

      return user;
    } catch (error) {
      switch (error.code) {
        case "auth/user-not-found":
          throw new Error(
            "No account found with this email. Please sign up first."
          );
        case "auth/invalid-credential":
          throw new Error("Invalid email or password. Please try again.");
        case "auth/too-many-requests":
          throw new Error("Too many attempts. Please try again later.");
        default:
          throw error;
      }
    }
  };

  const signUp = async (email, password, fullName, dob) => {
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(user, {
        displayName: fullName,
        photoURL: dob,
      });

      // Send verification email before Firestore write
      try {
        await sendEmailVerification(user);
        console.log("Verification email sent successfully");
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        throw new Error(
          "Failed to send verification email. Please contact support."
        );
      }

      // Firestore write with error handling
      try {
        await setDoc(doc(db, "users", user.uid), {
          email,
          full_name: fullName,
          dob,
          created_at: new Date().toISOString(),
          emailVerified: false,
          name_changes: 0,
          dob_changes: 0,
        });
      } catch (dbError) {
        console.error("Firestore write error:", dbError);
        // Continue with sign up even if Firestore write fails
      }

      await firebaseSignOut(auth);

      return {
        success: true,
        message:
          "Please check your email to verify your account before signing in.",
      };
    } catch (error) {
      console.error("Signup error:", error);
      if (error.code === "auth/email-already-in-use") {
        throw new Error(
          "This email is already registered. Please sign in instead."
        );
      }
      throw new Error("An error occurred during sign up. Please try again.");
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const resendVerificationEmail = async (email, password) => {
    try {
      // Sign in the user temporarily to resend verification
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      if (user.emailVerified) {
        throw new Error("Email is already verified.");
      }

      await sendEmailVerification(user);
      await firebaseSignOut(auth);

      return {
        success: true,
        message: "Verification email has been resent. Please check your inbox.",
      };
    } catch (error) {
      console.error("Resend verification error:", error);
      throw new Error("Failed to resend verification email. Please try again.");
    }
  };

  const resetPassword = async (oldPassword, newPassword) => {
    try {
      if (!auth.currentUser) {
        throw new Error("You must be logged in to reset your password");
      }

      // Create credentials with the user's email and old password
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        oldPassword
      );

      // Re-authenticate user with old password
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, newPassword);

      return {
        success: true,
        message: "Password has been updated successfully.",
      };
    } catch (error) {
      console.error("Reset password error:", error);
      if (error.code === "auth/wrong-password") {
        throw new Error("Incorrect current password. Please try again.");
      }
      throw new Error("Failed to update password. Please try again.");
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
          dob: auth.currentUser.photoURL || "",
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
          dob: auth.currentUser.photoURL || "",
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

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        photoURL: newDob,
      });

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
          dob: auth.currentUser.photoURL || "",
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

  const sendPasswordResetEmail = async (email) => {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: "Password reset link has been sent to your email.",
      };
    } catch (error) {
      console.error("Password reset error:", error);
      if (error.code === "auth/user-not-found") {
        throw new Error("No account found with this email.");
      }
      throw new Error("Failed to send password reset email. Please try again.");
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
        resendVerificationEmail,
        resetPassword,
        updateUserFullName,
        updateUserDob,
        getRemainingChanges,
        sendPasswordResetEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
