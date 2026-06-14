import { NextResponse } from "next/server"
import { analyzeThreat, type AnalyzeInput } from "@/lib/gemini"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<AnalyzeInput>

    if (!body?.message || !body?.severity || !body?.kind) {
      return NextResponse.json({ error: "Missing required fields: kind, severity, message." }, { status: 400 })
    }

    const analysis = await analyzeThreat({
      kind: body.kind,
      severity: body.severity,
      category: body.category,
      type: body.type,
      message: body.message,
      source: body.source,
      sourceIp: body.sourceIp,
    })

    return NextResponse.json(analysis)
  } catch (err) {
    console.log("[v0] /api/analyze error:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Failed to analyze threat." }, { status: 500 })
  }
}
