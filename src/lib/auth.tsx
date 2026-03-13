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
  // Role checks
  isAdmin: boolean
  canManageBookings: boolean
  canViewFinancials: boolean
  canManageStaff: boolean
  canManageProperties: boolean
}

type Auth = AuthState & AuthActions

const AuthContext = createContext<Auth | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, profile: null, session: null, loading: true,
  })

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
    return data as UserProfile | null
  }

  useEffect(() => {
    // onAuthStateChange is the single source of truth for auth state.
    //
    // INITIAL_SESSION fires synchronously from localStorage – no network call
    // needed – so loading:false is set within milliseconds regardless of
    // network speed or token expiry.  Subsequent events (TOKEN_REFRESHED,
    // SIGNED_OUT) keep the session up-to-date automatically.
    //
    // loadProfile() runs in the background and never blocks the spinner from
    // clearing, which eliminates the "stuck at Authenticating..." bug.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          setState({ user: null, profile: null, session: null, loading: false })
          return
        }

        if (!session?.user) {
          // INITIAL_SESSION with no stored session → not logged in
          setState(s => ({ ...s, loading: false }))
          return
        }

        // We have a session: clear the spinner immediately, then fetch profile
        setState(s => ({ ...s, user: session.user, session, loading: false }))

        loadProfile(session.user.id)
          .then(profile => setState(s =>
            s.user?.id === session.user.id ? { ...s, profile } : s
          ))
          .catch(() => {}) // profile failure must not affect auth state
      }
    )

    return () => subscription.unsubscribe()
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
