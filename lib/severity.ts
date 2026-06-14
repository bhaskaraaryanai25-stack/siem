import type { Severity } from "./types"

interface SeverityMeta {
  label: string
  /** Tailwind classes for badges/pills */
  badge: string
  /** Solid dot color class */
  dot: string
  /** Chart fill (CSS var) */
  color: string
  rank: number
}

export const SEVERITY_META: Record<Severity, SeverityMeta> = {
  critical: {
    label: "Critical",
    badge: "bg-critical/15 text-critical border-critical/30",
    dot: "bg-critical",
    color: "var(--critical)",
    rank: 5,
  },
  high: {
    label: "High",
    badge: "bg-high/15 text-high border-high/30",
    dot: "bg-high",
    color: "var(--high)",
    rank: 4,
  },
  medium: {
    label: "Medium",
    badge: "bg-medium/15 text-medium border-medium/30",
    dot: "bg-medium",
    color: "var(--medium)",
    rank: 3,
  },
  low: {
    label: "Low",
    badge: "bg-low/15 text-low border-low/30",
    dot: "bg-low",
    color: "var(--low)",
    rank: 2,
  },
  info: {
    label: "Info",
    badge: "bg-info/15 text-info-foreground border-info/30",
    dot: "bg-info",
    color: "var(--info)",
    rank: 1,
  },
}

export const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"]

export function compareSeverity(a: Severity, b: Severity) {
  return SEVERITY_META[b].rank - SEVERITY_META[a].rank
}
