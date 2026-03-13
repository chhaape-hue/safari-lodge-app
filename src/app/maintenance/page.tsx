"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/ui/stat-card"
import {
  Wrench, Plus, Search, AlertTriangle, CheckCircle2,
  Clock, Car, Building, Zap, Droplets, Loader2
} from "lucide-react"
import { useStore } from "@/lib/supabase-store"
import type { MaintenancePriority, MaintenanceStatus, MaintenanceCategory, MaintenanceTask } from "@/lib/supabase-store"

const priorityConfig: Record<MaintenancePriority, { label: string; variant: "danger" | "warning" | "info" | "neutral" | "success"; color: string }> = {
  critical: { label: "Critical", variant: "danger",  color: "border-l-red-500" },
  high:     { label: "High",     variant: "warning", color: "border-l-orange-500" },
  medium:   { label: "Medium",   variant: "info",    color: "border-l-blue-500" },
  low:      { label: "Low",      variant: "neutral", color: "border-l-stone-300" },
}

const statusConfig: Record<MaintenanceStatus, { label: string; variant: "danger" | "warning" | "success" | "info" | "neutral" }> = {
  open:        { label: "Open",        variant: "warning" },
  in_progress: { label: "In Progress", variant: "info" },
  completed:   { label: "Completed",   variant: "success" },
  deferred:    { label: "Deferred",    variant: "neutral" },
}

const typeIcon: Record<MaintenanceCategory, React.ElementType> = {
  vehicle:    Car,
  building:   Building,
  electrical: Zap,
  plumbing:   Droplets,
  equipment:  Wrench,
  other:      Wrench,
}

type FormData = {
  title: string
  description: string
  category: MaintenanceCategory
  priority: MaintenancePriority
  status: MaintenanceStatus
  property_id: string
  location: string
  reported_by: string
  assigned_to: string
  due_date: string
  estimated_cost: string
  notes: string
}

const emptyForm = (): FormData => ({
  title: "",
  description: "",
  category: "other",
  priority: "medium",
  status: "open",
  property_id: "",
  location: "",
  reported_by: "",
  assigned_to: "",
  due_date: "",
  estimated_cost: "",
  notes: "",
})

export default function MaintenancePage() {
  const { maintenanceTasks, properties, loading, error, addMaintenanceTask, updateMaintenanceTask, deleteMaintenanceTask } = useStore()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState<MaintenanceTask | null>(null)
  const [formData, setFormData] = useState<FormData>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  const filtered = maintenanceTasks.filter(task => {
    const property = properties.find(p => p.id === task.property_id)
    const matchesSearch = !search
      || task.title.toLowerCase().includes(search.toLowerCase())
      || property?.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const openTasks = maintenanceTasks.filter(t => t.status === "open" || t.status === "in_progress")
  const criticalTasks = maintenanceTasks.filter(t => t.priority === "critical" && t.status !== "completed")
  const estimatedCosts = openTasks.reduce((s, t) => s + (t.estimated_cost || 0), 0)
  const completedThisMonth = maintenanceTasks.filter(t => {
    if (t.status !== "completed" || !t.completed_at) return false
    const d = new Date(t.completed_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  function openAdd() {
    setEditTask(null)
    setFormData(emptyForm())
    setSaveError("")
    setShowForm(true)
  }

  function openEdit(task: MaintenanceTask) {
    setEditTask(task)
    setFormData({
      title: task.title,
      description: task.description || "",
      category: task.category,
      priority: task.priority,
      status: task.status,
      property_id: task.property_id || "",
      location: task.location || "",
      reported_by: task.reported_by || "",
      assigned_to: task.assigned_to || "",
      due_date: task.due_date || "",
      estimated_cost: task.estimated_cost != null ? String(task.estimated_cost) : "",
      notes: task.notes || "",
    })
    setSaveError("")
    setShowForm(true)
  }

  async function handleMarkComplete(task: MaintenanceTask) {
    try {
      await updateMaintenanceTask(task.id, { status: "completed", completed_at: new Date().toISOString() })
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to update task.")
    }
  }

  async function handleSave() {
    if (!formData.title.trim()) { setSaveError("Title is required."); return }
    setSaving(true)
    setSaveError("")
    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        property_id: formData.property_id || undefined,
        location: formData.location || undefined,
        reported_by: formData.reported_by || undefined,
        assigned_to: formData.assigned_to || undefined,
        due_date: formData.due_date || undefined,
        estimated_cost: formData.estimated_cost ? Number(formData.estimated_cost) : undefined,
        notes: formData.notes || undefined,
        completed_at: formData.status === "completed" && editTask?.completed_at
          ? editTask.completed_at
          : formData.status === "completed" ? new Date().toISOString() : undefined,
      }
      if (editTask) {
        await updateMaintenanceTask(editTask.id, payload)
      } else {
        await addMaintenanceTask(payload)
      }
      setShowForm(false)
    } catch (err: unknown) {
      setSaveError((err as Error).message || "Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this maintenance task?")) return
    try {
      await deleteMaintenanceTask(id)
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to delete.")
    }
  }

  if (loading) {
    return (
      <div>
        <Topbar title="Maintenance" subtitle="Track repairs, checks, and maintenance tasks" />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Topbar title="Maintenance" subtitle="Track repairs, checks, and maintenance tasks" />
        <div className="p-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Topbar
        title="Maintenance"
        subtitle="Track repairs, checks, and maintenance tasks"
        actions={
          <Button size="sm" onClick={openAdd}>
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
          <StatCard title="Completed This Month" value={completedThisMonth} icon={CheckCircle2} color="green" />
        </div>

        {/* Critical alerts */}
        {criticalTasks.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-sm font-semibold text-red-800">
                {criticalTasks.length} critical issue{criticalTasks.length > 1 ? "s" : ""} require immediate attention
              </p>
            </div>
            {criticalTasks.map(task => {
              const property = properties.find(p => p.id === task.property_id)
              return (
                <p key={task.id} className="text-xs text-red-700 ml-6">
                  • <strong>{property?.name || "All"}</strong>: {task.title}
                </p>
              )
            })}
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
            {(["all", "open", "in_progress", "completed", "deferred"] as const).map(s => (
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
            {(["critical", "high", "medium", "low"] as MaintenancePriority[]).map(p => (
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
              <p className="text-sm">
                {maintenanceTasks.length === 0 ? "No maintenance tasks yet." : "No tasks match your filters."}
              </p>
              <Button size="sm" className="mt-4" onClick={openAdd}>
                <Plus className="h-3.5 w-3.5" /> Report first issue
              </Button>
            </div>
          ) : (
            filtered.map(task => {
              const priority = priorityConfig[task.priority]
              const status = statusConfig[task.status]
              const TypeIcon = typeIcon[task.category]
              const property = properties.find(p => p.id === task.property_id)

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
                            {property?.name || "All Properties"}{task.location ? ` · ${task.location}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={priority.variant}>{priority.label}</Badge>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                      </div>
                      {task.description && <p className="text-sm text-stone-600 mt-2">{task.description}</p>}
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-stone-400">
                        <span>Reported: {new Date(task.created_at).toLocaleDateString("en-GB")}</span>
                        {task.due_date && (
                          <span className={`flex items-center gap-1 ${new Date(task.due_date) < new Date() && task.status !== "completed" ? "text-red-500 font-medium" : ""}`}>
                            <Clock className="h-3 w-3" />
                            Due: {new Date(task.due_date).toLocaleDateString("en-GB")}
                          </span>
                        )}
                        {task.assigned_to && <span>Assigned: {task.assigned_to}</span>}
                        {task.estimated_cost != null && <span>Est. cost: P {task.estimated_cost.toLocaleString()}</span>}
                        {task.reported_by && <span>By: {task.reported_by}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {task.status !== "completed" && (
                        <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50" onClick={() => handleMarkComplete(task)}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => openEdit(task)}>Edit</Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(task.id)}>Del</Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Report / Edit Issue modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-stone-900 mb-1">
              {editTask ? "Edit Maintenance Task" : "Report Maintenance Issue"}
            </h2>
            <p className="text-sm text-stone-500 mb-5">
              {editTask ? "Update the task details below." : "Describe the issue and assign it to the right person."}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="Brief description of the issue"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(p => ({ ...p, category: e.target.value as MaintenanceCategory }))}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
                  >
                    {(["vehicle", "building", "electrical", "plumbing", "equipment", "other"] as MaintenanceCategory[]).map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData(p => ({ ...p, priority: e.target.value as MaintenancePriority }))}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
                  >
                    {(["low", "medium", "high", "critical"] as MaintenancePriority[]).map(p => (
                      <option key={p} value={p}>{priorityConfig[p].label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(p => ({ ...p, status: e.target.value as MaintenanceStatus }))}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
                  >
                    {(["open", "in_progress", "completed", "deferred"] as MaintenanceStatus[]).map(s => (
                      <option key={s} value={s}>{statusConfig[s].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Property</label>
                  <select
                    value={formData.property_id}
                    onChange={e => setFormData(p => ({ ...p, property_id: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
                  >
                    <option value="">All Properties</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                    placeholder="Room, area, vehicle…"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={e => setFormData(p => ({ ...p, due_date: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Reported By</label>
                  <input
                    type="text"
                    value={formData.reported_by}
                    onChange={e => setFormData(p => ({ ...p, reported_by: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={formData.assigned_to}
                    onChange={e => setFormData(p => ({ ...p, assigned_to: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Estimated Cost (BWP)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.estimated_cost}
                  onChange={e => setFormData(p => ({ ...p, estimated_cost: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Detailed description of the issue…"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] resize-none"
                />
              </div>
            </div>

            {saveError && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{saveError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</> : (editTask ? "Update Task" : "Submit Report")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
