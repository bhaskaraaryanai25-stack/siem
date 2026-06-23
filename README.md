# 🛡️ Sentinel SIEM MVP — Security Information & Event Management

Sentinel SIEM is a lightweight, responsive Security Information and Event Management (SIEM) dashboard. It is built as a modern React/Next.js application, optimized for rapid deployment on Vercel. 

This application provides real-time event monitoring, threat classification, incident resolution logs, and an AI-driven security analysis layer powered by the **Google Gemini API**.

---

## 🚀 Live Demo & Deployment
* **Production URL:** [https://siem-five.vercel.app/](https://siem-five.vercel.app/)
* **Dashboard Overview:** [siem-five.vercel.app](https://siem-five.vercel.app/)
* **Event Monitor (Logs):** [siem-five.vercel.app/events](https://siem-five.vercel.app/events)
* **Alerts & Incidents:** [siem-five.vercel.app/alerts](https://siem-five.vercel.app/alerts)
* **Analytics Breakdowns:** [siem-five.vercel.app/analytics](https://siem-five.vercel.app/analytics)

---

## ✨ Core Features

1. **Cybersecurity Executive Dashboard**
   * High-level triage metric cards: *Total Events*, *Active Alerts*, *Critical Threats*, and *System Status* (switches to **At Risk** if active critical threats exist).
   * Interactive **Events Over Time** line chart to track log volume spikes.
   * **Threat Severity** ratio pie charts and top threat category breakdowns.
   * Quick-access feed highlighting priority warnings and recent active alerts.

2. **Real-time Log & Telemetry Monitor**
   * Tabular list of security events displaying timestamps, severity badges, host sources, categories, and targeted users.
   * Global text search index with filters for event severity and categories.
   * In-session background telemetry simulator: appends mock logs every **10 seconds** to simulate a live active SOC.

3. **Incident Triage & Investigation Panel**
   * Tracks alerts and security incidents from `Open` ➡️ `Investigating` ➡️ `Resolved`.
   * Add custom investigation notes and log analyst actions dynamically.
   * Polls the server backend every **5 seconds** to synchronize alert states across devices.

4. **AI-Powered Security Analyst (Google Gemini)**
   * Integrates `gemini-1.5-flash` model to analyze threat profiles.
   * Explains threat vectors, calculates risk confidence percentages, and recommends concrete, step-by-step remediation plans.
   * **Smart Zero-Config Fallback:** If no API key is supplied, a simulated AI panel generates realistic analytical reports locally, making the app 100% functional out-of-the-box.

5. **REST API Ingestion Webhook**
   * Receive live log feeds from external servers, routers, firewalls, or local scripts.
   * Endpoint `POST /api/events` ingests event logs and automatically raises security alerts for incoming `high` or `critical` severity profiles.

---

## 📁 Repository Structure

```text
security-siem-mvp/
├── app/
│   ├── layout.tsx            # Global layout shell with Next.js App Router context
│   ├── page.tsx              # Dashboard home page showing charts, priority events & alerts
│   ├── globals.css           # Styling theme variables, dark mode & Tailwind config
│   ├── alerts/               # Alerts overview & incident tracking UI
│   ├── analytics/            # Recharts analytics breakdowns & volume trends
│   ├── events/               # Event table logs viewer with query filters
│   └── api/
│       ├── analyze/          # POST endpoint invoking Google Gemini threat analysis
│       ├── events/           # GET/POST endpoints for log ingestion and db sync
│       └── alerts/           # POST endpoint to update alert status & notes
├── components/
│   ├── ui/                   # Modular shadcn/ui components (badge, card, table, dialog, etc.)
│   ├── app-shell.tsx         # Sidebar/mobile navigation drawer & live ingestion heartbeat
│   ├── siem-provider.tsx     # React context managing live telemetry updates & database polling
│   ├── charts.tsx            # Responsive Recharts visualizations
│   ├── ai-analysis-panel.tsx # Panel coordinating Gemini API calls & reports
│   └── incident-dialog.tsx   # Modal handling alert triage & incident notes
├── lib/
│   ├── db.ts                 # Database persistence controller (Local JSON file vs Vercel KV Redis)
│   ├── gemini.ts             # Google Gemini API connector with fallback generator
│   ├── mock-data.ts          # Templates & tools generating realistic mock telemetry
│   ├── stats.ts              # Mathematical helpers summarizing security health
│   └── types.ts              # TypeScript interfaces defining events, alerts, and notes
├── .env.example              # Template for environment variables (GEMINI_API_KEY)
└── vercel_deployment_guide.md# Walkthrough document detailing Vercel configuration
```

---

## 🛠️ Local Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.x or later recommended)
* `npm`, `yarn`, or `pnpm`

### Installation Steps

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/bhaskaraaryanai25-stack/siem.git
   cd siem
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root folder:
   ```bash
   cp .env.example .env.local
   ```
   Add your Google AI Studio API key (optional):
   ```env
   GEMINI_API_KEY=AIzaSyYourActualKeyFromGoogleAIStudio
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💾 Database Persistence Details

Sentinel SIEM utilizes a dual-engine database controller (`lib/db.ts`):
* **Local Development:** Telemetry is written directly to a local JSON database (`data-store.json`) at the project root.
* **Production Deployment:** Connects to **Vercel KV (Upstash Redis)** serverless database via REST. When deployed, Vercel automatically reads the variables `KV_REST_API_URL` and `KV_REST_API_TOKEN` to persist incident logs, notes, and events globally.

---

## 🔌 Integrating Real Telemetry (REST Webhook)

You can stream live security logs into your deployed SIEM application from any server, command-line terminal, or daemon script.

### Endpoint Address:
`POST https://<your-vercel-domain>.vercel.app/api/events`

### Ingestion Schema (JSON):
```json
{
  "severity": "critical" | "high" | "medium" | "low" | "informational",
  "category": "Malware" | "Access" | "Network" | "System" | "Phishing",
  "source": "string (e.g. host-name)",
  "sourceIp": "string (e.g. IP address)",
  "user": "string (username/account)",
  "message": "string (log text payload)"
}
```

### Feeding Data via Windows PowerShell:
Copy and paste this native block directly into your PowerShell terminal:

```powershell
$body = @{
    severity = "critical"
    category = "Malware"
    source = "prod-web-server"
    sourceIp = "192.168.1.50"
    user = "root"
    message = "Backdoor Trojan signature (Trojan.Linux.Backdoor) detected in /usr/bin/cron"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://siem-five.vercel.app/api/events" -Method Post -Body $body -ContentType "application/json"
```

### Feeding Data via bash/curl:
```bash
curl -X POST https://siem-five.vercel.app/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "critical",
    "category": "Malware",
    "source": "prod-web-server",
    "sourceIp": "192.168.1.50",
    "user": "root",
    "message": "Backdoor Trojan signature detected in cron config"
  }'
```

---

## 🎨 Design System
The UI is styled using **Tailwind CSS** following modern design principles:
* **Glassmorphism:** Elegant, semi-transparent navigation sidebars and headers.
* **Curated Palette:** Dynamic dark mode theme based on clean slate HSL tokens (`#0f172a`, `#1e293b`).
* **Vibrant Indicators:** Status pills styled with HSL border gradients, glowing indicator heartbeats, and alert rings corresponding to risk level values.
