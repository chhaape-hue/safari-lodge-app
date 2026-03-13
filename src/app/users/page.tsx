"use client"

import { useState, useEffect, useCallback } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth, roleLabel, roleBadgeColor, type UserRole } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import {
  UserCog, Plus, Mail, Shield, Trash2,
  CheckCircle2, XCircle, AlertCircle, Eye, EyeOff, Send
} from "lucide-react"

interface AppUser {
  id: string
  email: string
  full_name: string
  role: UserRole
  property_ids: string[]
  created_at: string
  last_sign_in?: string
  is_active?: boolean
}

type ModalMode = "invite" | "create" | "edit" | null

export default function UsersPage() {
  const { profile, isAdmin } = useAuth()
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMsg, setLoadingMsg] = useState("Loading users...")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)

  // Form state
  const [formEmail, setFormEmail] = useState("")
  const [formName, setFormName] = useState("")
  const [formRole, setFormRole] = useState<UserRole>("reception")
  const [formPassword, setFormPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setLoadingMsg("Loading user accounts...")
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name")

      if (error) throw error
      setUsers(data as AppUser[])
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  const clearSuccess = useCallback(() => {
    setTimeout(() => setSuccess(null), 4000)
  }, [])

  const openModal = (mode: ModalMode, user?: AppUser) => {
    setModalMode(mode)
    setEditingUser(user || null)
    setFormEmail(user?.email || "")
    setFormName(user?.full_name || "")
    setFormRole(user?.role || "reception")
    setFormPassword("")
    setFormError(null)
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingUser(null)
    setFormError(null)
  }

  const handleInvite = async () => {
    if (!formEmail || !formName) {
      setFormError("Email and full name are required.")
      return
    }
    setFormLoading(true)
    setFormError(null)
    try {
      // Create profile entry first (invite via Supabase Auth)
      const { error } = await supabase.auth.admin.inviteUserByEmail(formEmail, {
        data: { full_name: formName, role: formRole }
      })
      if (error) throw error
      setSuccess(`Invitation sent to ${formEmail}`)
      closeModal()
      clearSuccess()
      await loadUsers()
    } catch (err: unknown) {
      // Fallback: insert into profiles manually for demo
      const msg = (err as Error).message || "Failed to send invitation"
      if (msg.includes("not authorized") || msg.includes("admin")) {
        // Not admin API – show info
        setFormError("Admin API not available. Please configure Supabase service role key, or create users from the Supabase dashboard.")
      } else {
        setFormError(msg)
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateRole = async () => {
    if (!editingUser) return
    setFormLoading(true)
    setFormError(null)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: formRole, full_name: formName })
        .eq("id", editingUser.id)
      if (error) throw error
      setSuccess(`Updated ${formName}'s role to ${roleLabel(formRole)}`)
      closeModal()
      clearSuccess()
      await loadUsers()
    } catch (err: unknown) {
      setFormError((err as Error).message || "Failed to update user")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeactivate = async (user: AppUser) => {
    if (!confirm(`Deactivate ${user.full_name || user.email}? They will no longer be able to log in.`)) return
    setLoadingMsg("Deactivating user...")
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: false })
        .eq("id", user.id)
      if (error) throw error
      setSuccess(`${user.full_name || user.email} has been deactivated`)
      clearSuccess()
      await loadUsers()
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to deactivate user")
    }
  }

  const handleReactivate = async (user: AppUser) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: true })
        .eq("id", user.id)
      if (error) throw error
      setSuccess(`${user.full_name || user.email} has been reactivated`)
      clearSuccess()
      await loadUsers()
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to reactivate user")
    }
  }

  if (!isAdmin) {
    return (
      <div>
        <Topbar title="User Management" subtitle="Manage system users and permissions" />
        <div className="p-6">
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <Shield className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-800">
              Access restricted. Only administrators can manage user accounts.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Topbar
        title="User Management"
        subtitle={`${users.length} user accounts`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => openModal("invite")}>
              <Send className="h-3.5 w-3.5" />
              Invite by Email
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-5">
        {/* Status messages */}
        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Info card */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-[#4A7C59] mt-0.5 shrink-0" />
              <div className="text-sm text-stone-600 space-y-1">
                <p className="font-medium text-stone-800">Security & Access Control</p>
                <p>All user accounts are secured with Supabase Authentication. Passwords are never stored in the app.</p>
                <p>Role-based access control ensures staff only see what they need:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(["admin", "manager", "reception", "accountant", "readonly"] as UserRole[]).map(r => (
                    <span key={r} className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeColor(r)}`}>
                      {roleLabel(r)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users table */}
        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
            <CardDescription>All accounts with access to the Untouched Safaris PMS</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner message={loadingMsg} size="sm" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-stone-400">
                <UserCog className="h-8 w-8 mb-2" />
                <p className="text-sm font-medium">No users found</p>
                <Button size="sm" className="mt-4" onClick={() => openModal("invite")}>
                  <Plus className="h-3.5 w-3.5" /> Invite first user
                </Button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wider">
                    {["User", "Role", "Status", "Properties", ""].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-[#6B4226]">
                              {(user.full_name || user.email).slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">{user.full_name || "—"}</p>
                            <p className="text-xs text-stone-400">{user.email}</p>
                          </div>
                          {user.id === profile?.id && (
                            <span className="text-xs text-[#4A7C59] font-medium">(you)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeColor(user.role)}`}>
                          {roleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {user.is_active === false ? (
                          <Badge variant="neutral">Inactive</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3 text-stone-500 text-xs">
                        {user.property_ids?.length > 0 ? `${user.property_ids.length} properties` : "All properties"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1 items-center">
                          <Button variant="ghost" size="sm" onClick={() => openModal("edit", user)}>
                            Edit
                          </Button>
                          {user.is_active === false ? (
                            <Button variant="ghost" size="sm" onClick={() => handleReactivate(user)}
                              className="text-green-600 hover:bg-green-50">
                              Reactivate
                            </Button>
                          ) : user.id !== profile?.id ? (
                            <button onClick={() => handleDeactivate(user)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                              title="Deactivate user">
                              <XCircle className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-1">
              {modalMode === "invite" ? "Invite User" : "Edit User"}
            </h2>
            <p className="text-sm text-stone-500 mb-5">
              {modalMode === "invite"
                ? "An invitation email with a login link will be sent to the user."
                : `Update role and details for ${editingUser?.full_name || editingUser?.email}`}
            </p>

            {formError && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700">{formError}</p>
              </div>
            )}

            <div className="space-y-4">
              {modalMode === "invite" && (
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                    <input
                      type="email"
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      placeholder="colleague@untouched-safaris.com"
                      className="w-full pl-9 pr-4 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="First and last name"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Role</label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
                >
                  {(["admin", "manager", "reception", "accountant", "readonly"] as UserRole[]).map(r => (
                    <option key={r} value={r}>{roleLabel(r)}</option>
                  ))}
                </select>
                <p className="text-xs text-stone-400 mt-1">
                  {formRole === "admin" && "Full access to all features including user management."}
                  {formRole === "manager" && "Access to bookings, finance, staff, and properties."}
                  {formRole === "reception" && "Can manage bookings and view guest information."}
                  {formRole === "accountant" && "Can view and manage financial data only."}
                  {formRole === "readonly" && "Read-only access – cannot make any changes."}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={closeModal} disabled={formLoading}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={modalMode === "invite" ? handleInvite : handleUpdateRole}
                disabled={formLoading}
              >
                {formLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    {modalMode === "invite" ? "Sending invitation..." : "Saving changes..."}
                  </span>
                ) : (
                  modalMode === "invite" ? "Send Invitation" : "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
