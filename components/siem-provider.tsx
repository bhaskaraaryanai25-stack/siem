"use client"

import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from "react"
import { MOCK_ALERTS, MOCK_EVENTS } from "@/lib/mock-data"
import type { Alert, AlertStatus, SecurityEvent } from "@/lib/types"

interface SiemContextValue {
  events: SecurityEvent[]
  alerts: Alert[]
  setAlertStatus: (id: string, status: AlertStatus) => void
  addNote: (id: string, text: string) => void
  getEventById: (id: string) => SecurityEvent | undefined
}

const SiemContext = createContext<SiemContextValue | null>(null)

export function SiemProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Events are static mock data; alerts are mutable session state.
  const [events] = useState<SecurityEvent[]>(MOCK_EVENTS)
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS)

  const setAlertStatus = useCallback((id: string, status: AlertStatus) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
  }, [])

  const addNote = useCallback((id: string, text: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              notes: [
                ...a.notes,
                {
                  id: `note-${Date.now()}`,
                  author: "You",
                  timestamp: new Date().toISOString(),
                  text,
                },
              ],
            }
          : a,
      ),
    )
  }, [])

  const eventMap = useMemo(() => new Map(events.map((e) => [e.id, e])), [events])
  const getEventById = useCallback((id: string) => eventMap.get(id), [eventMap])

  const value = useMemo(
    () => ({ events, alerts, setAlertStatus, addNote, getEventById }),
    [events, alerts, setAlertStatus, addNote, getEventById],
  )

  if (!mounted) {
    return <div className="min-h-screen bg-background" />
  }

  return <SiemContext.Provider value={value}>{children}</SiemContext.Provider>
}

export function useSiem() {
  const ctx = useContext(SiemContext)
  if (!ctx) throw new Error("useSiem must be used within a SiemProvider")
  return ctx
}
