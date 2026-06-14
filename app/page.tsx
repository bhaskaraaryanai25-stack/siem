"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Activity, AlertTriangle, ArrowRight, ShieldAlert, ShieldCheck } from "lucide-react"
import { useSiem } from "@/components/siem-provider"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { SeverityBadge } from "@/components/severity-badge"
import { EventsOverTimeChart, SeverityPie } from "@/components/charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { dashboardSummary } from "@/lib/stats"
import { relativeTime } from "@/lib/format"
import { compareSeverity, SEVERITY_META, SEVERITY_ORDER } from "@/lib/severity"

export default function DashboardPage() {
  const { events, alerts } = useSiem()
  const summary = useMemo(() => dashboardSummary(events, alerts), [events, alerts])

  const priorityEvents = useMemo(
    () =>
      [...events]
        .filter((e) => e.severity === "critical" || e.severity === "high")
        .sort((a, b) => compareSeverity(a.severity, b.severity) || +new Date(b.timestamp) - +new Date(a.timestamp))
        .slice(0, 6),
    [events],
  )

  const recentAlerts = useMemo(
    () => [...alerts].sort((a, b) => +new Date(b.triggeredAt) - +new Date(a.triggeredAt)).slice(0, 4),
    [alerts],
  )

  const sevCounts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const e of events) c[e.severity] = (c[e.severity] ?? 0) + 1
    return c
  }, [events])

  const operational = summary.systemStatus === "Operational"

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Security Overview"
        description="Real-time posture across monitored sources over the last 24 hours."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Events" value={summary.totalEvents.toLocaleString()} icon={Activity} hint="Last 24 hours" />
        <StatCard
          label="Active Alerts"
          value={summary.activeAlerts}
          icon={AlertTriangle}
          tone="warning"
          hint="Open + investigating"
        />
        <StatCard
          label="Critical Threats"
          value={summary.criticalThreats}
          icon={ShieldAlert}
          tone="critical"
          hint="Require immediate triage"
        />
        <StatCard
          label="System Status"
          value={summary.systemStatus}
          icon={operational ? ShieldCheck : ShieldAlert}
          tone={operational ? "good" : "critical"}
          hint="8 collectors online"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Events Over Time</CardTitle>
            <span className="text-xs text-muted-foreground">per hour</span>
          </CardHeader>
          <CardContent>
            <EventsOverTimeChart events={events} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Threat Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <SeverityPie events={events} />
            <div className="mt-2 grid grid-cols-2 gap-2">
              {SEVERITY_ORDER.map((s) => (
                <div key={s} className="flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-1.5 text-xs">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: SEVERITY_META[s].color }} />
                    {SEVERITY_META[s].label}
                  </span>
                  <span className="font-medium tabular-nums">{sevCounts[s] ?? 0}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Priority Events</CardTitle>
            <Link href="/events" className="flex items-center gap-1 text-xs text-primary hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {priorityEvents.map((e) => (
              <div key={e.id} className="flex items-start gap-3 rounded-md border border-border/60 p-3">
                <SeverityBadge severity={e.severity} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{e.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {e.source} · {e.sourceIp} · {relativeTime(e.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Alerts</CardTitle>
            <Link href="/alerts" className="flex items-center gap-1 text-xs text-primary hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentAlerts.map((a) => (
              <Link
                key={a.id}
                href="/alerts"
                className="flex items-start gap-3 rounded-md border border-border/60 p-3 transition-colors hover:bg-muted/40"
              >
                <SeverityBadge severity={a.severity} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.type} · {relativeTime(a.triggeredAt)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {a.status}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
