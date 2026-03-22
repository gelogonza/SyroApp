"use client"

import type { ToastState } from "@/hooks/useToast"

interface ToastProps {
  toast: ToastState
}

export default function Toast({ toast }: ToastProps) {
  if (!toast.message) return null

  const isShortcut = toast.variant === "shortcut"

  return (
    <div
      className={`fixed left-1/2 z-50 pointer-events-none ${isShortcut ? "bottom-20" : "bottom-8"}`}
      style={{
        opacity: toast.visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${toast.visible ? "0" : "8px"})`,
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}
    >
      <div
        className={`rounded-full font-medium text-white shadow-lg backdrop-blur-xl ${
          isShortcut ? "px-3.5 py-1.5 text-xs" : "px-5 py-2.5 text-sm"
        }`}
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
