"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { LogIn, Eye, EyeOff, Leaf, KeyRound } from "lucide-react"

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
      setInfo("Einladung akzeptiert — bitte ein Passwort wählen.")
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError("E-Mail oder Passwort falsch.")
    } else {
      router.replace("/")
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password !== password2) {
      setError("Passwörter stimmen nicht überein.")
      return
    }
    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein.")
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setInfo("Passwort gesetzt! Du wirst weitergeleitet...")
      setTimeout(() => router.replace("/"), 1500)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#4A7C59] rounded-2xl mb-4 shadow-lg">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Untouched Safaris</h1>
          <p className="text-stone-500 text-sm mt-1">Lodge Management System</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-stone-200">
          <div className="flex items-center gap-2 mb-6">
            {mode === "set-password"
              ? <KeyRound className="h-5 w-5 text-[#6B4226]" />
              : <LogIn className="h-5 w-5 text-[#6B4226]" />}
            <h2 className="text-lg font-bold text-stone-900">
              {mode === "set-password" ? "Passwort festlegen" : "Anmelden"}
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
                <label className="block text-sm font-medium text-stone-700 mb-1">E-Mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="ihre@email.com" required autoComplete="email"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4226]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Passwort</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required autoComplete="current-password"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#6B4226]" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full py-2.5">
                {loading ? <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Anmelden...</span>
                  : <span className="flex items-center gap-2"><LogIn className="h-4 w-4" />Anmelden</span>}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Neues Passwort</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Mindestens 8 Zeichen" required minLength={8}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#6B4226]" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Passwort bestätigen</label>
                <input type="password" value={password2} onChange={e => setPassword2(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4226]" />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full py-2.5">
                {loading ? <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Speichere...</span>
                  : <span className="flex items-center gap-2"><KeyRound className="h-4 w-4" />Passwort speichern</span>}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Untouched Safaris – Internes System · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
