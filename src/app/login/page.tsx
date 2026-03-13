"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { LogIn, Eye, EyeOff, KeyRound } from "lucide-react"

export default function LoginPage() {
  const { signIn } = useAuth()
  const router = useRouter()

  const [mode, setMode] = useState<"login" | "set-password">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")

  // Detect invite/recovery token in URL hash
  useEffect(() => {
    if (typeof window === "undefined") return
    const hash = window.location.hash
    if (hash.includes("type=invite") || hash.includes("type=recovery")) {
      setMode("set-password")
      setInfo("Invitation accepted — please set your password.")
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError("Incorrect email or password. Please try again.")
    } else {
      router.replace("/")
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password !== password2) {
      setError("Passwords do not match.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setInfo("Password set! Redirecting...")
      setTimeout(() => router.replace("/"), 1500)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #1E1209 0%, #2C1A0E 50%, #1a2e1a 100%)" }}>
      {/* Left side – branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 text-center">
        {/* Logo */}
        <div className="mb-6">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="62" r="24" fill="none" stroke="#C9A84C" strokeWidth="5" strokeLinecap="round" />
            <path d="M28 22 C32 17, 38 19, 40 24 C42 19, 48 17, 52 22" stroke="#C9A84C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M36 34 C39 30, 43 31, 45 35 C47 31, 51 30, 54 34" stroke="#C9A84C" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-3xl font-light tracking-[0.3em] text-white uppercase mb-1">Untouched</p>
        <p className="text-lg tracking-[0.5em] text-[#C9A84C] uppercase font-medium">Safaris</p>
        <p className="text-stone-400 text-sm mt-6 max-w-xs leading-relaxed">
          Property Management System for Lodges, Houseboats and Wilderness Camps
        </p>
        <div className="mt-10 flex flex-col gap-3 text-xs text-stone-500 text-left">
          {["Botswana", "Namibia", "Zimbabwe"].map(country => (
            <span key={country} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />{country}
            </span>
          ))}
        </div>
      </div>

      {/* Right side – form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#FAF7F0]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <p className="text-xl font-bold text-stone-900">Untouched Safaris</p>
            <p className="text-stone-500 text-sm">Property Management System</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-stone-200">
            <div className="flex items-center gap-2 mb-6">
              {mode === "set-password"
                ? <KeyRound className="h-5 w-5 text-[#C9A84C]" />
                : <LogIn className="h-5 w-5 text-[#C9A84C]" />}
              <h2 className="text-lg font-bold text-stone-900">
                {mode === "set-password" ? "Set Your Password" : "Sign In"}
              </h2>
            </div>

            {info && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2.5 mb-4">
                {info}
              </div>
            )}

            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com" required autoComplete="email"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" required autoComplete="current-password"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full py-2.5">
                  {loading
                    ? <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</span>
                    : <span className="flex items-center gap-2"><LogIn className="h-4 w-4" />Sign In</span>}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">New Password</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="At least 8 characters" required minLength={8}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Confirm Password</label>
                  <input type="password" value={password2} onChange={e => setPassword2(e.target.value)}
                    placeholder="••••••••" required
                    className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full py-2.5">
                  {loading
                    ? <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Setting password...</span>
                    : <span className="flex items-center gap-2"><KeyRound className="h-4 w-4" />Set Password</span>}
                </Button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-stone-400 mt-6">
            Untouched Safaris – Internal System · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
