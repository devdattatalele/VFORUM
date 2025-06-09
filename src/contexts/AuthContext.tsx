"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_EMAIL_DOMAIN = "vit.edu.in";

const validateEmailDomain = (email: string): boolean => {
  return email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        if (firebaseUser.email && validateEmailDomain(firebaseUser.email)) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        } else {
          // If email domain is not allowed, sign them out.
          firebaseSignOut(auth);
          setUser(null);
          if (firebaseUser.email) {
             toast({
              title: "Access Denied",
              description: `Sign-in is restricted to @${ALLOWED_EMAIL_DOMAIN} email addresses.`,
              variant: "destructive",
            });
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    if (!validateEmailDomain(email)) {
      toast({
        title: "Invalid Email Domain",
        description: `Please use a @${ALLOWED_EMAIL_DOMAIN} email address.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      
        setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
      
        toast({
          title: "Signed In",
        description: "Successfully signed in.",
      });
    } catch (error: any) {
      console.error("Error signing in: ", error);
      let errorMessage = "Failed to sign in.";
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email address.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email address.";
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
      }
      
      toast({
        title: "Sign-In Error",
        description: errorMessage,
        variant: "destructive",
      });
        setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!validateEmailDomain(email)) {
        toast({
        title: "Invalid Email Domain",
        description: `Please use a @${ALLOWED_EMAIL_DOMAIN} email address.`,
          variant: "destructive",
        });
      return;
    }

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      
      // Update the user's display name
      await updateProfile(firebaseUser, {
        displayName: displayName,
      });

      // Send email verification
      await sendEmailVerification(firebaseUser);
      
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: displayName,
        photoURL: firebaseUser.photoURL,
      });
      
      toast({
        title: "Account Created",
        description: "Account created successfully! Please check your email for verification.",
      });
    } catch (error: any) {
      console.error("Error signing up: ", error);
      let errorMessage = "Failed to create account.";
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "An account with this email already exists.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email address.";
          break;
        case 'auth/weak-password':
          errorMessage = "Password should be at least 6 characters.";
          break;
      }
      
      toast({
        title: "Sign-Up Error",
        description: errorMessage,
        variant: "destructive",
      });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      toast({
        title: "Signed Out",
        description: "Successfully signed out.",
      });
    } catch (error: any) {
      console.error("Error signing out: ", error);
       toast({
        title: "Sign-Out Error",
        description: error.message || "Failed to sign out.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}