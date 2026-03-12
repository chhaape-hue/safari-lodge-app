"use client"

import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Plus, Users, Send, Eye, Edit, TrendingUp } from "lucide-react"

const campaigns = [
  {
    id: 1,
    name: "Sommer Special 2025 – O Bona Moremi",
    status: "sent",
    recipients: 1240,
    opened: 387,
    clicked: 89,
    date: "05.03.2025",
    type: "Promotion"
  },
  {
    id: 2,
    name: "Neujahr Newsletter – Untouched Safaris",
    status: "sent",
    recipients: 1890,
    opened: 612,
    clicked: 134,
    date: "02.01.2025",
    type: "Newsletter"
  },
  {
    id: 3,
    name: "Nkasa Plains Camp – Voranmeldung",
    status: "draft",
    recipients: 0,
    opened: 0,
    clicked: 0,
    date: "–",
    type: "Ankündigung"
  },
  {
    id: 4,
    name: "Buchungsbestätigung – Template",
    status: "template",
    recipients: 0,
    opened: 0,
    clicked: 0,
    date: "–",
    type: "Transaktional"
  },
]

const statusConfig = {
  sent: { label: "Gesendet", variant: "success" as const },
  draft: { label: "Entwurf", variant: "neutral" as const },
  template: { label: "Template", variant: "info" as const },
  scheduled: { label: "Geplant", variant: "warning" as const },
}

export default function EmailPage() {
  return (
    <div>
      <Topbar
        title="E-Mail Marketing"
        subtitle="Kampagnen und Mailverwaltung (Outlook-Integration)"
        actions={
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            Neue Kampagne
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Outlook Integration Banner */}
        <div className="flex items-start gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-blue-900">Microsoft Outlook Integration</p>
            <p className="text-sm text-blue-700 mt-0.5">
              Verbinde dein Outlook-Konto über Microsoft Graph API, um Kampagnen direkt aus dieser Verwaltungsapp zu senden
              und eingehende Buchungsanfragen hier zu verwalten.
            </p>
          </div>
          <Button variant="secondary" size="sm" className="shrink-0">
            Outlook verbinden
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Kontakte", value: "2.140", icon: Users, color: "text-blue-700" },
            { label: "Kampagnen gesamt", value: "12", icon: Mail, color: "text-stone-700" },
            { label: "Ø Öffnungsrate", value: "32.4%", icon: Eye, color: "text-green-700" },
            { label: "Ø Klickrate", value: "8.7%", icon: TrendingUp, color: "text-amber-700" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-500">{stat.label}</p>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-stone-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Campaigns */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Kampagnen</CardTitle>
                <CardDescription>E-Mail Marketingkampagnen für Gäste und Interessenten</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  <Users className="h-3.5 w-3.5" />
                  Kontaktlisten
                </Button>
                <Button variant="secondary" size="sm">
                  <Edit className="h-3.5 w-3.5" />
                  Templates
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium">Kampagne</th>
                  <th className="px-5 py-3 text-left font-medium">Typ</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Empfänger</th>
                  <th className="px-5 py-3 text-right font-medium">Geöffnet</th>
                  <th className="px-5 py-3 text-right font-medium">Geklickt</th>
                  <th className="px-5 py-3 text-left font-medium">Datum</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {campaigns.map(campaign => {
                  const status = statusConfig[campaign.status as keyof typeof statusConfig]
                  const openRate = campaign.recipients > 0
                    ? ((campaign.opened / campaign.recipients) * 100).toFixed(1) + "%"
                    : "–"
                  const clickRate = campaign.recipients > 0
                    ? ((campaign.clicked / campaign.recipients) * 100).toFixed(1) + "%"
                    : "–"
                  return (
                    <tr key={campaign.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-stone-900">{campaign.name}</td>
                      <td className="px-5 py-3 text-stone-500 text-xs">{campaign.type}</td>
                      <td className="px-5 py-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right text-stone-700">{campaign.recipients || "–"}</td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-stone-700">{campaign.opened || "–"}</span>
                        {campaign.opened > 0 && (
                          <span className="text-xs text-green-600 ml-1">({openRate})</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-stone-700">{campaign.clicked || "–"}</span>
                        {campaign.clicked > 0 && (
                          <span className="text-xs text-green-600 ml-1">({clickRate})</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-stone-500">{campaign.date}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          {campaign.status === "sent" && (
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {(campaign.status === "draft" || campaign.status === "template") && (
                            <>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="sm">
                                <Send className="h-3.5 w-3.5" />
                                Senden
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
