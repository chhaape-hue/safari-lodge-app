"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import {
  ExternalLink, AlertCircle, CheckCircle2, XCircle,
  Calendar, DollarSign, Globe, Info, Copy, Check,
} from "lucide-react"

const NBID = process.env.NEXT_PUBLIC_NIGHTSBRIDGE_NBID ?? ""

function nbBookingUrl(bbid: string, checkIn?: string, checkOut?: string) {
  const base = `https://book.nightsbridge.com/${bbid}`
  if (checkIn && checkOut) return `${base}?startdate=${checkIn}&enddate=${checkOut}`
  return base
}

function nbWidgetUrl(bbid: string) {
  return `https://www.nightsbridge.co.za/bridge/view?gridwidget=1&bbid=${bbid}`
}

export default function NightsbridgePage() {
  const { properties, bookings } = useStore()
  const [checkIn, setCheckIn]   = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [availability, setAvailability] = useState<Record<string, { loading: boolean; result: string | null }>>({})
  const [copied, setCopied] = useState("")

  const connectedProperties = properties.filter(p => p.nightsbridge_property_id)
  const nbBookings = bookings.filter(b => b.nightsbridge_booking_id)
  const isConfigured = !!NBID

  async function checkAvailability(bbid: string) {
    if (!checkIn || !checkOut) return
    setAvailability(prev => ({ ...prev, [bbid]: { loading: true, result: null } }))
    try {
      const res = await fetch("/api/nightsbridge/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bbid, checkIn, checkOut }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAvailability(prev => ({ ...prev, [bbid]: { loading: false, result: `Error: ${data.error}` } }))
      } else {
        // NightsBridge returns availability info – show raw result for now
        setAvailability(prev => ({ ...prev, [bbid]: { loading: false, result: JSON.stringify(data, null, 2) } }))
      }
    } catch {
      setAvailability(prev => ({ ...prev, [bbid]: { loading: false, result: "Network error" } }))
    }
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(""), 2000)
  }

  return (
    <div>
      <Topbar
        title="NightsBridge Integration"
        subtitle="Live availability, pricing and booking links"
      />

      <div className="p-6 space-y-6">

        {/* How it works banner */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-5">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900 space-y-1">
                <p className="font-semibold">How NightsBridge integration works</p>
                <p className="text-amber-800">
                  NightsBridge uses <strong>bbid</strong> (property ID) + <strong>nbid</strong> (affiliate code) + <strong>password</strong> for authentication —
                  no traditional API key. Bookings are completed on NightsBridge&apos;s own secure portal (redirect model).
                  Real-time availability checks require affiliate registration at{" "}
                  <a href="https://site.nightsbridge.com/nightsbridge-for-agents/" target="_blank" rel="noopener noreferrer"
                    className="underline font-medium">nightsbridge.com/for-agents</a>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isConfigured ? "bg-green-100" : "bg-stone-100"}`}>
                  {isConfigured
                    ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                    : <XCircle className="h-5 w-5 text-stone-400" />}
                </div>
                <div>
                  <p className="font-semibold text-stone-900">
                    {isConfigured ? "Affiliate configured" : "Not configured"}
                  </p>
                  <p className="text-xs text-stone-500">NightsBridge NBID</p>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Connected properties</span>
                  <span className="font-medium">{connectedProperties.length} / {properties.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">NB bookings in system</span>
                  <span className="font-medium">{nbBookings.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <p className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4 text-amber-500" />
                Integration Model
              </p>
              <div className="space-y-2 text-xs text-stone-600">
                {[
                  { label: "Availability check via API", supported: true },
                  { label: "From-price / lowest rate", supported: true },
                  { label: "Booking via NB redirect", supported: true },
                  { label: "Widget embed (grid calendar)", supported: true },
                  { label: "Direct booking creation API", supported: false },
                  { label: "Pull all bookings via API", supported: false },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span>{item.label}</span>
                    <span className={item.supported ? "text-green-600 font-medium" : "text-stone-400"}>
                      {item.supported ? "✓" : "✗"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <p className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-amber-500" />
                Vercel Environment Variables
              </p>
              <div className="space-y-2 text-xs font-mono">
                {[
                  { key: "NIGHTSBRIDGE_NBID", label: "Affiliate code (server)", public: false },
                  { key: "NIGHTSBRIDGE_PASSWORD", label: "Affiliate password (server)", public: false },
                  { key: "NEXT_PUBLIC_NIGHTSBRIDGE_NBID", label: "Affiliate code (client)", public: true },
                ].map(v => (
                  <div key={v.key} className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(v.key, v.key)}
                      className="flex items-center gap-1 bg-stone-100 rounded px-1.5 py-0.5 hover:bg-stone-200 transition-colors"
                    >
                      {copied === v.key ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-stone-400" />}
                      {v.key}
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-3">
                Set these in Vercel → Project → Settings → Environment Variables
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Availability checker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-500" />
              Availability Check
            </CardTitle>
            <CardDescription>
              Check live availability via NightsBridge API for a date range. Requires affiliate credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              <div>
                <label className="text-xs text-stone-500 block mb-1">Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                  className="border border-stone-300 rounded-lg px-3 py-1.5 text-sm bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={e => setCheckOut(e.target.value)}
                  min={checkIn}
                  className="border border-stone-300 rounded-lg px-3 py-1.5 text-sm bg-white"
                />
              </div>
            </div>

            {connectedProperties.length === 0 ? (
              <p className="text-sm text-stone-500 py-4 text-center">
                No properties have a NightsBridge ID set. Edit a property and add its BBID.
              </p>
            ) : (
              <div className="space-y-2">
                {connectedProperties.map(property => {
                  const bbid = property.nightsbridge_property_id!
                  const avail = availability[bbid]
                  return (
                    <div key={property.id} className="flex items-start gap-3 p-3 rounded-lg border border-stone-100 bg-stone-50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900">{property.name}</p>
                        <p className="text-xs text-stone-500 font-mono">BBID: {bbid}</p>
                        {avail?.result && (
                          <pre className="mt-2 text-xs bg-white border border-stone-200 rounded p-2 overflow-auto max-h-32">
                            {avail.result}
                          </pre>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={!checkIn || !checkOut || avail?.loading}
                          onClick={() => checkAvailability(bbid)}
                        >
                          {avail?.loading ? "Checking..." : "Check"}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={!checkIn || !checkOut}
                          onClick={() => window.open(nbBookingUrl(bbid, checkIn, checkOut), "_blank")}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Book on NB
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Properties table */}
        <Card>
          <CardHeader>
            <CardTitle>Properties & NightsBridge Links</CardTitle>
            <CardDescription>
              BBID = NightsBridge Property ID. Set it on each property to enable booking links and availability checks.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {properties.length === 0 ? (
              <p className="text-sm text-stone-500 px-5 py-8 text-center">No properties found</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left font-medium">Property</th>
                    <th className="px-5 py-3 text-left font-medium">BBID</th>
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                    <th className="px-5 py-3 text-left font-medium">NB Bookings</th>
                    <th className="px-5 py-3 text-left font-medium">Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {properties.map(property => {
                    const bbid = property.nightsbridge_property_id
                    const propNbBookings = bookings.filter(b => b.property_id === property.id && b.nightsbridge_booking_id)
                    return (
                      <tr key={property.id} className="hover:bg-stone-50">
                        <td className="px-5 py-3 font-medium text-stone-900">{property.name}</td>
                        <td className="px-5 py-3 font-mono text-xs text-stone-600">
                          {bbid ?? <span className="text-stone-400 italic">not set</span>}
                        </td>
                        <td className="px-5 py-3">
                          {bbid
                            ? <Badge variant="success">Connected</Badge>
                            : <Badge variant="neutral">Not connected</Badge>}
                        </td>
                        <td className="px-5 py-3 text-stone-600">{propNbBookings.length}</td>
                        <td className="px-5 py-3">
                          {bbid ? (
                            <div className="flex gap-1.5 flex-wrap">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(nbBookingUrl(bbid), "_blank")}
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Booking form
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(nbWidgetUrl(bbid), "_blank")}
                              >
                                <Calendar className="h-3.5 w-3.5" />
                                Grid widget
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-stone-400">
                              Add BBID in property settings
                            </span>
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

        {/* Setup guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Setup Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-stone-600 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="font-semibold text-stone-800">Step 1 – Get your BBID(s)</p>
                <p>Each property in NightsBridge has a unique 5-digit <strong>BBID</strong>.
                  Find it in your NightsBridge account under property settings.
                  Add it to each property in this app (Properties → Edit → NightsBridge ID).</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-stone-800">Step 2 – Register as affiliate (optional)</p>
                <p>For real-time availability checks via the API, register at{" "}
                  <a href="https://site.nightsbridge.com/nightsbridge-for-agents/" target="_blank"
                    rel="noopener noreferrer" className="text-amber-700 underline">
                    NightsBridge for Agents
                  </a>.
                  You receive a <strong>NBID</strong> and <strong>password</strong>.
                  Add these to Vercel environment variables.</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-stone-800">Step 3 – Embed booking links</p>
                <p>Without affiliate credentials, you can still use the booking redirect links above.
                  When a guest wants to book, click <em>Booking form</em> — they&apos;re taken directly to the
                  NightsBridge checkout. NightsBridge handles payment and sends confirmations.</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-stone-800">Step 4 – Record NB bookings in this app</p>
                <p>When NightsBridge confirms a booking, note the booking ID and add it to the booking record
                  here (Bookings → Edit → NightsBridge Booking ID). This links the booking to NightsBridge
                  for tracking purposes.</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
