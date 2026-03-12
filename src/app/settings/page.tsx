"use client"

import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Database, Globe, Mail, Shield, Bell, DollarSign } from "lucide-react"

export default function SettingsPage() {
  return (
    <div>
      <Topbar title="Einstellungen" subtitle="System- und Unternehmenskonfiguration" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Unternehmenseinstellungen</CardTitle>
              <CardDescription>Basis-Informationen für Untouched Safaris</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Unternehmensname", value: "Untouched Safaris (Pty) Ltd" },
                { label: "Website", value: "untouched-safaris.com" },
                { label: "Hauptstandort", value: "Maun, Botswana" },
                { label: "Hauptwährung", value: "BWP (Botswana Pula)" },
                { label: "Zeitzone", value: "Africa/Gaborone (CAT, UTC+2)" },
                { label: "Sprache", value: "Deutsch / English" },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-1 border-b border-stone-50 last:border-0">
                  <span className="text-sm text-stone-500">{item.label}</span>
                  <span className="text-sm font-medium text-stone-800">{item.value}</span>
                </div>
              ))}
              <Button variant="secondary" size="sm" className="w-full mt-2">
                Bearbeiten
              </Button>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card>
            <CardHeader>
              <CardTitle>Integrationen</CardTitle>
              <CardDescription>Externe Dienste und APIs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Nightsbridge", desc: "Online-Buchung & Channel Manager", status: "connected", icon: Globe },
                { name: "Supabase", desc: "Datenbank & Authentifizierung", status: "connected", icon: Database },
                { name: "Microsoft Outlook", desc: "E-Mail Marketing & Kommunikation", status: "disconnected", icon: Mail },
                { name: "Vercel", desc: "Hosting & Deployment", status: "connected", icon: Globe },
              ].map(item => (
                <div key={item.name} className="flex items-center gap-3 p-3 rounded-lg border border-stone-100 hover:bg-stone-50">
                  <div className="h-8 w-8 rounded-lg bg-stone-100 flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-stone-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-800">{item.name}</p>
                    <p className="text-xs text-stone-400">{item.desc}</p>
                  </div>
                  <Badge variant={item.status === "connected" ? "success" : "neutral"}>
                    {item.status === "connected" ? "Verbunden" : "Getrennt"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungen</CardTitle>
              <CardDescription>Wann soll das System dich benachrichtigen?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Neue Buchung via Nightsbridge", active: true },
                { label: "Buchungsstornierung", active: true },
                { label: "Check-in Erinnerung (1 Tag vorher)", active: true },
                { label: "Offene Zahlungen (> 7 Tage)", active: true },
                { label: "Wartungsaufgaben überfällig", active: false },
                { label: "Wöchentlicher Kostenbericht", active: true },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-stone-700">{item.label}</span>
                  <div className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer ${item.active ? "bg-amber-500" : "bg-stone-300"}`}>
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${item.active ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle>System</CardTitle>
              <CardDescription>Technische Informationen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Version", value: "v1.0.0 (MVP)" },
                { label: "Framework", value: "Next.js 14 + TypeScript" },
                { label: "Datenbank", value: "Supabase (PostgreSQL)" },
                { label: "Hosting", value: "Vercel" },
                { label: "Gebaut mit", value: "Claude (Anthropic)" },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-sm py-1 border-b border-stone-50 last:border-0">
                  <span className="text-stone-500">{item.label}</span>
                  <span className="font-medium text-stone-800">{item.value}</span>
                </div>
              ))}
              <div className="pt-2 space-y-2">
                <Button variant="secondary" size="sm" className="w-full">Datensicherung erstellen</Button>
                <Button variant="ghost" size="sm" className="w-full text-red-600 hover:bg-red-50">Demo-Daten löschen</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
