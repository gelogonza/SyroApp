"use client"

import type { ToastState } from "@/hooks/useToast"

interface ToastProps {
  toast: ToastState
}

export default function Toast({ toast }: ToastProps) {
  if (!toast.message) return null

  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      style={{
        opacity: toast.visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${toast.visible ? "0" : "8px"})`,
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}
    >
      <div
        className="px-5 py-2.5 rounded-full text-sm font-medium text-white shadow-lg backdrop-blur-xl"
        style={{
          background:
            toast.variant === "error"
              ? "rgba(220, 38, 38, 0.8)"
              : "rgba(0, 0, 0, 0.75)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {toast.message}
      </div>
    </div>
  )
}
