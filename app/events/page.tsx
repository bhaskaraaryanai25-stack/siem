"use client"

import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { useSiem } from "@/components/siem-provider"
import { PageHeader } from "@/components/page-header"
import { SeverityBadge } from "@/components/severity-badge"
import { EventDetailDialog } from "@/components/event-detail-dialog"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CATEGORIES } from "@/lib/mock-data"
import { SEVERITY_ORDER } from "@/lib/severity"
import { formatDateTime } from "@/lib/format"
import type { SecurityEvent } from "@/lib/types"

export default function EventsPage() {
  const { events } = useSiem()
  const [query, setQuery] = useState("")
  const [severity, setSeverity] = useState<string>("all")
  const [category, setCategory] = useState<string>("all")
  const [selected, setSelected] = useState<SecurityEvent | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events.filter((e) => {
      if (severity !== "all" && e.severity !== severity) return false
      if (category !== "all" && e.category !== category) return false
      if (!q) return true
      return (
        e.message.toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q) ||
        e.sourceIp.includes(q) ||
        e.user.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
      )
    })
  }, [events, query, severity, category])

  const hasFilters = query || severity !== "all" || category !== "all"

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Event Monitor"
        description="Search, filter, and inspect normalized security events from all collectors."
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search message, IP, user, source, or ID…"
              className="pl-9"
            />
          </div>
          <Select value={severity} onValueChange={(v) => setSeverity(v ?? "all")}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              {SEVERITY_ORDER.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={(v) => setCategory(v ?? "all")}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <button
              onClick={() => {
                setQuery("")
                setSeverity("all")
                setCategory("all")
              }}
              className="flex items-center justify-center gap-1 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" /> Clear
            </button>
          )}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filtered.length}</span> of {events.length} events
        </p>
      </Card>

      <Card className="mt-4 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-40">Timestamp</TableHead>
                <TableHead className="w-28">Severity</TableHead>
                <TableHead className="w-36">Category</TableHead>
                <TableHead>Event</TableHead>
                <TableHead className="hidden w-40 md:table-cell">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 80).map((e) => (
                <TableRow
                  key={e.id}
                  onClick={() => setSelected(e)}
                  className="cursor-pointer"
                >
                  <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                    {formatDateTime(e.timestamp)}
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={e.severity} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.category}</TableCell>
                  <TableCell className="max-w-md truncate text-sm">{e.message}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="font-mono text-xs text-muted-foreground">{e.source}</span>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No events match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {filtered.length > 80 && (
          <p className="border-t border-border px-4 py-3 text-center text-xs text-muted-foreground">
            Showing first 80 results. Refine your filters to narrow the list.
          </p>
        )}
      </Card>

      <EventDetailDialog event={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  )
}
