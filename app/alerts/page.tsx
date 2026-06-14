"use client"

import { useMemo, useState } from "react"
import { useSiem } from "@/components/siem-provider"
import { PageHeader } from "@/components/page-header"
import { SeverityBadge } from "@/components/severity-badge"
import { IncidentDialog } from "@/components/incident-dialog"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { compareSeverity } from "@/lib/severity"
import { relativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Alert, AlertStatus } from "@/lib/types"

const STATUS_STYLES: Record<string, string> = {
  open: "bg-critical/15 text-critical",
  investigating: "bg-medium/15 text-medium",
  resolved: "bg-low/15 text-low",
}

type Filter = "all" | AlertStatus

export default function AlertsPage() {
  const { alerts } = useSiem()
  const [filter, setFilter] = useState<Filter>("all")
  const [selected, setSelected] = useState<Alert | null>(null)

  const counts = useMemo(() => {
    return {
      all: alerts.length,
      open: alerts.filter((a) => a.status === "open").length,
      investigating: alerts.filter((a) => a.status === "investigating").length,
      resolved: alerts.filter((a) => a.status === "resolved").length,
    }
  }, [alerts])

  const filtered = useMemo(() => {
    const list = filter === "all" ? alerts : alerts.filter((a) => a.status === filter)
    return [...list].sort(
      (a, b) => compareSeverity(a.severity, b.severity) || +new Date(b.triggeredAt) - +new Date(a.triggeredAt),
    )
  }, [alerts, filter])

  // Keep the open dialog in sync with the latest alert state.
  const selectedLive = selected ? alerts.find((a) => a.id === selected.id) ?? null : null

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Alerts & Incidents"
        description="Triage generated alerts, review details, and track investigations to resolution."
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="open">Open ({counts.open})</TabsTrigger>
          <TabsTrigger value="investigating">Investigating ({counts.investigating})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({counts.resolved})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {filtered.map((a) => (
          <Card
            key={a.id}
            onClick={() => setSelected(a)}
            className="cursor-pointer p-4 transition-colors hover:border-primary/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <SeverityBadge severity={a.severity} />
                <span className="text-xs text-muted-foreground">{a.type}</span>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  STATUS_STYLES[a.status],
                )}
              >
                {a.status}
              </span>
            </div>
            <h3 className="mt-2 text-pretty font-medium leading-snug">{a.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.description}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-mono">{a.sourceIp}</span>
              <span>·</span>
              <span>{a.eventCount.toLocaleString()} events</span>
              <span>·</span>
              <span>{relativeTime(a.triggeredAt)}</span>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="p-10 text-center text-sm text-muted-foreground md:col-span-2">
            No alerts in this state.
          </Card>
        )}
      </div>

      <IncidentDialog alert={selectedLive} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  )
}
