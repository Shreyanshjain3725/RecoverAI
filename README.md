# RecoverAI ⚡

> *"Find revenue slipping away. Let an AI agent win it back."*

RecoverAI is a production-quality, autonomous revenue-recovery system engineered for payment failures and checkout abandonment. Designed for the **AI Revenue Recovery** track, RecoverAI systematically detects revenue at risk, diagnoses root causes, evaluates policy compliance, executes targeted recovery actions (such as Razorpay Test Mode payment links), verifies payment outcomes, and maintains an immutable audit trail.

---

## 🏗 System Architecture

RecoverAI implements a bounded 6-stage agentic workflow:

```
  DETECT ──► DIAGNOSE ──► DECIDE ──► ACT ──► VERIFY ──► AUDIT
```

1. **DETECT**: Continuously identifies failed transactions & checkout abandonments.
2. **DIAGNOSE**: Builds rich customer history & transaction context, then triggers LLM reasoning to produce structured JSON diagnosis.
3. **DECIDE**: Evaluates AI recommendations against a **Deterministic Policy Engine** (safety thresholds, retry ceilings, velocity fraud checks).
4. **ACT**: Executes bounded recovery operations (Razorpay Test Mode payment links, backoff retries, recovery notifications).
5. **VERIFY**: Monitors webhook settlements and confirms recovered revenue.
6. **AUDIT**: Cryptographically logs every event with exact timestamps and actor tags (`SYSTEM`, `AI`, `POLICY`, `RAZORPAY`, `HUMAN`).

---

## 🛡 Deterministic Safety Policy Rules

AI agents must not have unrestricted control over money-related actions. RecoverAI enforces strict safety rules:

- **Rule 1 & 2**: Maximum 3 automated recovery attempts. Attempt count $\ge 3$ triggers mandatory human escalation.
- **Rule 3**: Suspicious velocity or repeated failure patterns block automatic retry.
- **Rule 4**: Any order amount $> ₹10,000$ (configurable ceiling) requires human approval.
- **Rule 5**: Only actions in the deterministic allowed list (`RETRY`, `CREATE_PAYMENT_LINK`, `SEND_RECOVERY_MESSAGE`, `ALTERNATIVE_METHOD`, `ESCALATE`, `NO_ACTION`) can be executed.
- **Rule 6**: Every action triggers an immutable audit log.
- **Rule 7**: Idempotency checks prevent duplicate link creation or double retries.
- **Rule 8**: API failures trigger a single retry before gracefully escalating to human review queues.

---

## 🌟 Core Features

- 📊 **Dark Fintech Dashboard (`/dashboard`)**: Financial metrics (Revenue at Risk, Recovered Revenue, Recovery Rate, Active & Escalated Cases), time-series charts, and interactive case tables.
- ⚡ **Agent Live Run Console (`/agent`)**: Interactive terminal-style console displaying live transaction step-by-step processing.
- 🔍 **Transaction Timeline (`/cases/[id]`)**: Deep-dive case view showing the visual event timeline, recovery score breakdown, expected recoverable revenue, and decision card (*"Why did RecoverAI choose this?"*).
- 📜 **Audit Trail Log (`/audit`)**: Filterable compliance log across all system actors.
- 🚨 **Human Escalation Queue (`/escalations`)**: Review queue for policy-bounded high-value or high-risk cases with one-click human approval/rejection overrides.
- 🧪 **Zero-Config Demo Simulator**: Instant demo execution out-of-the-box without requiring live API keys.

---

## 🚀 Environment Variables

Copy `.env.example` to `.env`:

```env
DATABASE_URL="file:./dev.db"
HIGH_VALUE_THRESHOLD="10000"
MAX_RECOVERY_ATTEMPTS="3"

# Optional Razorpay credentials (if omitted, Demo Simulator is automatically activated)
RAZORPAY_KEY_ID="rzp_test_xxxx"
RAZORPAY_KEY_SECRET="xxxx"
RAZORPAY_WEBHOOK_SECRET="xxxx"

# Optional OpenAI compatible LLM API (if omitted, Intelligent Fallback Parser is activated)
OPENAI_API_KEY="sk-xxxx"
OPENAI_MODEL="gpt-4o-mini"
```

---

## 📦 Quick Start & Local Setup

```bash
# 1. Clone repo & navigate into directory
cd ReclaimIQ

# 2. Install dependencies
npm install

# 3. Setup SQLite database schema & seed demo scenarios
npx prisma db push
npx prisma db seed

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 2-Minute Judge Demo Walkthrough

1. **Launch App**: Notice the **`DEMO MODE`** badge in the header indicating zero-config simulator readiness.
2. **Review Metrics**: On `/dashboard`, view the initial Revenue at Risk ($₹18,750$).
3. **Simulate Batch**: Click **"Simulate Failed Batch"** to load 10 realistic payment recovery cases.
4. **Execute Recovery Agent**: Click **"Run Recovery Agent"**. Navigate to `/agent` to watch the live step-by-step progress as cases are diagnosed, policy-checked, and executed.
5. **Inspect Case Detail**: Click on a recovered case (e.g. `RC-2026-1001`) to inspect the *"Why did RecoverAI choose this?"* decision card, recovery score ($87/100$), and visual timeline.
6. **Inspect Human Escalations**: Navigate to `/escalations` to see cases bounded by Policy Rule 4 ($> ₹10,000$ high value) or Policy Rule 2 (exceeded retry limits). Click **"Approve"** to execute human override recovery.
7. **Inspect Audit Trail**: Navigate to `/audit` to verify the complete compliance log.
