"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import {
  RefreshCw, CheckCircle2, XCircle, AlertCircle,
  Link2, Settings, ExternalLink
} from "lucide-react"

export default function NightsbridgePage() {
  const { properties, bookings } = useStore()
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => setIsSyncing(false), 2500)
  }

  const connectedProperties = properties.filter(p => p.nightsbridge_property_id)
  const nbBookings = bookings.filter(b => b.nightsbridge_booking_id)

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
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${connectedProperties.length > 0 ? "bg-green-100" : "bg-stone-100"}`}>
                  {connectedProperties.length > 0
                    ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                    : <XCircle className="h-5 w-5 text-stone-400" />}
                </div>
                <div>
                  <p className="font-semibold text-stone-900">
                    {connectedProperties.length > 0 ? "Verbunden" : "Nicht verbunden"}
                  </p>
                  <p className="text-xs text-stone-500">Nightsbridge API</p>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">NB-Buchungen:</span>
                  <span className="font-medium text-stone-700">{nbBookings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Verbundene Properties:</span>
                  <span className="font-medium text-stone-700">{connectedProperties.length} / {properties.length}</span>
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
                      placeholder="Nightsbridge API Key eingeben..."
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
            <CardTitle>Properties & Nightsbridge-Verbindung</CardTitle>
            <CardDescription>Nightsbridge Property-IDs und Sync-Status</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {properties.length === 0 ? (
              <p className="text-sm text-stone-500 px-5 py-8 text-center">Keine Properties vorhanden</p>
            ) : (
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
                  {properties.map(property => {
                    const isConnected = !!property.nightsbridge_property_id
                    const propNbBookings = bookings.filter(b => b.property_id === property.id && b.nightsbridge_booking_id)
                    return (
                      <tr key={property.id} className="hover:bg-stone-50">
                        <td className="px-5 py-3 font-medium text-stone-900">{property.name}</td>
                        <td className="px-5 py-3 font-mono text-xs text-stone-600">
                          {property.nightsbridge_property_id || "–"}
                        </td>
                        <td className="px-5 py-3 text-stone-500 capitalize">{property.property_type}</td>
                        <td className="px-5 py-3">
                          {isConnected
                            ? <Badge variant="success">Verbunden</Badge>
                            : <Badge variant="neutral">Nicht verbunden</Badge>
                          }
                        </td>
                        <td className="px-5 py-3 text-stone-600">{propNbBookings.length}</td>
                        <td className="px-5 py-3">
                          {isConnected ? (
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-3.5 w-3.5" />
                              NB öffnen
                            </Button>
                          ) : (
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
            )}
          </CardContent>
        </Card>

        {connectedProperties.length === 0 && properties.length > 0 && (
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-stone-800">Keine Nightsbridge-Verbindung</p>
                  <p className="text-xs text-stone-500 mt-1">
                    Um Properties mit Nightsbridge zu verbinden, füge die Nightsbridge Property-ID in den Property-Einstellungen hinzu
                    (Properties → Übersicht → Property bearbeiten → Nightsbridge ID).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
