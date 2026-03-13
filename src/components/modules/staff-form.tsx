"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { Department, EmploymentType, StaffStatus } from "@/types"

interface Props { onClose: () => void }

const departments: { value: Department; label: string }[] = [
  { value: "management", label: "Management" },
  { value: "reception", label: "Reception" },
  { value: "guides", label: "Guides" },
  { value: "kitchen", label: "Kitchen" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "maintenance", label: "Maintenance & Technical" },
  { value: "logistics", label: "Logistics" },
  { value: "security", label: "Security" },
]

const employmentTypes: { value: EmploymentType; label: string }[] = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "seasonal", label: "Seasonal" },
  { value: "contractor", label: "Contractor" },
]

export function StaffForm({ onClose }: Props) {
  const { properties, addStaff } = useStore()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saveError, setSaveError] = useState("")

  const [propertyId, setPropertyId] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [department, setDepartment] = useState<Department>("reception")
  const [position, setPosition] = useState("")
  const [employmentType, setEmploymentType] = useState<EmploymentType>("full_time")
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState("")
  const [salary, setSalary] = useState("")
  const [currency, setCurrency] = useState("BWP")
  const [idNumber, setIdNumber] = useState("")
  const [notes, setNotes] = useState("")

  const inputCls = (err?: string) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4226] transition-colors ${
      err ? "border-red-400 bg-red-50" : "border-stone-300 bg-white"
    }`
  const labelCls = "block text-sm font-medium text-stone-700 mb-1"

  function validate() {
    const e: Record<string, string> = {}
    if (!firstName.trim()) e.firstName = "First name is required"
    if (!lastName.trim()) e.lastName = "Last name is required"
    if (!position.trim()) e.position = "Position is required"
    if (!salary || isNaN(parseFloat(salary))) e.salary = "Valid salary is required"
    if (!startDate) e.startDate = "Start date is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaveError("")
    setSaving(true)
    try {
      await addStaff({
        property_id: propertyId || undefined,
        first_name: firstName,
        last_name: lastName,
        email: email || undefined,
        phone: phone || undefined,
        department,
        position,
        employment_type: employmentType,
        status: "active",
        start_date: startDate,
        end_date: endDate || undefined,
        salary: parseFloat(salary),
        currency,
        id_number: idNumber || undefined,
        notes: notes || undefined,
      })
      onClose()
    } catch (err: unknown) {
      setSaveError((err as Error).message || "Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#FAF7F2] rounded-t-2xl">
          <h2 className="text-lg font-bold text-stone-900">Add Staff Member</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-200 transition-colors">
            <X className="h-4 w-4 text-stone-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>First Name *</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder="Thabo" className={inputCls(errors.firstName)} />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className={labelCls}>Last Name *</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder="Kgosi" className={inputCls(errors.lastName)} />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com" className={inputCls()} />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+267 ..." className={inputCls()} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Department *</label>
              <select value={department} onChange={e => setDepartment(e.target.value as Department)} className={inputCls()}>
                {departments.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Position *</label>
              <input type="text" value={position} onChange={e => setPosition(e.target.value)}
                placeholder="e.g. Lodge Manager" className={inputCls(errors.position)} />
              {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Property</label>
              <select value={propertyId} onChange={e => setPropertyId(e.target.value)} className={inputCls()}>
                <option value="">All Properties</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Employment Type</label>
              <select value={employmentType} onChange={e => setEmploymentType(e.target.value as EmploymentType)} className={inputCls()}>
                {employmentTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Start Date *</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className={inputCls(errors.startDate)} />
            </div>
            {(employmentType === "seasonal" || employmentType === "contractor") && (
              <div>
                <label className={labelCls}>End Date (optional)</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls()} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Monthly Salary *</label>
              <input type="number" value={salary} onChange={e => setSalary(e.target.value)}
                placeholder="0.00" className={inputCls(errors.salary)} />
              {errors.salary && <p className="text-xs text-red-500 mt-1">{errors.salary}</p>}
            </div>
            <div>
              <label className={labelCls}>Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputCls()}>
                <option>BWP</option><option>NAD</option><option>ZAR</option><option>USD</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>ID / Passport Number</label>
            <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)}
              placeholder="ID or passport number" className={inputCls()} />
          </div>

          <div>
            <label className={labelCls}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              rows={2} placeholder="Optional internal notes..."
              className={`${inputCls()} resize-none`} />
          </div>
        </div>

        {saveError && (
          <div className="px-6 pb-2">
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{saveError}</p>
          </div>
        )}
        <div className="flex justify-between px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Staff Member ✓"}
          </Button>
        </div>
      </div>
    </div>
  )
}
