export type Severity = "critical" | "high" | "medium" | "low" | "info"

export type EventCategory =
  | "Authentication"
  | "Network"
  | "Malware"
  | "Access Control"
  | "Data Exfiltration"
  | "Reconnaissance"
  | "System"

export interface SecurityEvent {
  id: string
  timestamp: string // ISO string
  severity: Severity
  category: EventCategory
  source: string // hostname / service
  sourceIp: string
  user: string
  message: string
  raw: string
}

export type AlertStatus = "open" | "investigating" | "resolved"

export type AlertType =
  | "Multiple Failed Logins"
  | "Unusual Activity Spike"
  | "Unauthorized Access Attempt"
  | "Suspicious IP Behavior"

export interface InvestigationNote {
  id: string
  author: string
  timestamp: string
  text: string
}

export interface Alert {
  id: string
  type: AlertType
  severity: Severity
  status: AlertStatus
  title: string
  description: string
  sourceIp: string
  triggeredAt: string
  eventCount: number
  relatedEventIds: string[]
  notes: InvestigationNote[]
}

export interface AiAnalysis {
  summary: string
  explanation: string
  remediation: string[]
  confidence: number // 0-100
  mocked: boolean
}
