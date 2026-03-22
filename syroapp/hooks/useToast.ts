"use client"

import { useState, useCallback, useRef } from "react"

export type ToastVariant = "info" | "error"

export interface ToastState {
  message: string
  variant: ToastVariant
  visible: boolean
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    variant: "info",
    visible: false,
  })
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setToast({ message, variant, visible: true })
      timeoutRef.current = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }))
      }, 3000)
    },
    []
  )

  return { toast, showToast }
}
