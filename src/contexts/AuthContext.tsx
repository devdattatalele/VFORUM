"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, googleAuthProvider } from '@/lib/firebase';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from '@/lib/types';


interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_EMAIL_DOMAIN = "vit.edu.in";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        if (firebaseUser.email && firebaseUser.email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
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
          if (firebaseUser.email) { // Only show toast if email exists, to avoid issues with anonymous users if any
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

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const firebaseUser = result.user;
      if (firebaseUser.email && firebaseUser.email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
        setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        toast({
          title: "Signed In",
          description: "Successfully signed in with Google.",
        });
      } else {
        await firebaseSignOut(auth);
        setUser(null);
        toast({
          title: "Sign-In Failed",
          description: `Access is restricted to @${ALLOWED_EMAIL_DOMAIN} email addresses. Your account ${firebaseUser.email} is not allowed.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error signing in with Google: ", error);
      toast({
        title: "Sign-In Error",
        description: error.message || "Failed to sign in with Google.",
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
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
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