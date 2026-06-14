import type { Alert, SecurityEvent, Severity } from "./types"
import { SEVERITY_ORDER } from "./severity"

export function severityCounts(events: SecurityEvent[]): Record<Severity, number> {
  const base: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
  for (const e of events) base[e.severity]++
  return base
}

export function severityPieData(events: SecurityEvent[]) {
  const counts = severityCounts(events)
  return SEVERITY_ORDER.map((s) => ({ severity: s, value: counts[s] }))
}

export function topCategories(events: SecurityEvent[], limit = 5) {
  const map = new Map<string, number>()
  for (const e of events) map.set(e.category, (map.get(e.category) ?? 0) + 1)
  return [...map.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/** Buckets events into the last 24 hours (per-hour). */
export function eventsOverTime(events: SecurityEvent[]) {
  const now = Date.now()
  const hours = 24
  const buckets = Array.from({ length: hours }, (_, i) => {
    const hourStart = now - (hours - 1 - i) * 60 * 60 * 1000
    const d = new Date(hourStart)
    return {
      label: `${d.getHours().toString().padStart(2, "0")}:00`,
      ts: hourStart,
      total: 0,
      critical: 0,
      high: 0,
    }
  })
  for (const e of events) {
    const t = +new Date(e.timestamp)
    const idx = Math.floor((t - (now - hours * 60 * 60 * 1000)) / (60 * 60 * 1000))
    if (idx >= 0 && idx < hours) {
      buckets[idx].total++
      if (e.severity === "critical") buckets[idx].critical++
      if (e.severity === "high") buckets[idx].high++
    }
  }
  return buckets
}

export function dashboardSummary(events: SecurityEvent[], alerts: Alert[]) {
  const counts = severityCounts(events)
  const activeAlerts = alerts.filter((a) => a.status !== "resolved").length
  const criticalThreats = counts.critical
  return {
    totalEvents: events.length,
    activeAlerts,
    criticalThreats,
    systemStatus: criticalThreats > 0 || activeAlerts > 3 ? "At Risk" : "Operational",
  }
}
