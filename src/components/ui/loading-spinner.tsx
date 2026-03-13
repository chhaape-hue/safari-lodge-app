"use client"

/**
 * Untouched Safaris – Loading Spinner
 * Uses the golden O-with-birds logo as the animated loading indicator.
 */

interface LoadingSpinnerProps {
  message?: string
  size?: "sm" | "md" | "lg"
  fullScreen?: boolean
}

export function LoadingSpinner({ message, size = "md", fullScreen = false }: LoadingSpinnerProps) {
  const sizes = {
    sm: { outer: 40, inner: 32, text: "text-xs" },
    md: { outer: 64, inner: 52, text: "text-sm" },
    lg: { outer: 96, inner: 80, text: "text-base" },
  }
  const s = sizes[size]

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      {/* Animated golden O with birds */}
      <div className="relative" style={{ width: s.outer, height: s.outer }}>
        {/* Spinning ring */}
        <svg
          width={s.outer}
          height={s.outer}
          viewBox="0 0 64 64"
          className="animate-spin"
          style={{ animationDuration: "2s" }}
        >
          <circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke="#C9A84C"
            strokeWidth="3"
            strokeDasharray="88 176"
            strokeLinecap="round"
            opacity="0.3"
          />
          <circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke="#C9A84C"
            strokeWidth="3"
            strokeDasharray="44 220"
            strokeLinecap="round"
          />
        </svg>

        {/* Center: Golden O + birds (static) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width={s.inner} height={s.inner} viewBox="0 0 52 52" fill="none">
            {/* O circle */}
            <circle
              cx="26" cy="30" r="10"
              fill="none"
              stroke="#C9A84C"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Bird 1 (larger, higher) */}
            <path
              d="M17 10 C19 8, 21 9, 22 11 C23 9, 25 8, 27 10"
              stroke="#C9A84C"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Bird 2 (smaller, lower) */}
            <path
              d="M22 16 C23.5 14.5, 25 15, 26 16.5 C27 15, 28.5 14.5, 30 16"
              stroke="#C9A84C"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div className="text-center">
          <p className={`${s.text} text-stone-500 font-medium`}>{message}</p>
          <div className="flex gap-1 justify-center mt-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1 h-1 rounded-full bg-[#C9A84C] animate-bounce"
                style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAF7F0] to-[#F5ECD8] flex items-center justify-center">
        <div className="text-center space-y-4">
          {/* Logo text above spinner for full-screen */}
          <div className="mb-6">
            <p className="text-2xl font-light tracking-[0.3em] text-[#2C5F2E] uppercase">Untouched</p>
            <p className="text-sm tracking-[0.5em] text-[#C9A84C] uppercase font-medium mt-0.5">Safaris</p>
          </div>
          {spinner}
        </div>
      </div>
    )
  }

  return spinner
}

/**
 * Inline loading state for buttons and small areas
 */
export function LoadingDots({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 items-center ${className}`}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1 h-1 rounded-full bg-current animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
        />
      ))}
    </span>
  )
}

/**
 * Page-level loading state with descriptive message
 */
export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-64 py-16">
      <LoadingSpinner message={message} size="md" />
    </div>
  )
}
