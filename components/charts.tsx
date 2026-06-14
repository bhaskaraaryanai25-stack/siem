"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { SEVERITY_META } from "@/lib/severity"
import type { SecurityEvent } from "@/lib/types"
import { eventsOverTime, severityPieData, topCategories } from "@/lib/stats"

export function SeverityPie({ events }: { events: SecurityEvent[] }) {
  const data = severityPieData(events).filter((d) => d.value > 0)
  const config: ChartConfig = Object.fromEntries(
    data.map((d) => [d.severity, { label: SEVERITY_META[d.severity].label, color: SEVERITY_META[d.severity].color }]),
  )

  return (
    <ChartContainer config={config} className="mx-auto aspect-square max-h-[260px]">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="severity" hideLabel />} />
        <Pie data={data} dataKey="value" nameKey="severity" innerRadius={58} outerRadius={92} paddingAngle={2} strokeWidth={2}>
          {data.map((d) => (
            <Cell key={d.severity} fill={SEVERITY_META[d.severity].color} stroke="var(--card)" />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}

export function EventsOverTimeChart({ events }: { events: SecurityEvent[] }) {
  const data = eventsOverTime(events)
  const config: ChartConfig = {
    total: { label: "All events", color: "var(--chart-1)" },
    critical: { label: "Critical", color: "var(--critical)" },
    high: { label: "High", color: "var(--high)" },
  }

  return (
    <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
      <AreaChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.5} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={3} fontSize={11} />
        <YAxis tickLine={false} axisLine={false} width={36} fontSize={11} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="total"
          type="monotone"
          stroke="var(--chart-1)"
          fill="url(#fillTotal)"
          strokeWidth={2}
        />
        <Area dataKey="critical" type="monotone" stroke="var(--critical)" fill="transparent" strokeWidth={1.5} />
        <Area dataKey="high" type="monotone" stroke="var(--high)" fill="transparent" strokeWidth={1.5} />
      </AreaChart>
    </ChartContainer>
  )
}

export function TopCategoriesChart({ events }: { events: SecurityEvent[] }) {
  const data = topCategories(events, 6)
  const config: ChartConfig = { count: { label: "Events", color: "var(--chart-1)" } }

  return (
    <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 12, right: 16 }}>
        <XAxis type="number" hide />
        <YAxis
          dataKey="category"
          type="category"
          tickLine={false}
          axisLine={false}
          width={110}
          fontSize={11}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="count" fill="var(--chart-1)" radius={[0, 4, 4, 0]} barSize={18} />
      </BarChart>
    </ChartContainer>
  )
}
