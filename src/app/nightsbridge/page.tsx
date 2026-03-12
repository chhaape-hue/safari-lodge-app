"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DEMO_PROPERTIES, DEMO_BOOKINGS } from "@/lib/demo-data"
import { formatDate } from "@/lib/utils"
import {
  RefreshCw, CheckCircle2, XCircle, AlertCircle,
  Link2, Settings, ArrowLeftRight, Clock, ExternalLink
} from "lucide-react"

const syncLog = [
  { time: "2025-03-12 08:45", action: "Sync gestartet", status: "success", details: "4 Buchungen synchronisiert" },
  { time: "2025-03-12 08:45", action: "Buchung NB-78451 importiert", status: "success", details: "O Bona Moremi – Sarah Johnson" },
  { time: "2025-03-11 14:20", action: "Verfügbarkeit aktualisiert", status: "success", details: "O Bona Moremi: 5 Zimmer aktualisiert" },
  { time: "2025-03-11 09:00", action: "Sync gestartet", status: "warning", details: "1 Konflikt erkannt: Zimmer 04 doppelt gebucht" },
  { time: "2025-03-10 18:30", action: "Buchung NB-78234 importiert", status: "success", details: "O Bona Moremi – Klaus Müller" },
  { time: "2025-03-10 08:00", action: "Sync fehlgeschlagen", status: "error", details: "API Timeout – wird erneut versucht" },
]

export default function NightsbridgePage() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync] = useState("12.03.2025, 08:45")

  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => setIsSyncing(false), 2500)
  }

  const connectedProperties = DEMO_PROPERTIES.filter(p => p.nightsbridge_property_id)
  const nbBookings = DEMO_BOOKINGS.filter(b => b.nightsbridge_booking_id)

  return (
    <div>
      <Topbar
        title="Nightsbridge Integration"
        subtitle="Zwei-Wege-Synchronisation für Online-Buchungen"
        actions={
          <Button onClick={handleSync} disabled={isSyncing}>
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Synchronisiert..." : "Jetzt synchronisieren"}
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Connection Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-stone-900">Verbunden</p>
                  <p className="text-xs text-stone-500">Nightsbridge API aktiv</p>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Letzter Sync:</span>
                  <span className="font-medium text-stone-700">{lastSync}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">NB-Buchungen:</span>
                  <span className="font-medium text-stone-700">{nbBookings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Verbundene Properties:</span>
                  <span className="font-medium text-stone-700">{connectedProperties.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <p className="text-sm font-semibold text-stone-700 mb-3">Sync-Modus</p>
              <div className="space-y-2">
                {[
                  { label: "Buchungen importieren (NB → App)", active: true },
                  { label: "Verfügbarkeit exportieren (App → NB)", active: true },
                  { label: "Preise synchronisieren", active: false },
                  { label: "Gästedaten synchronisieren", active: true },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-stone-600">{item.label}</span>
                    <div className={`h-4 w-8 rounded-full transition-colors ${item.active ? "bg-amber-500" : "bg-stone-200"}`}>
                      <div className={`h-3 w-3 rounded-full bg-white shadow-sm mt-0.5 transition-transform ${item.active ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <p className="text-sm font-semibold text-stone-700 mb-3">API-Konfiguration</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-stone-500">API Key</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="password"
                      value="nb_live_xxxxxxxxxxxx"
                      readOnly
                      className="flex-1 text-sm border border-stone-300 rounded-lg px-3 py-1.5 bg-stone-50 text-stone-600 font-mono"
                    />
                    <Button variant="secondary" size="sm">
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-stone-500">Auto-Sync Intervall</label>
                  <select className="w-full mt-1 text-sm border border-stone-300 rounded-lg px-3 py-1.5 bg-white">
                    <option>Alle 15 Minuten</option>
                    <option>Alle 30 Minuten</option>
                    <option>Stündlich</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connected Properties */}
        <Card>
          <CardHeader>
            <CardTitle>Verbundene Properties</CardTitle>
            <CardDescription>Nightsbridge Property-IDs und Sync-Status</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium">Property</th>
                  <th className="px-5 py-3 text-left font-medium">Nightsbridge ID</th>
                  <th className="px-5 py-3 text-left font-medium">Typ</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">NB-Buchungen</th>
                  <th className="px-5 py-3 text-left font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {DEMO_PROPERTIES.map(property => {
                  const isConnected = !!property.nightsbridge_property_id
                  const propBookings = DEMO_BOOKINGS.filter(b => b.property_id === property.id && b.nightsbridge_booking_id)
                  return (
                    <tr key={property.id} className="hover:bg-stone-50">
                      <td className="px-5 py-3 font-medium text-stone-900">{property.name}</td>
                      <td className="px-5 py-3 font-mono text-xs text-stone-600">
                        {property.nightsbridge_property_id || "–"}
                      </td>
                      <td className="px-5 py-3 text-stone-500 capitalize">{property.type}</td>
                      <td className="px-5 py-3">
                        {isConnected
                          ? <Badge variant="success">Verbunden</Badge>
                          : <Badge variant="neutral">Nicht verbunden</Badge>
                        }
                      </td>
                      <td className="px-5 py-3 text-stone-600">{propBookings.length}</td>
                      <td className="px-5 py-3">
                        {isConnected && (
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-3.5 w-3.5" />
                            NB öffnen
                          </Button>
                        )}
                        {!isConnected && (
                          <Button variant="secondary" size="sm">
                            <Link2 className="h-3.5 w-3.5" />
                            Verbinden
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Sync Log */}
        <Card>
          <CardHeader>
            <CardTitle>Sync-Protokoll</CardTitle>
            <CardDescription>Letzte Synchronisationsaktivitäten</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-stone-50">
              {syncLog.map((entry, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-stone-50">
                  <div className="mt-0.5">
                    {entry.status === "success" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {entry.status === "warning" && <AlertCircle className="h-4 w-4 text-amber-500" />}
                    {entry.status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-800">{entry.action}</p>
                    <p className="text-xs text-stone-500">{entry.details}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-stone-400">
                    <Clock className="h-3 w-3" />
                    {entry.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
