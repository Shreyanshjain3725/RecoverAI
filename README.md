<div align="center">

# ⚡ RecoverAI
**"Find revenue slipping away. Let an AI agent win it back."**

[![Live Demo](https://img.shields.io/badge/Live_Demo-00E5FF?style=for-the-badge&logo=vercel&logoColor=black)](https://recover-by-ai-zeta.vercel.app/dashboard)
[![Video Pitch](https://img.shields.io/badge/Video_Pitch-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://drive.google.com/file/d/1KELX1xkPPegCYWU5reoWnN5ycUIqxhre/view?usp=sharing)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

*An autonomous revenue-recovery system built for the AI Revenue Recovery track.*  
*Instead of just sending generic abandoned cart emails, RecoverAI uses an LLM to actively diagnose failed payments, checks strict safety policies, and autonomously takes action to secure your revenue.*

</div>

<br/>

## 🎥 See it in Action
Want to skip the reading and see the platform work? 
- 🚀 **[Try the Live Interactive Dashboard](https://recover-by-ai-zeta.vercel.app/dashboard)**
- 🎬 **[Watch Our 5-Minute Pitch Video](https://drive.google.com/file/d/1KELX1xkPPegCYWU5reoWnN5ycUIqxhre/view?usp=sharing)**

---

## 🏗️ How does the AI actually work?

RecoverAI doesn't just guess; it acts on a strictly bounded 6-stage workflow to ensure safety and precision.

| Stage | What Happens? |
|-------|--------------|
| **1. DETECT** | The system constantly watches for checkout abandonments or failed transactions in real-time. |
| **2. DIAGNOSE** | It acts like a detective, building a rich customer profile and using our LLM for a structured root-cause diagnosis. |
| **3. DECIDE** | It runs the AI's recommendations against our **Deterministic Policy Engine** (because AI shouldn't handle money unchecked). |
| **4. ACT** | It securely executes allowed actions, like generating a Razorpay Test Mode link to recover the sale. |
| **5. VERIFY** | It monitors webhook settlements to cryptographically confirm we actually got the money back. |
| **6. AUDIT** | Every single action is stamped onto an immutable audit log, tagging the actor (`HUMAN`, `AI`, or `POLICY`). |

---

## 🛡️ The Deterministic Policy Engine
We believe AI should empower finance teams, not go rogue. We've hardcoded these non-negotiable guardrails directly into the system:

- 🛑 **The 3-Strike Rule:** We never attempt to automatically recover a payment more than 3 times. If we hit the limit, the case is immediately punted to a human.
- ⚡ **Velocity Checks:** Suspicious transaction patterns? Automatic retries are locked completely.
- 💰 **High-Value Thresholds:** Any order over ₹10,000 (configurable) requires explicit, 1-click human approval before the AI can execute a recovery.
- ✅ **Action Whitelist:** The AI is strictly bounded to an allowed list of safe actions (`RETRY`, `CREATE_PAYMENT_LINK`, `SEND_RECOVERY_MESSAGE`, `ESCALATE`).

---

## 🌟 Exploring The Application
If you jump into the live app, here are the core screens you'll interact with:

- 📊 **Dark Fintech Dashboard (`/dashboard`):** A beautiful, bird's-eye view of your Revenue at Risk vs. Recovered Revenue, powered by real-time Recharts.
- 🤖 **Agent Live Run Console (`/agent`):** A sleek terminal console where you can literally watch the AI "think" and process live cases step-by-step.
- 🔍 **Transaction Timeline (`/cases/[id]`):** A forensic deep-dive into exactly *why* the AI chose a specific action, complete with an AI Recovery Score.
- 🚨 **Human Escalation Queue (`/escalations`):** The dashboard for your finance team to review high-risk AI plans and trigger manual overrides.
- 📜 **Audit Trail Log (`/audit`):** An enterprise-ready compliance log showing every system footprint.
- 🧪 **Zero-Config Demo Simulator:** No API key? No problem. The app comes pre-loaded with a demo generator—just click "Simulate Failed Batch" on the dashboard!

---

## 💻 Local Setup & Quick Start
Want to run the codebase on your own machine? It's incredibly straightforward:

**1. Create your `.env` file** (copy from `.env.example`):
```env
DATABASE_URL="file:./dev.db"
HIGH_VALUE_THRESHOLD="10000"
MAX_RECOVERY_ATTEMPTS="3"
```
*(Optional: Provide Razorpay / OpenAI keys for live usage. Without them, the Demo Simulator is automatically activated!)*

**2. Install and Run:**
```bash
# Clone repo & open the directory
cd RecoverAI

# Install everything
npm install

# Setup SQLite database schema & seed the demo cases
npx prisma db push
npx prisma db seed

# Start the dev server!
npm run dev
```

Browse to [http://localhost:3000](http://localhost:3000) and watch RecoverAI win back your revenue.
