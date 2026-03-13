"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase } from "./supabase"
import type { User, Session } from "@supabase/supabase-js"

export type UserRole = "admin" | "manager" | "reception" | "accountant" | "readonly"

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  property_ids: string[]
  avatar_url?: string
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  isAdmin: boolean
  canManageBookings: boolean
  canViewFinancials: boolean
  canManageStaff: boolean
  canManageProperties: boolean
}

type Auth = AuthState & AuthActions

const AuthContext = createContext<Auth | null>(null)

// Read the stored Supabase session directly from localStorage.
// This is synchronous and requires zero network I/O.
// Supabase v2 stores the session at key "sb-<project-ref>-auth-token".
function readStoredSession(): { user: User; session: Session } | null {
  if (typeof window === "undefined") return null
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("sb-") && key?.endsWith("-auth-token")) {
        const raw = localStorage.getItem(key)
        if (!raw) break
        const stored = JSON.parse(raw)
        if (stored?.user?.id && stored?.refresh_token) {
          return { user: stored.user as User, session: stored as Session }
        }
        break
      }
    }
  } catch {
    // localStorage unavailable (e.g. private browsing with blocked storage)
  }
  return null
}

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
  return data as UserProfile | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, profile: null, session: null, loading: true,
  })

  useEffect(() => {
    // ── Step 1: instant init from localStorage ────────────────────────────
    // Clears the spinner before any network activity, even if the access
    // token is expired (Supabase will refresh it in the background).
    const stored = readStoredSession()
    if (stored) {
      console.log("[auth] instant init from localStorage for", stored.user.email)
      setState(s => ({ ...s, user: stored.user, session: stored.session, loading: false }))
      fetchProfile(stored.user.id)
        .then(profile => setState(s => s.user?.id === stored.user.id ? { ...s, profile } : s))
        .catch(() => {})
    } else {
      console.log("[auth] no stored session found in localStorage")
    }

    // ── Step 2: safety timeout ────────────────────────────────────────────
    // If neither localStorage nor Supabase resolves within 5 s, force-clear
    // loading so the user is never stuck.  AuthGate will redirect to /login.
    const safety = setTimeout(() => {
      console.warn("[auth] safety timeout fired – forcing loading:false")
      setState(s => s.loading ? { ...s, loading: false } : s)
    }, 5000)

    // ── Step 3: Supabase auth events ──────────────────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[auth] onAuthStateChange:", event, session?.user?.email ?? "null")
      clearTimeout(safety)

      if (event === "SIGNED_OUT") {
        setState({ user: null, profile: null, session: null, loading: false })
        return
      }

      if (!session?.user) {
        setState(s => ({ ...s, loading: false }))
        return
      }

      setState(s => ({ ...s, user: session.user, session, loading: false }))

      // Load profile on fresh sign-in, or on INITIAL_SESSION if localStorage
      // didn't already kick off a profile load.
      if (event === "SIGNED_IN" || (event === "INITIAL_SESSION" && !stored)) {
        fetchProfile(session.user.id)
          .then(profile => setState(s => s.user?.id === session.user.id ? { ...s, profile } : s))
          .catch(() => {})
      }
    })

    return () => {
      clearTimeout(safety)
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const role = state.profile?.role

  const auth: Auth = {
    ...state,
    signIn, signOut,
    isAdmin: role === "admin",
    canManageBookings: ["admin", "manager", "reception"].includes(role || ""),
    canViewFinancials: ["admin", "manager", "accountant"].includes(role || ""),
    canManageStaff:    ["admin", "manager"].includes(role || ""),
    canManageProperties: ["admin", "manager"].includes(role || ""),
  }

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth(): Auth {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export function roleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: "Administrator",
    manager: "Manager",
    reception: "Reception",
    accountant: "Accountant",
    readonly: "Read Only",
  }
  return labels[role]
}

export function roleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    admin:      "bg-red-100 text-red-700",
    manager:    "bg-purple-100 text-purple-700",
    reception:  "bg-blue-100 text-blue-700",
    accountant: "bg-green-100 text-green-700",
    readonly:   "bg-stone-100 text-stone-600",
  }
  return colors[role]
}
