"use client"

import { useState } from "react"
import { CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AiAnalysis } from "@/lib/types"

interface AnalyzePayload {
  kind: "event" | "alert"
  severity: string
  category?: string
  type?: string
  message: string
  source?: string
  sourceIp?: string
}

export function AiAnalysisPanel({ payload }: { payload: AnalyzePayload }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AiAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Analysis request failed")
      const data: AiAnalysis = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-primary/25 bg-primary/5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Security Analysis
        </div>
        {result?.mocked && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            Simulated
          </span>
        )}
      </div>

      {!result && !loading && (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground">
            Generate an explanation, threat summary, remediation steps, and a confidence score for this item.
          </p>
          <button
            onClick={run}
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" /> Analyze with Gemini
          </button>
        </div>
      )}

      {loading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Analyzing threat context…
        </div>
      )}

      {error && <p className="mt-3 text-sm text-critical">{error}</p>}

      {result && !loading && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <ConfidenceMeter value={result.confidence} />
          </div>

          <Section title="Summary">
            <p className="text-sm leading-relaxed text-foreground/90">{result.summary}</p>
          </Section>

          <Section title="Explanation">
            <p className="text-sm leading-relaxed text-muted-foreground">{result.explanation}</p>
          </Section>

          <Section title="Recommended remediation">
            <ul className="space-y-1.5">
              {result.remediation.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-low" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Section>

          <button
            onClick={run}
            className="text-xs text-primary hover:underline"
          >
            Re-run analysis
          </button>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      {children}
    </div>
  )
}

function ConfidenceMeter({ value }: { value: number }) {
  const tone = value >= 80 ? "bg-critical" : value >= 60 ? "bg-high" : value >= 40 ? "bg-medium" : "bg-low"
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Confidence</span>
        <span className="font-semibold tabular-nums">{value}%</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
