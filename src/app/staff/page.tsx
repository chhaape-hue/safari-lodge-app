"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/ui/stat-card"
import { DEMO_STAFF, DEMO_PROPERTIES } from "@/lib/demo-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Users, Plus, Search, UserCheck, DollarSign, Building2 } from "lucide-react"
import type { Department, StaffStatus, EmploymentType } from "@/types"

const departmentConfig: Record<Department, { label: string; color: string }> = {
  management: { label: "Management", color: "bg-purple-100 text-purple-700" },
  housekeeping: { label: "Housekeeping", color: "bg-blue-100 text-blue-700" },
  kitchen: { label: "Küche", color: "bg-green-100 text-green-700" },
  guides: { label: "Guides", color: "bg-amber-100 text-amber-700" },
  maintenance: { label: "Wartung", color: "bg-orange-100 text-orange-700" },
  reception: { label: "Rezeption", color: "bg-sky-100 text-sky-700" },
  logistics: { label: "Logistik", color: "bg-stone-100 text-stone-700" },
  security: { label: "Sicherheit", color: "bg-red-100 text-red-700" },
}

const statusConfig: Record<StaffStatus, { label: string; variant: "success" | "warning" | "neutral" | "danger" }> = {
  active: { label: "Aktiv", variant: "success" },
  inactive: { label: "Inaktiv", variant: "neutral" },
  on_leave: { label: "Urlaub", variant: "warning" },
}

const employmentTypeLabel: Record<EmploymentType, string> = {
  full_time: "Vollzeit",
  part_time: "Teilzeit",
  seasonal: "Saisonal",
  contractor: "Freelancer",
}

export default function StaffPage() {
  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState<string>("all")
  const [propFilter, setPropFilter] = useState<string>("all")

  const filtered = DEMO_STAFF.filter(s => {
    const matchesSearch = search === "" ||
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      s.position.toLowerCase().includes(search.toLowerCase())
    const matchesDept = deptFilter === "all" || s.department === deptFilter
    const matchesProp = propFilter === "all" || s.property_id === propFilter
    return matchesSearch && matchesDept && matchesProp
  })

  const totalPayroll = filtered.filter(s => s.status === "active").reduce((sum, s) => sum + s.salary, 0)
  const activeCount = DEMO_STAFF.filter(s => s.status === "active").length

  return (
    <div>
      <Topbar
        title="Personal (HR)"
        subtitle="Mitarbeiterverwaltung und Gehälter"
        actions={
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            Mitarbeiter hinzufügen
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Aktive Mitarbeiter" value={activeCount} icon={UserCheck} color="green" />
          <StatCard title="Monatliche Gehälter" value={formatCurrency(DEMO_STAFF.filter(s => s.status === "active").reduce((s, m) => s + m.salary, 0))} icon={DollarSign} color="rose" />
          <StatCard title="Abteilungen" value={new Set(DEMO_STAFF.map(s => s.department)).size} icon={Building2} color="blue" />
          <StatCard title="Properties" value={new Set(DEMO_STAFF.map(s => s.property_id).filter(Boolean)).size} icon={Users} color="amber" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Name oder Position..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 w-56"
            />
          </div>
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Alle Abteilungen</option>
            {(Object.entries(departmentConfig) as [Department, typeof departmentConfig[Department]][]).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
          <select
            value={propFilter}
            onChange={e => setPropFilter(e.target.value)}
            className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Alle Properties</option>
            {DEMO_PROPERTIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {filtered.length > 0 && (
            <div className="ml-auto text-sm text-stone-500 self-center">
              {filtered.length} Mitarbeiter · Gehaltssumme:{" "}
              <strong>{formatCurrency(totalPayroll)}</strong> / Monat
            </div>
          )}
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-medium">Mitarbeiter</th>
                <th className="px-5 py-3 text-left font-medium">Property</th>
                <th className="px-5 py-3 text-left font-medium">Abteilung</th>
                <th className="px-5 py-3 text-left font-medium">Position</th>
                <th className="px-5 py-3 text-left font-medium">Anstellung</th>
                <th className="px-5 py-3 text-left font-medium">Seit</th>
                <th className="px-5 py-3 text-right font-medium">Gehalt / Monat</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map((staff) => {
                const property = DEMO_PROPERTIES.find(p => p.id === staff.property_id)
                const dept = departmentConfig[staff.department]
                const status = statusConfig[staff.status]
                return (
                  <tr key={staff.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-amber-700">
                            {staff.first_name[0]}{staff.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-stone-900">{staff.first_name} {staff.last_name}</p>
                          {staff.email && <p className="text-xs text-stone-400">{staff.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-stone-500">{property?.name || "–"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dept.color}`}>
                        {dept.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-stone-700">{staff.position}</td>
                    <td className="px-5 py-3 text-xs text-stone-500">{employmentTypeLabel[staff.employment_type]}</td>
                    <td className="px-5 py-3 text-stone-600">{formatDate(staff.start_date)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-stone-900">
                      {formatCurrency(staff.salary, staff.currency)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Button variant="ghost" size="sm">Details</Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-stone-400">
              <Users className="h-8 w-8 mb-2" />
              <p className="text-sm">Keine Mitarbeiter gefunden</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
