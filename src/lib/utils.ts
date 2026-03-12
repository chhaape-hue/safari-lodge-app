import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "BWP") {
  return new Intl.NumberFormat("en-BW", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date))
}

export function formatDateRange(from: string | Date, to: string | Date) {
  return `${formatDate(from)} – ${formatDate(to)}`
}

export function getDaysBetween(from: Date, to: Date): number {
  const diff = to.getTime() - from.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
