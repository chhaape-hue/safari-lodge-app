"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import {
  Settings, Building, Globe, Bell, Shield, Database,
  CheckCircle2, AlertCircle, ExternalLink, Save
} from "lucide-react"

type Tab = "company" | "integrations" | "notifications" | "security" | "system"

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "company", label: "Company", icon: Building },
  { id: "integrations", label: "Integrations", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "system", label: "System", icon: Database },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("company")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { profile, isAdmin } = useAuth()

  // Company form state
  const [companyName, setCompanyName] = useState("Untouched Safaris (Pty) Ltd")
  const [website, setWebsite] = useState("untouched-safaris.com")
  const [headquarters, setHeadquarters] = useState("Maun, Botswana")
  const [currency, setCurrency] = useState("BWP")
  const [timezone, setTimezone] = useState("Africa/Gaborone")

  // Notification toggles
  const [notifications, setNotifications] = useState({
    newBookingNB: true,
    bookingCancellation: true,
    checkInReminder: true,
    outstandingPayments: true,
    maintenanceOverdue: false,
    weeklyReport: true,
    lowStock: true,
    criticalMaintenance: true,
  })

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div>
      <Topbar title="Settings" subtitle="System and company configuration" />

      <div className="p-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Success banner */}
        {saved && (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            <p className="text-sm text-green-700">Settings saved successfully.</p>
          </div>
        )}

        {/* Company tab */}
        {activeTab === "company" && (
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Core details for Untouched Safaris</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    disabled={!isAdmin}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] disabled:bg-stone-50 disabled:text-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Website</label>
                  <input
                    type="text"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    disabled={!isAdmin}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] disabled:bg-stone-50 disabled:text-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Headquarters</label>
                  <input
                    type="text"
                    value={headquarters}
                    onChange={e => setHeadquarters(e.target.value)}
                    disabled={!isAdmin}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] disabled:bg-stone-50 disabled:text-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Primary Currency</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    disabled={!isAdmin}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white disabled:bg-stone-50"
                  >
                    <option value="BWP">BWP – Botswana Pula</option>
                    <option value="NAD">NAD – Namibian Dollar</option>
                    <option value="ZAR">ZAR – South African Rand</option>
                    <option value="USD">USD – US Dollar</option>
                    <option value="EUR">EUR – Euro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Timezone</label>
                  <select
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    disabled={!isAdmin}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white disabled:bg-stone-50"
                  >
                    <option value="Africa/Gaborone">Africa/Gaborone (CAT, UTC+2)</option>
                    <option value="Africa/Windhoek">Africa/Windhoek (WAT, UTC+1/2)</option>
                    <option value="Africa/Johannesburg">Africa/Johannesburg (SAST, UTC+2)</option>
                  </select>
                </div>
              </div>
              {!isAdmin && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Only administrators can edit company settings.
                </p>
              )}
              {isAdmin && (
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-3.5 w-3.5" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Integrations tab */}
        {activeTab === "integrations" && (
          <div className="space-y-4">
            {[
              {
                name: "Nightsbridge",
                description: "Online booking & channel manager",
                status: "connected",
                icon: Globe,
                href: "/nightsbridge",
                details: "Actively syncing bookings and availability"
              },
              {
                name: "Supabase",
                description: "Database & authentication backend",
                status: "connected",
                icon: Database,
                details: "PostgreSQL with Row-Level Security enabled"
              },
              {
                name: "Microsoft Outlook",
                description: "Email marketing & communication",
                status: "disconnected",
                icon: Globe,
                href: "/email",
                details: "Connect via Microsoft Graph API"
              },
            ].map(integration => (
              <Card key={integration.name}>
                <CardContent className="pt-5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                      <integration.icon className="h-5 w-5 text-stone-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-stone-800">{integration.name}</p>
                        <Badge variant={integration.status === "connected" ? "success" : "neutral"}>
                          {integration.status === "connected" ? "Connected" : "Disconnected"}
                        </Badge>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{integration.description}</p>
                      <p className="text-xs text-stone-400 mt-1">{integration.details}</p>
                    </div>
                    {integration.href && (
                      <Button variant="secondary" size="sm">
                        <ExternalLink className="h-3.5 w-3.5" />
                        {integration.status === "connected" ? "Manage" : "Connect"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Notifications tab */}
        {activeTab === "notifications" && (
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose when the system should alert you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-stone-50">
              {[
                { key: "newBookingNB" as const, label: "New booking via Nightsbridge", description: "Instant alert when a new booking arrives" },
                { key: "bookingCancellation" as const, label: "Booking cancellation", description: "Alert when any booking is cancelled" },
                { key: "checkInReminder" as const, label: "Check-in reminder (1 day before)", description: "Reminder for upcoming arrivals" },
                { key: "outstandingPayments" as const, label: "Outstanding payments (> 7 days)", description: "Alert for unpaid bookings over 7 days old" },
                { key: "lowStock" as const, label: "Low stock alert", description: "Notify when items fall below minimum stock level" },
                { key: "criticalMaintenance" as const, label: "Critical maintenance issue reported", description: "Immediate alert for critical maintenance tasks" },
                { key: "maintenanceOverdue" as const, label: "Overdue maintenance tasks", description: "Daily reminder for overdue maintenance" },
                { key: "weeklyReport" as const, label: "Weekly summary report", description: "Revenue, occupancy and operations summary every Monday" },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{item.label}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{item.description}</p>
                  </div>
                  <button
                    onClick={() => toggleNotification(item.key)}
                    className={`relative h-5 w-9 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-1 ${
                      notifications[item.key] ? "bg-[#C9A84C]" : "bg-stone-300"
                    }`}
                  >
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      notifications[item.key] ? "translate-x-4" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
              ))}
              <div className="pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-3.5 w-3.5" />
                  {saving ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security tab */}
        {activeTab === "security" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Overview</CardTitle>
                <CardDescription>Current security configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Authentication", value: "Supabase Auth (Email + Password)", status: "ok" },
                  { label: "Password Policy", value: "Minimum 8 characters, enforced", status: "ok" },
                  { label: "Session Timeout", value: "24 hours", status: "ok" },
                  { label: "Row-Level Security", value: "Enabled on all tables", status: "ok" },
                  { label: "Two-Factor Auth (2FA)", value: "Available but not enforced", status: "warning" },
                  { label: "Audit Logging", value: "Phase 2 – in development", status: "info" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{item.label}</p>
                      <p className="text-xs text-stone-400">{item.value}</p>
                    </div>
                    {item.status === "ok" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {item.status === "warning" && <AlertCircle className="h-4 w-4 text-amber-500" />}
                    {item.status === "info" && <AlertCircle className="h-4 w-4 text-blue-400" />}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Your Account</CardTitle>
                <CardDescription>Personal security settings for {profile?.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-800">Change Password</p>
                    <p className="text-xs text-stone-400">Send a password reset link to your email</p>
                  </div>
                  <Button variant="secondary" size="sm">Send Reset Email</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* System tab */}
        {activeTab === "system" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Technical details and version information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-0 divide-y divide-stone-50">
                {[
                  { label: "Version", value: "v1.1.0 – Phase 1" },
                  { label: "Framework", value: "Next.js 16 + TypeScript" },
                  { label: "Database", value: "Supabase (PostgreSQL)" },
                  { label: "Auth", value: "Supabase Auth" },
                  { label: "Hosting", value: "Vercel" },
                  { label: "Built by", value: "Claude (Anthropic AI)" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-sm py-2.5">
                    <span className="text-stone-500">{item.label}</span>
                    <span className="font-medium text-stone-800">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>Backup and data operations – admin only</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="secondary" size="sm" className="w-full">
                    <Database className="h-3.5 w-3.5" />
                    Export Data (CSV)
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full text-red-600 hover:bg-red-50">
                    Clear Demo Data
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
