import type { Alert, EventCategory, SecurityEvent, Severity } from "./types"

const SOURCES = [
  "auth-gateway-01",
  "vpn-edge-02",
  "web-app-prod",
  "api-gateway",
  "db-primary",
  "firewall-edge",
  "k8s-node-07",
  "mail-relay",
]

const USERS = ["a.chen", "root", "svc_backup", "j.diaz", "admin", "m.okafor", "guest", "k.novak"]

const CATEGORIES: EventCategory[] = [
  "Authentication",
  "Network",
  "Malware",
  "Access Control",
  "Data Exfiltration",
  "Reconnaissance",
  "System",
]

interface Template {
  severity: Severity
  category: EventCategory
  message: (ip: string, user: string) => string
}

const TEMPLATES: Template[] = [
  {
    severity: "critical",
    category: "Malware",
    message: (ip) => `Ransomware signature detected in process tree, beaconing to ${ip}`,
  },
  {
    severity: "critical",
    category: "Data Exfiltration",
    message: (ip) => `Large outbound transfer (2.4 GB) to untrusted host ${ip}`,
  },
  {
    severity: "high",
    category: "Authentication",
    message: (ip, user) => `5 consecutive failed SSH logins for "${user}" from ${ip}`,
  },
  {
    severity: "high",
    category: "Access Control",
    message: (_ip, user) => `Privilege escalation: "${user}" added to sudoers group`,
  },
  {
    severity: "high",
    category: "Network",
    message: (ip) => `Port scan detected: 1,024 ports probed from ${ip}`,
  },
  {
    severity: "medium",
    category: "Authentication",
    message: (ip, user) => `Login for "${user}" from new geo-location, IP ${ip}`,
  },
  {
    severity: "medium",
    category: "Reconnaissance",
    message: (ip) => `DNS enumeration attempts observed from ${ip}`,
  },
  {
    severity: "medium",
    category: "System",
    message: () => `Unexpected service restart on critical host`,
  },
  {
    severity: "low",
    category: "Network",
    message: (ip) => `Blocked inbound connection on closed port from ${ip}`,
  },
  {
    severity: "low",
    category: "Authentication",
    message: (_ip, user) => `Password changed for account "${user}"`,
  },
  {
    severity: "info",
    category: "System",
    message: () => `Scheduled vulnerability scan completed successfully`,
  },
  {
    severity: "info",
    category: "Access Control",
    message: (_ip, user) => `User "${user}" session opened`,
  },
]

function randomIp(suspicious = false) {
  if (suspicious) {
    const pool = ["185.220.101.4", "45.155.205.233", "193.142.146.35", "5.188.206.18", "91.219.236.166"]
    return pool[Math.floor(Math.random() * pool.length)]
  }
  return `10.0.${Math.floor(Math.random() * 4)}.${Math.floor(Math.random() * 254) + 1}`
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Deterministic-ish seeded generation so the dataset is stable per load.
export function generateEvents(count = 140): SecurityEvent[] {
  const events: SecurityEvent[] = []
  const now = Date.now()
  for (let i = 0; i < count; i++) {
    const tpl = pick(TEMPLATES)
    const suspicious = tpl.severity === "critical" || tpl.severity === "high"
    const ip = suspicious && Math.random() > 0.4 ? randomIp(true) : randomIp()
    const user = pick(USERS)
    const source = pick(SOURCES)
    // Spread events across the last 24 hours
    const ts = new Date(now - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    const message = tpl.message(ip, user)
    events.push({
      id: `evt-${(i + 1).toString().padStart(4, "0")}`,
      timestamp: ts,
      severity: tpl.severity,
      category: tpl.category,
      source,
      sourceIp: ip,
      user,
      message,
      raw: `${ts} ${source} ${tpl.category.toLowerCase()}: ${message} src_ip=${ip} user=${user}`,
    })
  }
  return events.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
}

export const MOCK_EVENTS: SecurityEvent[] = generateEvents()

export const MOCK_ALERTS: Alert[] = [
  {
    id: "alr-0001",
    type: "Multiple Failed Logins",
    severity: "high",
    status: "open",
    title: "Brute-force attempt on auth-gateway-01",
    description:
      "47 failed authentication attempts for multiple accounts within 3 minutes, originating from a single external host.",
    sourceIp: "185.220.101.4",
    triggeredAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    eventCount: 47,
    relatedEventIds: MOCK_EVENTS.filter((e) => e.category === "Authentication").slice(0, 4).map((e) => e.id),
    notes: [],
  },
  {
    id: "alr-0002",
    type: "Suspicious IP Behavior",
    severity: "critical",
    status: "investigating",
    title: "Known Tor exit node beaconing from db-primary",
    description:
      "Outbound traffic from the primary database host to a flagged Tor exit node, consistent with C2 beaconing.",
    sourceIp: "45.155.205.233",
    triggeredAt: new Date(Date.now() - 52 * 60 * 1000).toISOString(),
    eventCount: 12,
    relatedEventIds: MOCK_EVENTS.filter((e) => e.severity === "critical").slice(0, 3).map((e) => e.id),
    notes: [
      {
        id: "note-1",
        author: "SOC Analyst",
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        text: "Isolated db-primary from production VLAN pending forensic capture.",
      },
    ],
  },
  {
    id: "alr-0003",
    type: "Unauthorized Access Attempt",
    severity: "high",
    status: "open",
    title: "Privilege escalation on k8s-node-07",
    description: "Service account attempted to mount the host filesystem and add itself to the sudoers group.",
    sourceIp: "10.0.2.51",
    triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    eventCount: 6,
    relatedEventIds: MOCK_EVENTS.filter((e) => e.category === "Access Control").slice(0, 3).map((e) => e.id),
    notes: [],
  },
  {
    id: "alr-0004",
    type: "Unusual Activity Spike",
    severity: "medium",
    status: "open",
    title: "API request volume 8x baseline",
    description: "api-gateway is seeing an 800% increase in requests to the /export endpoint over a 10 minute window.",
    sourceIp: "193.142.146.35",
    triggeredAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    eventCount: 1840,
    relatedEventIds: MOCK_EVENTS.filter((e) => e.category === "Network").slice(0, 3).map((e) => e.id),
    notes: [],
  },
  {
    id: "alr-0005",
    type: "Suspicious IP Behavior",
    severity: "medium",
    status: "resolved",
    title: "Port scan from external host",
    description: "Sequential port scan across the perimeter firewall. Blocked automatically by edge ruleset.",
    sourceIp: "91.219.236.166",
    triggeredAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    eventCount: 1024,
    relatedEventIds: MOCK_EVENTS.filter((e) => e.category === "Reconnaissance").slice(0, 2).map((e) => e.id),
    notes: [
      {
        id: "note-2",
        author: "Auto-Responder",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        text: "Source IP added to perimeter blocklist. No internal hosts responded.",
      },
    ],
  },
  {
    id: "alr-0006",
    type: "Multiple Failed Logins",
    severity: "low",
    status: "resolved",
    title: "Repeated lockout for svc_backup",
    description: "Backup service account locked out due to an expired credential in a scheduled job.",
    sourceIp: "10.0.1.20",
    triggeredAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    eventCount: 9,
    relatedEventIds: [],
    notes: [],
  },
]

export { CATEGORIES }
