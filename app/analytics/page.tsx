"use client"

import { useMemo } from "react"
import { useSiem } from "@/components/siem-provider"
import { PageHeader } from "@/components/page-header"
import { EventsOverTimeChart, SeverityPie, TopCategoriesChart } from "@/components/charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SEVERITY_META, SEVERITY_ORDER } from "@/lib/severity"
import { severityCounts, topCategories } from "@/lib/stats"

export default function AnalyticsPage() {
  const { events } = useSiem()

  const counts = useMemo(() => severityCounts(events), [events])
  const cats = useMemo(() => topCategories(events, 6), [events])
  const topSource = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of events) map.set(e.sourceIp, (map.get(e.sourceIp) ?? 0) + 1)
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [events])

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Analytics" description="Trends and breakdowns across the last 24 hours of telemetry." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Threat Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <SeverityPie events={events} />
            <div className="mt-2 space-y-1.5">
              {SEVERITY_ORDER.map((s) => (
                <div key={s} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: SEVERITY_META[s].color }} />
                    {SEVERITY_META[s].label}
                  </span>
                  <span className="font-medium tabular-nums">{counts[s]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Events Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <EventsOverTimeChart events={events} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Threat Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <TopCategoriesChart events={events} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Source IPs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topSource.map(([ip, count], i) => {
              const max = topSource[0][1]
              return (
                <div key={ip} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono text-muted-foreground">
                      <span className="mr-2 text-xs text-muted-foreground/60">#{i + 1}</span>
                      {ip}
                    </span>
                    <span className="font-medium tabular-nums">{count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cats.map((c) => (
          <Card key={c.category} className="p-4">
            <p className="text-2xl font-semibold tabular-nums">{c.count}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.category}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
