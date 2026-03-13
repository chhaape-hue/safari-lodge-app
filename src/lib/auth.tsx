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
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await loadProfile(session.user.id)
        setState({ user: session.user, profile, session, loading: false })
      } else {
        setState(s => ({ ...s, loading: false }))
      }
    })

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await loadProfile(session.user.id)
        setState({ user: session.user, profile, session, loading: false })
      } else {
        setState({ user: null, profile: null, session: null, loading: false })
      }
    })

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
