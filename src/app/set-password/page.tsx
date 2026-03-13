"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Leaf, KeyRound } from "lucide-react"

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password !== password2) { setError("Passwörter stimmen nicht überein."); return }
    if (password.length < 8) { setError("Mindestens 8 Zeichen erforderlich."); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      router.replace("/")
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#4A7C59] rounded-2xl mb-4 shadow-lg">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Untouched Safaris</h1>
          <p className="text-stone-500 text-sm mt-1">Passwort festlegen</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-stone-200">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="h-5 w-5 text-[#6B4226]" />
            <h2 className="text-lg font-bold text-stone-900">Willkommen!</h2>
          </div>
          <p className="text-sm text-stone-500 mb-6">
            Bitte lege jetzt dein persönliches Passwort fest, um dich zukünftig anzumelden.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              {loading
                ? <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Speichern...</span>
                : <span className="flex items-center gap-2"><KeyRound className="h-4 w-4" />Passwort speichern & weiter</span>}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
