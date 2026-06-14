import type { AiAnalysis } from "./types"

export interface AnalyzeInput {
  kind: "event" | "alert"
  severity: string
  category?: string
  type?: string
  message: string
  source?: string
  sourceIp?: string
}

const GEMINI_MODEL = "gemini-1.5-flash"

/**
 * Analyze a security event/alert with Google Gemini.
 * Falls back to a deterministic mock response when GEMINI_API_KEY is not set
 * or the API call fails, so the app stays fully functional in any environment.
 */
export async function analyzeThreat(input: AnalyzeInput): Promise<AiAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return mockAnalysis(input)
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [{ role: "user", parts: [{ text: buildUserPrompt(input) }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json",
          },
        }),
      },
    )

    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`)

    const data = await res.json()
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error("Empty Gemini response")

    const parsed = JSON.parse(text) as Partial<AiAnalysis>
    return {
      summary: parsed.summary ?? "No summary returned.",
      explanation: parsed.explanation ?? "No explanation returned.",
      remediation: Array.isArray(parsed.remediation) ? parsed.remediation : [],
      confidence: clampConfidence(parsed.confidence),
      mocked: false,
    }
  } catch (err) {
    console.log("[v0] Gemini analysis failed, using mock fallback:", err instanceof Error ? err.message : err)
    return mockAnalysis(input)
  }
}

const SYSTEM_PROMPT = `You are a senior SOC (Security Operations Center) analyst.
Analyze the provided security event or alert and respond with a JSON object using exactly these keys:
- "summary": one concise sentence describing the threat.
- "explanation": 2-3 sentences explaining why this is suspicious and the potential impact.
- "remediation": an array of 3-4 short, actionable remediation steps.
- "confidence": an integer 0-100 indicating how confident you are that this is a genuine threat.
Respond with JSON only.`

function buildUserPrompt(input: AnalyzeInput): string {
  return [
    `Type: ${input.kind}`,
    input.type ? `Alert type: ${input.type}` : "",
    `Severity: ${input.severity}`,
    input.category ? `Category: ${input.category}` : "",
    input.source ? `Source host: ${input.source}` : "",
    input.sourceIp ? `Source IP: ${input.sourceIp}` : "",
    `Details: ${input.message}`,
  ]
    .filter(Boolean)
    .join("\n")
}

function clampConfidence(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v)
  if (Number.isNaN(n)) return 50
  return Math.max(0, Math.min(100, Math.round(n)))
}

/* ---------------- Mock fallback ---------------- */

const BASE_CONFIDENCE: Record<string, number> = {
  critical: 92,
  high: 80,
  medium: 64,
  low: 42,
  info: 22,
}

const REMEDIATION_LIBRARY: Record<string, string[]> = {
  Authentication: [
    "Force a password reset for the affected account(s).",
    "Enable or verify multi-factor authentication.",
    "Temporarily block the source IP at the perimeter firewall.",
    "Review authentication logs for lateral movement.",
  ],
  "Access Control": [
    "Revoke the elevated privileges that were granted.",
    "Audit recent changes to privileged groups.",
    "Rotate credentials for the affected service account.",
    "Enable alerting on sudoers / admin group changes.",
  ],
  Malware: [
    "Isolate the affected host from the network immediately.",
    "Capture a forensic memory and disk image.",
    "Block the C2 destination at egress.",
    "Run an EDR scan across similar hosts.",
  ],
  "Data Exfiltration": [
    "Throttle or block the outbound transfer at the egress gateway.",
    "Identify the data set and classification involved.",
    "Preserve network flow logs for investigation.",
    "Notify the incident response lead.",
  ],
  Network: [
    "Add the offending source IP to the blocklist.",
    "Verify firewall rules are enforcing least privilege.",
    "Inspect adjacent hosts for follow-on activity.",
    "Tune IDS signatures for this pattern.",
  ],
  Reconnaissance: [
    "Block the scanning source at the perimeter.",
    "Confirm no probed services are exposed unintentionally.",
    "Increase logging on targeted hosts.",
    "Add the IP to threat-intel watchlists.",
  ],
  System: [
    "Verify the change was expected and authorized.",
    "Review system and service logs around the event.",
    "Confirm configuration matches the approved baseline.",
    "Document the finding and close if benign.",
  ],
}

const DEFAULT_REMEDIATION = [
  "Investigate the source and scope of the activity.",
  "Correlate with related events from the same source.",
  "Apply containment if the behavior is confirmed malicious.",
  "Document findings in the incident record.",
]

function mockAnalysis(input: AnalyzeInput): AiAnalysis {
  const key = input.category ?? input.type ?? "System"
  const remediation = REMEDIATION_LIBRARY[key] ?? DEFAULT_REMEDIATION
  const base = BASE_CONFIDENCE[input.severity] ?? 50
  // Small deterministic variation based on message length so it feels dynamic.
  const variation = (input.message.length % 7) - 3
  const confidence = clampConfidence(base + variation)

  const descriptor =
    input.severity === "critical" || input.severity === "high"
      ? "strongly indicative of malicious activity"
      : input.severity === "medium"
        ? "anomalous and worth investigating"
        : "low-risk but logged for completeness"

  return {
    summary: `${capitalize(input.severity)}-severity ${input.type ?? input.category ?? "event"} ${
      input.sourceIp ? `from ${input.sourceIp} ` : ""
    }that is ${descriptor}.`,
    explanation: `This ${input.kind} was classified as ${input.severity} severity. ${input.message} Patterns like this are commonly associated with ${
      key.toLowerCase()
    } threats and can escalate if left unaddressed, so timely triage is recommended.`,
    remediation,
    confidence,
    mocked: true,
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
