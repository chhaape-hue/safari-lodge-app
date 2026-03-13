"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/ui/stat-card"
import { StaffForm } from "@/components/modules/staff-form"
import { useStore } from "@/lib/store"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Users, Plus, Search, UserCheck, DollarSign, Building2, Trash2, AlertCircle } from "lucide-react"
import { PageLoader } from "@/components/ui/loading-spinner"
import type { Department, StaffStatus, EmploymentType } from "@/types"

const deptConfig: Record<Department, { label: string; color: string }> = {
  management:  { label: "Management",   color: "bg-purple-100 text-purple-700" },
  housekeeping:{ label: "Housekeeping", color: "bg-blue-100 text-blue-700" },
  kitchen:     { label: "Kitchen",      color: "bg-green-100 text-green-700" },
  guides:      { label: "Guides",       color: "bg-amber-100 text-amber-700" },
  maintenance: { label: "Maintenance",  color: "bg-orange-100 text-orange-700" },
  reception:   { label: "Reception",    color: "bg-sky-100 text-sky-700" },
  logistics:   { label: "Logistics",    color: "bg-stone-100 text-stone-700" },
  security:    { label: "Security",     color: "bg-red-100 text-red-700" },
}

const statusConfig: Record<StaffStatus, { label: string; variant: "success"|"warning"|"neutral"|"danger" }> = {
  active:   { label: "Active",    variant: "success" },
  inactive: { label: "Inactive",  variant: "neutral" },
  on_leave: { label: "On Leave",  variant: "warning" },
}

const employTypeLabel: Record<EmploymentType, string> = {
  full_time: "Full-time", part_time: "Part-time", seasonal: "Seasonal", contractor: "Contractor",
}

export default function StaffPage() {
  const { staff, properties, deleteStaff, updateStaff, loading, error } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState("all")
  const [propFilter, setPropFilter] = useState("all")

  const filtered = staff.filter(s =>
    (!search || `${s.first_name} ${s.last_name} ${s.position}`.toLowerCase().includes(search.toLowerCase())) &&
    (deptFilter === "all" || s.department === deptFilter) &&
    (propFilter === "all" || s.property_id === propFilter)
  )

  const activeStaff = staff.filter(s => s.status === "active")
  const totalPayroll = activeStaff.reduce((s, m) => s + m.salary, 0)

  return (
    <div>
      <Topbar title="Staff (HR)" subtitle={`${staff.length} team members`}
        actions={<Button size="sm" onClick={() => setShowForm(true)}><Plus className="h-3.5 w-3.5" />Add Staff Member</Button>}
      />
      {loading && <PageLoader message="Loading staff data..." />}
      {error && (
        <div className="mx-6 mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {!loading && <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Staff" value={activeStaff.length} icon={UserCheck} color="green" />
          <StatCard title="Monthly Payroll" value={formatCurrency(totalPayroll)} icon={DollarSign} color="rose" />
          <StatCard title="Departments" value={new Set(staff.map(s => s.department)).size} icon={Building2} color="blue" />
          <StatCard title="Properties" value={new Set(staff.map(s => s.property_id).filter(Boolean)).size} icon={Users} color="amber" />
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input type="text" placeholder="Name or position..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4226] w-56" />
          </div>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4226]">
            <option value="all">All Departments</option>
            {(Object.entries(deptConfig) as [Department, typeof deptConfig[Department]][]).map(([k, c]) => (
              <option key={k} value={k}>{c.label}</option>
            ))}
          </select>
          <select value={propFilter} onChange={e => setPropFilter(e.target.value)}
            className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4226]">
            <option value="all">All Properties</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {filtered.length > 0 && (
            <span className="ml-auto text-sm text-stone-500">
              {filtered.length} members · <strong>{formatCurrency(filtered.filter(s=>s.status==="active").reduce((s,m)=>s+m.salary,0))}</strong> / month
            </span>
          )}
        </div>
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wider">
                {["Staff Member","Property","Department","Position","Employment","Since","Salary/Mo","Status",""].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map(member => {
                const property = properties.find(p => p.id === member.property_id)
                const dept = deptConfig[member.department]
                const status = statusConfig[member.status]
                return (
                  <tr key={member.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#F5E6D0] flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-[#6B4226]">{member.first_name[0]}{member.last_name[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-stone-900">{member.first_name} {member.last_name}</p>
                          {member.email && <p className="text-xs text-stone-400">{member.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-stone-500">{property?.name || "–"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dept.color}`}>{dept.label}</span>
                    </td>
                    <td className="px-5 py-3 text-stone-700">{member.position}</td>
                    <td className="px-5 py-3 text-xs text-stone-500">{employTypeLabel[member.employment_type]}</td>
                    <td className="px-5 py-3 text-stone-600">{formatDate(member.start_date)}</td>
                    <td className="px-5 py-3 font-semibold text-stone-900">{formatCurrency(member.salary, member.currency)}</td>
                    <td className="px-5 py-3"><Badge variant={status.variant}>{status.label}</Badge></td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        {member.status === "active" && (
                          <button onClick={() => updateStaff(member.id, { status: "on_leave" })}
                            className="px-2 py-1 rounded text-xs text-stone-500 hover:bg-stone-100" title="Set on leave">
                            Leave
                          </button>
                        )}
                        <button onClick={() => { if(confirm("Delete this staff member?")) deleteStaff(member.id) }}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-stone-400">
              <Users className="h-8 w-8 mb-2" />
              <p className="text-sm">No staff members yet</p>
              <Button size="sm" className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="h-3.5 w-3.5" /> Add first staff member
              </Button>
            </div>
          )}
        </div>
      </div>}
      {showForm && <StaffForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
