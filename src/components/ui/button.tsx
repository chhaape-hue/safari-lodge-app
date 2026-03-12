import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
}

const variantClasses = {
  primary: "bg-[#6B4226] text-white hover:bg-[#5A3520] shadow-sm",
  secondary: "bg-white text-stone-700 border border-stone-300 hover:bg-[#FAF7F2] shadow-sm",
  ghost: "text-stone-600 hover:bg-[#F5E6D0]/60",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
}

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
}

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
