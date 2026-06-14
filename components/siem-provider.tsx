"use client"

import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from "react"
import { MOCK_ALERTS, MOCK_EVENTS, generateSingleEvent, generateRandomAlert } from "@/lib/mock-data"
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

  // Events are dynamic mock data; alerts are mutable session state.
  const [events, setEvents] = useState<SecurityEvent[]>(MOCK_EVENTS)
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Real-time background simulator
  useEffect(() => {
    if (!mounted) return

    let tickCount = 0
    const interval = setInterval(() => {
      // 1. Generate a new security event
      const newEvent = generateSingleEvent(tickCount++)
      setEvents((prev) => [newEvent, ...prev])

      // 2. Periodically trigger a new alert (every 6 ticks / 60 seconds with a 50% chance)
      if (tickCount % 6 === 0 && Math.random() < 0.5) {
        setEvents((currentEvents) => {
          const related = currentEvents.slice(0, 3)
          const newAlert = generateRandomAlert(related)
          setAlerts((prevAlerts) => [newAlert, ...prevAlerts])
          return currentEvents
        })
      }
    }, 10000) // every 10 seconds

    return () => clearInterval(interval)
  }, [mounted])

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
