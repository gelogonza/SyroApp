"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { SpotifyDevice } from "@/types/spotify"

interface DeviceSelectorProps {
  currentDevice: SpotifyDevice | null
  onTransfer: (deviceId: string) => void
}

function DeviceIcon({ type }: { type: string }) {
  switch (type.toLowerCase()) {
    case "smartphone":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
        </svg>
      )
    case "speaker":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 1.99 2 1.99L17 22c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 16c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
        </svg>
      )
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z" />
        </svg>
      )
  }
}

export default function DeviceSelector({
  currentDevice,
  onTransfer,
}: DeviceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [devices, setDevices] = useState<SpotifyDevice[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch("/api/spotify/devices")
      if (res.ok) {
        const data = await res.json()
        setDevices(data?.devices ?? [])
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleToggle() {
    if (!isOpen) fetchDevices()
    setIsOpen(!isOpen)
  }

  function handleSelect(deviceId: string) {
    onTransfer(deviceId)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 text-white/60 hover:text-white/90 transition-colors"
        aria-label="Select device"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z" />
        </svg>
        {currentDevice && (
          <span className="text-xs hidden md:inline">{currentDevice.name}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 w-56 bg-neutral-900/95 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-2xl z-50">
          <div className="px-3 py-2 border-b border-white/10">
            <span className="text-xs font-medium text-white/70">
              Available Devices
            </span>
          </div>
          {devices.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-white/40">
              No devices found
            </div>
          ) : (
            devices.map((device) => (
              <button
                key={device.id}
                onClick={() => handleSelect(device.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors text-left ${
                  device.is_active ? "text-green-400" : "text-white/70"
                }`}
              >
                <DeviceIcon type={device.type} />
                <div className="min-w-0">
                  <div className="text-sm truncate">{device.name}</div>
                  <div className="text-[10px] opacity-50">{device.type}</div>
                </div>
                {device.is_active && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-green-400 shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
