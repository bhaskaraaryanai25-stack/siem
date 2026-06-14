"use client"

import { useState } from "react"
import { CheckCircle2, Clock, Send } from "lucide-react"
import { useSiem } from "@/components/siem-provider"
import { SeverityBadge } from "@/components/severity-badge"
import { AiAnalysisPanel } from "@/components/ai-analysis-panel"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { formatDateTime, relativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Alert } from "@/lib/types"

const STATUS_STYLES: Record<string, string> = {
  open: "bg-critical/15 text-critical",
  investigating: "bg-medium/15 text-medium",
  resolved: "bg-low/15 text-low",
}

export function IncidentDialog({
  alert,
  onOpenChange,
}: {
  alert: Alert | null
  onOpenChange: (open: boolean) => void
}) {
  const { setAlertStatus, addNote } = useSiem()
  const [note, setNote] = useState("")

  function submitNote() {
    if (!alert || !note.trim()) return
    addNote(alert.id, note.trim())
    setNote("")
  }

  return (
    <Dialog open={!!alert} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {alert && (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge severity={alert.severity} />
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                    STATUS_STYLES[alert.status],
                  )}
                >
                  {alert.status}
                </span>
                <span className="text-xs text-muted-foreground">{alert.type}</span>
              </div>
              <DialogTitle className="text-pretty text-lg leading-snug">{alert.title}</DialogTitle>
            </DialogHeader>

            <p className="text-sm leading-relaxed text-muted-foreground">{alert.description}</p>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              <Field label="Alert ID" value={alert.id} mono />
              <Field label="Source IP" value={alert.sourceIp} mono />
              <Field label="Events" value={alert.eventCount.toLocaleString()} />
              <Field label="Triggered" value={formatDateTime(alert.triggeredAt)} />
              <Field label="Related events" value={String(alert.relatedEventIds.length)} />
            </dl>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAlertStatus(alert.id, "investigating")}
                disabled={alert.status === "investigating"}
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
              >
                <Clock className="h-4 w-4 text-medium" /> Mark investigating
              </button>
              <button
                onClick={() => setAlertStatus(alert.id, "resolved")}
                disabled={alert.status === "resolved"}
                className="inline-flex items-center gap-2 rounded-md bg-low/15 px-3 py-2 text-sm font-medium text-low transition-colors hover:bg-low/25 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" /> Mark resolved
              </button>
            </div>

            <AiAnalysisPanel
              payload={{
                kind: "alert",
                severity: alert.severity,
                type: alert.type,
                message: `${alert.title}. ${alert.description}`,
                sourceIp: alert.sourceIp,
              }}
            />

            <Separator />

            <div>
              <p className="mb-2 text-sm font-medium">Investigation Notes</p>
              <div className="space-y-2">
                {alert.notes.length === 0 && (
                  <p className="text-xs text-muted-foreground">No notes yet. Add the first investigation note below.</p>
                )}
                {alert.notes.map((n) => (
                  <div key={n.id} className="rounded-md border border-border/60 bg-muted/30 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{n.author}</span>
                      <span className="text-xs text-muted-foreground">{relativeTime(n.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{n.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add an investigation note…"
                  rows={2}
                  className="resize-none"
                />
                <button
                  onClick={submitNote}
                  disabled={!note.trim()}
                  className="inline-flex h-fit items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 sm:self-end"
                >
                  <Send className="h-4 w-4" /> Add
                </button>
              </div>
            </div>
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
