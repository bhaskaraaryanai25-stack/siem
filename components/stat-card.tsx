import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: {
  label: string
  value: string | number
  icon: LucideIcon
  hint?: string
  tone?: "default" | "critical" | "warning" | "good"
}) {
  const toneClasses: Record<string, string> = {
    default: "text-primary bg-primary/15",
    critical: "text-critical bg-critical/15",
    warning: "text-medium bg-medium/15",
    good: "text-low bg-low/15",
  }
  return (
    <Card className="flex flex-row items-center gap-4 p-5">
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", toneClasses[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold tracking-tight">{value}</p>
        {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
    </Card>
  )
}
