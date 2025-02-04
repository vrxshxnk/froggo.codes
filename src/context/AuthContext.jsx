"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  updateProfile,
  sendEmailVerification
} from "firebase/auth";
import { auth, db } from "@/libs/firebase";
import { doc, setDoc } from "firebase/firestore";

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
            dob: user.photoURL
          },
          created_at: user.metadata.creationTime
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
        throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
      }
      
      return user;
    } catch (error) {
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('No account found with this email. Please sign up first.');
        case 'auth/invalid-credential':
          throw new Error('Invalid email or password. Please try again.');
        case 'auth/too-many-requests':
          throw new Error('Too many attempts. Please try again later.');
        default:
          throw error;
      }
    }
  };

  const signUp = async (email, password, fullName, dob) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(user, {
        displayName: fullName,
        photoURL: dob
      });

      // Send verification email before Firestore write
      try {
        await sendEmailVerification(user);
        console.log('Verification email sent successfully');
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        throw new Error('Failed to send verification email. Please contact support.');
      }

      // Firestore write with error handling
      try {
        await setDoc(doc(db, "users", user.uid), {
          email,
          full_name: fullName,
          dob,
          created_at: new Date().toISOString(),
          emailVerified: false
        });
      } catch (dbError) {
        console.error('Firestore write error:', dbError);
        // Continue with sign up even if Firestore write fails
      }

      await firebaseSignOut(auth);
      
      return {
        success: true,
        message: 'Please check your email to verify your account before signing in.'
      };
    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please sign in instead.');
      }
      throw new Error('An error occurred during sign up. Please try again.');
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
        throw new Error('Email is already verified.');
      }

      await sendEmailVerification(user);
      await firebaseSignOut(auth);
      
      return {
        success: true,
        message: 'Verification email has been resent. Please check your inbox.'
      };
    } catch (error) {
      console.error('Resend verification error:', error);
      throw new Error('Failed to resend verification email. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      resendVerificationEmail 
    }}>
      {children}
    </AuthContext.Provider>
  );
};