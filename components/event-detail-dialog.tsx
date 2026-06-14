"use client"

import { SeverityBadge } from "@/components/severity-badge"
import { AiAnalysisPanel } from "@/components/ai-analysis-panel"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDateTime } from "@/lib/format"
import type { SecurityEvent } from "@/lib/types"

export function EventDetailDialog({
  event,
  onOpenChange,
}: {
  event: SecurityEvent | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={!!event} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {event && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={event.severity} />
                <span className="text-xs text-muted-foreground">{event.category}</span>
              </div>
              <DialogTitle className="text-pretty text-base leading-snug">{event.message}</DialogTitle>
            </DialogHeader>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Field label="Event ID" value={event.id} mono />
              <Field label="Timestamp" value={formatDateTime(event.timestamp)} />
              <Field label="Source" value={event.source} mono />
              <Field label="Source IP" value={event.sourceIp} mono />
              <Field label="User" value={event.user} mono />
              <Field label="Category" value={event.category} />
            </dl>

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Raw log</p>
              <pre className="overflow-x-auto rounded-md bg-muted/60 p-3 font-mono text-xs text-muted-foreground">
                {event.raw}
              </pre>
            </div>

            <AiAnalysisPanel
              payload={{
                kind: "event",
                severity: event.severity,
                category: event.category,
                message: event.message,
                source: event.source,
                sourceIp: event.sourceIp,
              }}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono text-sm" : "text-sm"}>{value}</dd>
    </div>
  )
}
