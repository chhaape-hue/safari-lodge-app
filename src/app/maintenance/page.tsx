"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/ui/stat-card"
import {
  Wrench, Plus, Search, AlertTriangle, CheckCircle2,
  Clock, XCircle, Car, Building, Zap, Droplets
} from "lucide-react"

type Priority = "low" | "medium" | "high" | "critical"
type MaintenanceStatus = "open" | "in_progress" | "completed" | "deferred"
type MaintenanceType = "vehicle" | "building" | "electrical" | "plumbing" | "equipment" | "other"

interface MaintenanceTask {
  id: string
  title: string
  description: string
  type: MaintenanceType
  priority: Priority
  status: MaintenanceStatus
  property: string
  location: string
  reported_by: string
  assigned_to?: string
  reported_date: string
  due_date?: string
  completed_date?: string
  cost_estimate?: number
  notes?: string
}

const DEMO_TASKS: MaintenanceTask[] = [
  {
    id: "1",
    title: "Generator Service – 250h check",
    description: "Main generator needs 250-hour service including oil change, filter replacement, and belt inspection.",
    type: "equipment",
    priority: "high",
    status: "open",
    property: "O Bona Moremi",
    location: "Generator room",
    reported_by: "Kabo Sithole",
    due_date: "2025-03-20",
    reported_date: "2025-03-10",
    cost_estimate: 2500,
  },
  {
    id: "2",
    title: "Tent 3 – Roof leak in canvas",
    description: "Small tear in the roof canvas causing water ingress during rain. Needs patching or replacement.",
    type: "building",
    priority: "medium",
    status: "in_progress",
    property: "Kiri Camp",
    location: "Tent 3",
    reported_by: "Molebatsi Tshosa",
    assigned_to: "Tebogo Kgosi",
    reported_date: "2025-03-08",
    due_date: "2025-03-15",
    cost_estimate: 800,
  },
  {
    id: "3",
    title: "Land Cruiser BW 3421 – Service",
    description: "40,000km service due. Oil, filters, brakes, and tyre rotation.",
    type: "vehicle",
    priority: "high",
    status: "open",
    property: "Nkasa Plains Camp",
    location: "Vehicle workshop",
    reported_by: "Njabuliso Dlamini",
    reported_date: "2025-03-05",
    due_date: "2025-03-18",
    cost_estimate: 4800,
  },
  {
    id: "4",
    title: "Reception – AC unit not cooling",
    description: "Air conditioning in main reception is running but not producing cold air. Possibly low refrigerant.",
    type: "electrical",
    priority: "medium",
    status: "open",
    property: "O Bona Moremi",
    location: "Main reception",
    reported_by: "Front Desk",
    reported_date: "2025-03-11",
    due_date: "2025-03-16",
    cost_estimate: 1200,
  },
  {
    id: "5",
    title: "Borehole pump – Low pressure",
    description: "Water pressure from borehole pump has reduced significantly. Pump bearing may need replacement.",
    type: "plumbing",
    priority: "critical",
    status: "in_progress",
    property: "Kiri Camp",
    location: "Borehole station",
    reported_by: "Kemiso Nare",
    assigned_to: "Botswana Pumps Ltd",
    reported_date: "2025-03-09",
    due_date: "2025-03-13",
    cost_estimate: 6500,
  },
  {
    id: "6",
    title: "Suite 2 – Bathroom light fixture",
    description: "Ceiling light in bathroom flickering. Likely faulty ballast or loose connection.",
    type: "electrical",
    priority: "low",
    status: "completed",
    property: "O Bona Moremi",
    location: "Suite 2 bathroom",
    reported_by: "Housekeeping",
    assigned_to: "Onkgopotse Molefi",
    reported_date: "2025-03-04",
    completed_date: "2025-03-06",
    cost_estimate: 150,
  },
]

const priorityConfig: Record<Priority, { label: string; variant: "danger" | "warning" | "info" | "neutral" | "success"; color: string }> = {
  critical: { label: "Critical", variant: "danger", color: "border-l-red-500" },
  high: { label: "High", variant: "warning", color: "border-l-orange-500" },
  medium: { label: "Medium", variant: "info", color: "border-l-blue-500" },
  low: { label: "Low", variant: "neutral", color: "border-l-stone-300" },
}

const statusConfig: Record<MaintenanceStatus, { label: string; variant: "danger" | "warning" | "success" | "info" | "neutral" }> = {
  open: { label: "Open", variant: "warning" },
  in_progress: { label: "In Progress", variant: "info" },
  completed: { label: "Completed", variant: "success" },
  deferred: { label: "Deferred", variant: "neutral" },
}

const typeIcon: Record<MaintenanceType, React.ElementType> = {
  vehicle: Car,
  building: Building,
  electrical: Zap,
  plumbing: Droplets,
  equipment: Wrench,
  other: Wrench,
}

export default function MaintenancePage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [showForm, setShowForm] = useState(false)

  const filtered = DEMO_TASKS.filter(task => {
    const matchesSearch = !search || task.title.toLowerCase().includes(search.toLowerCase()) || task.property.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const openTasks = DEMO_TASKS.filter(t => t.status === "open" || t.status === "in_progress")
  const criticalTasks = DEMO_TASKS.filter(t => t.priority === "critical")
  const estimatedCosts = openTasks.reduce((s, t) => s + (t.cost_estimate || 0), 0)

  return (
    <div>
      <Topbar
        title="Maintenance"
        subtitle="Track repairs, checks, and maintenance tasks"
        actions={
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" />
            Report Issue
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Open Tasks" value={openTasks.length} icon={Wrench} color="amber" />
          <StatCard title="Critical" value={criticalTasks.length} icon={AlertTriangle} color="rose" />
          <StatCard
            title="Est. Repair Costs"
            value={`P ${estimatedCosts.toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`}
            icon={Wrench}
            color="blue"
          />
          <StatCard
            title="Completed This Month"
            value={DEMO_TASKS.filter(t => t.status === "completed").length}
            icon={CheckCircle2}
            color="green"
          />
        </div>

        {/* Critical alerts */}
        {criticalTasks.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-sm font-semibold text-red-800">
                {criticalTasks.length} critical maintenance issue{criticalTasks.length > 1 ? "s" : ""} require immediate attention
              </p>
            </div>
            {criticalTasks.map(task => (
              <p key={task.id} className="text-xs text-red-700 ml-6">
                • <strong>{task.property}</strong>: {task.title}
              </p>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search tasks or property..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C] w-64"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {["all", "open", "in_progress", "completed", "deferred"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === s ? "bg-[#6B4226] text-white" : "bg-white border border-stone-300 text-stone-600 hover:bg-stone-50"
                }`}>
                {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
          >
            <option value="all">All Priorities</option>
            {(["critical", "high", "medium", "low"] as Priority[]).map(p => (
              <option key={p} value={p}>{priorityConfig[p].label}</option>
            ))}
          </select>
          <span className="ml-auto text-sm text-stone-500">{filtered.length} tasks</span>
        </div>

        {/* Task list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-stone-400 bg-white rounded-xl border border-stone-200">
              <Wrench className="h-8 w-8 mb-2" />
              <p className="text-sm">No maintenance tasks found</p>
              <Button size="sm" className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="h-3.5 w-3.5" /> Report first issue
              </Button>
            </div>
          ) : (
            filtered.map(task => {
              const priority = priorityConfig[task.priority]
              const status = statusConfig[task.status]
              const TypeIcon = typeIcon[task.type]

              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-xl border-l-4 border border-stone-200 p-4 hover:shadow-sm transition-shadow ${priority.color}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-9 w-9 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                      <TypeIcon className="h-4 w-4 text-stone-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-semibold text-stone-900">{task.title}</p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {task.property} · {task.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={priority.variant}>{priority.label}</Badge>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-stone-600 mt-2">{task.description}</p>
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-stone-400">
                        <span>Reported: {new Date(task.reported_date).toLocaleDateString("en-GB")}</span>
                        {task.due_date && (
                          <span className={`flex items-center gap-1 ${new Date(task.due_date) < new Date() && task.status !== "completed" ? "text-red-500 font-medium" : ""}`}>
                            <Clock className="h-3 w-3" />
                            Due: {new Date(task.due_date).toLocaleDateString("en-GB")}
                          </span>
                        )}
                        {task.assigned_to && <span>Assigned: {task.assigned_to}</span>}
                        {task.cost_estimate && <span>Est. cost: P {task.cost_estimate.toLocaleString()}</span>}
                        <span>By: {task.reported_by}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {task.status === "open" && (
                        <Button size="sm" variant="secondary">
                          Assign
                        </Button>
                      )}
                      {task.status !== "completed" && (
                        <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Report Issue modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-1">Report Maintenance Issue</h2>
            <p className="text-sm text-stone-500 mb-5">Describe the issue and we&apos;ll get it assigned to the right person.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Brief description of the issue" className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Type</label>
                  <select className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white">
                    {(["vehicle", "building", "electrical", "plumbing", "equipment", "other"] as MaintenanceType[]).map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Priority</label>
                  <select className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white">
                    {(["low", "medium", "high", "critical"] as Priority[]).map(p => (
                      <option key={p} value={p}>{priorityConfig[p].label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Property</label>
                  <select className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white">
                    <option>O Bona Moremi</option>
                    <option>Kiri Camp</option>
                    <option>Nkasa Plains Camp</option>
                    <option>All Properties</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Location</label>
                  <input type="text" placeholder="Room, area, vehicle..." className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Description</label>
                <textarea rows={3} placeholder="Detailed description of the issue..." className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Due Date (optional)</label>
                <input type="date" className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1" onClick={() => {
                setShowForm(false)
                alert("Issue reported! In production this saves to the database and notifies the maintenance team.")
              }}>
                Submit Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
