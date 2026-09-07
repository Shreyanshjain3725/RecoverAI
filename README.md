# RecoverAI ⚡

> *"Find revenue slipping away. Let an AI agent win it back."*

Hey there! Welcome to **RecoverAI**—an autonomous revenue-recovery system built for the **AI Revenue Recovery** track. If you've ever looked at a business's checkout funnel and cringed at the amount of money lost to abandoned carts and payment failures, this project is for you.

Instead of sending generic "Hey, you forgot this in your cart" emails, RecoverAI acts as a smart, autonomous agent. It detects revenue at risk, figures out *why* the payment failed, checks the situation against strict safety policies, and then takes action (like sending a personalized Razorpay Test Mode payment link) to win that revenue back. 

It does all of this while leaving behind an air-tight audit trail. 

---

## 🎥 See it in Action

Want to skip the reading? Check out the project live or watch a quick 5-minute pitch video:

- **🎬 5-Minute Pitch Video:** [Watch on Google Drive](https://drive.google.com/file/d/1KELX1xkPPegCYWU5reoWnN5ycUIqxhre/view?usp=sharing)
- **🚀 Live Deployment:** [Try the Dashboard here!](https://recover-by-ai-zeta.vercel.app/dashboard)

---

## 🏗 How does the AI actually work?

We designed RecoverAI to follow a simple, bounded 6-stage workflow:

```text
  DETECT ──► DIAGNOSE ──► DECIDE ──► ACT ──► VERIFY ──► AUDIT
```

1. **DETECT**: The system constantly watches for checkout abandonments or failed transactions.
2. **DIAGNOSE**: It acts like a detective, building a profile of the customer's history and passing it to our LLM for a structured diagnosis.
3. **DECIDE**: It evaluates the AI's recommendations against our **Deterministic Policy Engine** (because you shouldn't just let AI play with money unchecked).
4. **ACT**: It executes secure, bounded actions (like creating a Razorpay Test Mode link).
5. **VERIFY**: It monitors webhook settlements to confirm we actually got the money back.
6. **AUDIT**: Every single step is cryptographically logged with an exact timestamp. We tag everything to show if a `HUMAN`, the `AI`, the `SYSTEM`, or the `POLICY` engine made a specific call.

---

## 🛡 The Deterministic Policy Engine (Our Guardrails)

We believe AI should empower finance teams, not go rogue. Here are some of the strict safety rules hardcoded into RecoverAI:

- **The 3-Strike Rule**: We never attempt to automatically recover a payment more than 3 times. If we hit the limit, it gets punted to a human.
- **Velocity Checks**: Suspicious transaction patterns? Automatic retries are blocked immediately.
- **High-Value Thresholds**: Any order over ₹10,000 (configurable) requires explicit human approval before the AI can act.
- **Action Whitelist**: The AI can *only* choose from a strict list of allowed actions (`RETRY`, `CREATE_PAYMENT_LINK`, `SEND_RECOVERY_MESSAGE`, `ALTERNATIVE_METHOD`, `ESCALATE`, `NO_ACTION`).
- **Idempotency**: Strict checks ensure we never accidentally double-charge or spam a customer with duplicate links.

---

## 🌟 What's Inside?

If you jump into the app, here are the main screens you'll want to check out:

- 📊 **The Dark Fintech Dashboard (`/dashboard`)**: Get a bird's-eye view of your Revenue at Risk, Recovered Revenue, and interactive charts showing what's converting.
- ⚡ **Agent Live Run Console (`/agent`)**: A super cool, terminal-style console where you can watch the agent diagnose and process live transactions step-by-step.
- 🔍 **Transaction Timeline (`/cases/[id]`)**: A deep dive into a specific case. This is where we answer the question: *"Why did the AI choose to do this?"* complete with a recovery score and timeline.
- 📜 **Audit Trail Log (`/audit`)**: A filterable, compliance-ready log of everything the system has ever done.
- 🚨 **Human Escalation Queue (`/escalations`)**: The workspace for human reviewers to see high-risk cases and execute one-click manual overrides.
- 🧪 **Zero-Config Demo Simulator**: Want to test it without digging out your Razorpay API keys? Just click "Simulate Failed Batch" and watch the magic happen.

---

## 🚀 Setting it up locally

Want to run the codebase on your own machine? It's super easy.

First, copy the `.env.example` file to create your `.env` file:

```env
DATABASE_URL="file:./dev.db"
HIGH_VALUE_THRESHOLD="10000"
MAX_RECOVERY_ATTEMPTS="3"

# Optional: Drop in Razorpay keys for live testing (Without them, the Demo Simulator kicks in!)
RAZORPAY_KEY_ID="rzp_test_xxxx"
RAZORPAY_KEY_SECRET="xxxx"
RAZORPAY_WEBHOOK_SECRET="xxxx"

# Optional: Add an OpenAI compatible API key for the LLM
OPENAI_API_KEY="sk-xxxx"
OPENAI_MODEL="gpt-4o-mini"
```

Then, set up the project:

```bash
# 1. Clone repo & open the directory
cd RecoverAI

# 2. Install dependencies
npm install

# 3. Setup SQLite database schema & seed the demo cases
npx prisma db push
npx prisma db seed

# 4. Start the dev server!
npm run dev
```

Finally, open [http://localhost:3000](http://localhost:3000) inside your browser. Enjoy!
