"use client"

import type { User as FirebaseUser } from "firebase/auth"
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react"
import { auth } from "@/lib/firebase"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { UserProfile } from "@/lib/types"
import { getMyProfile } from "@/lib/services/userService"
import type { IdToken } from "@/lib/types"

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>
  signOut: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ALLOWED_EMAIL_DOMAIN = "vit.edu.in"

const validateEmailDomain = (email: string): boolean => {
  return email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // The server verifies the ID token, creates the profile on first sign-in and
  // resolves the role. forceRefresh picks up a display name set after sign-up.
  const loadUserProfile = async (
    firebaseUser: FirebaseUser,
    forceRefresh = false
  ) => {
    try {
      const token = (await firebaseUser.getIdToken(forceRefresh)) as IdToken
      setUser(await getMyProfile(token))
    } catch (error) {
      console.error("Error loading user profile:", error)
      // Fallback to basic user data
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: "user",
        permissions: ["read_forums", "create_questions", "vote"],
      })
    }
  }

  const refreshUserProfile = async () => {
    if (auth.currentUser) {
      await loadUserProfile(auth.currentUser, true)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          if (firebaseUser.email && validateEmailDomain(firebaseUser.email)) {
            await loadUserProfile(firebaseUser)
          } else {
            // If email domain is not allowed, sign them out.
            firebaseSignOut(auth)
            setUser(null)
            if (firebaseUser.email) {
              toast.error("Access denied", {
                description: `Sign-in is restricted to @${ALLOWED_EMAIL_DOMAIN} email addresses.`,
              })
            }
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!validateEmailDomain(email)) {
      toast.error("Use your VIT email", {
        description: `Please use a @${ALLOWED_EMAIL_DOMAIN} email address.`,
      })
      return
    }

    setLoading(true)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = result.user

      await loadUserProfile(firebaseUser)

      toast.success("Signed in")
    } catch (error) {
      console.error("Error signing in: ", error)
      let errorMessage = "Failed to sign in."

      switch ((error as { code?: string }).code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address."
          break
        case "auth/wrong-password":
          errorMessage = "Incorrect password."
          break
        case "auth/invalid-email":
          errorMessage = "Invalid email address."
          break
        case "auth/user-disabled":
          errorMessage = "This account has been disabled."
          break
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later."
          break
      }

      toast.error("Could not sign in", { description: errorMessage })
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    if (!validateEmailDomain(email)) {
      toast.error("Use your VIT email", {
        description: `Please use a @${ALLOWED_EMAIL_DOMAIN} email address.`,
      })
      return
    }

    setLoading(true)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = result.user

      // Update the user's display name
      await updateProfile(firebaseUser, {
        displayName: displayName,
      })

      // Send email verification
      await sendEmailVerification(firebaseUser)

      // A fresh token carries the display name just set; the server creates
      // the profile from it.
      await loadUserProfile(firebaseUser, true)

      toast.success("Account created", {
        description: "Check your college email for a verification link.",
      })
    } catch (error) {
      console.error("Error signing up: ", error)
      let errorMessage = "Failed to create account."

      switch ((error as { code?: string }).code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists."
          break
        case "auth/invalid-email":
          errorMessage = "Invalid email address."
          break
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters."
          break
      }

      toast.error("Could not create the account", { description: errorMessage })
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await firebaseSignOut(auth)
      setUser(null)
      toast.success("Signed out")
      // Redirect to auth page after logout
      router.push("/auth")
    } catch (error) {
      console.error("Error signing out: ", error)
      toast.error("Could not sign out", {
        description: (error as Error).message || "Failed to sign out.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, refreshUserProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
