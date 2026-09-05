import OpenAI from "openai";

export interface LLMDiagnosisInput {
  caseId: string;
  customerName: string;
  customerSpent: number;
  customerOrders: number;
  trustScore: number;
  amount: number;
  paymentMethod: string;
  failureReason: string;
  failureCategory: string;
  retryCount: number;
  orderNumber: string;
}

export interface LLMDiagnosisOutput {
  diagnosis: string;
  riskLevel: "low" | "medium" | "high";
  recoverability: number;
  recommendedAction:
    | "RETRY"
    | "CREATE_PAYMENT_LINK"
    | "ALTERNATIVE_METHOD"
    | "SEND_RECOVERY_MESSAGE"
    | "ESCALATE"
    | "NO_ACTION";
  reason: string;
  confidence: number;
}

export async function generateAIDiagnosis(
  input: LLMDiagnosisInput
): Promise<LLMDiagnosisOutput> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.trim() !== "" && !apiKey.startsWith("sk-xxxx")) {
    try {
      const openai = new OpenAI({
        apiKey,
        baseURL: process.env.OPENAI_BASE_URL || undefined,
      });

      const systemPrompt = `You are RecoverAI's revenue recovery decision-support agent.
Your goal is to maximize legitimate revenue recovery while respecting business policy and customer trust.

Rules:
- Reason only from the provided transaction context.
- Never invent payment facts.
- Recommend ONLY allowed actions: ["RETRY", "CREATE_PAYMENT_LINK", "ALTERNATIVE_METHOD", "SEND_RECOVERY_MESSAGE", "ESCALATE", "NO_ACTION"].
- Identify uncertainty and risk.
- Avoid repeating failed actions without modification.
- Prefer low-friction, high-conversion recovery channels.
- Output MUST be strictly valid JSON according to this schema:
{
  "diagnosis": "concise description of failure root cause",
  "riskLevel": "low" | "medium" | "high",
  "recoverability": number between 0.0 and 1.0,
  "recommendedAction": "RETRY" | "CREATE_PAYMENT_LINK" | "ALTERNATIVE_METHOD" | "SEND_RECOVERY_MESSAGE" | "ESCALATE" | "NO_ACTION",
  "reason": "detailed explanation for why this action was chosen",
  "confidence": number between 0.0 and 1.0
}`;

      const userPrompt = JSON.stringify(input, null, 2);

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content) as LLMDiagnosisOutput;
        return parsed;
      }
    } catch (err) {
      console.warn("LLM API call failed, using intelligent heuristic fallback:", err);
    }
  }

  // Fallback intelligent reasoning engine based on transaction context
  return generateHeuristicDiagnosis(input);
}

function generateHeuristicDiagnosis(input: LLMDiagnosisInput): LLMDiagnosisOutput {
  const {
    amount,
    failureCategory,
    retryCount,
    trustScore,
    paymentMethod,
    customerOrders,
  } = input;

  if (retryCount >= 3) {
    return {
      diagnosis: `Exceeded maximum automated retry attempts (${retryCount} prior retries failed).`,
      riskLevel: "high",
      recoverability: 0.25,
      recommendedAction: "ESCALATE",
      reason: `Customer has encountered ${retryCount} consecutive failures. Policy limits automated retries to prevent customer fatigue and card network penalties.`,
      confidence: 0.95,
    };
  }

  if (amount > 10000) {
    return {
      diagnosis: `High-value enterprise order (₹${amount.toLocaleString("en-IN")}) payment authorization failure via ${paymentMethod}.`,
      riskLevel: "medium",
      recoverability: 0.72,
      recommendedAction: "CREATE_PAYMENT_LINK",
      reason: `High transaction amount requires explicit authorization. Creating a high-priority personalized payment link with extended validity and invoice documentation.`,
      confidence: 0.9,
    };
  }

  switch (failureCategory) {
    case "TEMPORARY_FAILURE":
      return {
        diagnosis: `Transient bank issuer decline during ${paymentMethod} processing. Likely bank server timeout or temporary balance hold.`,
        riskLevel: "low",
        recoverability: 0.91,
        recommendedAction: "CREATE_PAYMENT_LINK",
        reason: `Customer has a strong order history (${customerOrders} prior orders, trust score ${trustScore}/100). A direct payment link allows immediate re-attempt via alternate UPI app or card.`,
        confidence: 0.93,
      };

    case "CHECKOUT_ABANDONED":
      return {
        diagnosis: `Customer abandoned session at checkout final stage before payment confirmation.`,
        riskLevel: "low",
        recoverability: 0.84,
        recommendedAction: "SEND_RECOVERY_MESSAGE",
        reason: `High conversion intent detected. Cart value ₹${amount.toLocaleString("en-IN")} held for 30 minutes. Dispatching instant recovery notification with payment link.`,
        confidence: 0.88,
      };

    case "NETWORK_ERROR":
      return {
        diagnosis: `Gateway network handshake disconnect between merchant and bank routing server.`,
        riskLevel: "low",
        recoverability: 0.88,
        recommendedAction: "RETRY",
        reason: `No failure attributable to customer card or balance. Instant backoff retry via secondary payment gateway channel recommended.`,
        confidence: 0.92,
      };

    case "BANK_DECLINED":
      return {
        diagnosis: `Bank issuer declined payment attempt via ${paymentMethod} due to 2FA failure or limit threshold.`,
        riskLevel: "medium",
        recoverability: 0.65,
        recommendedAction: "ALTERNATIVE_METHOD",
        reason: `Issuer decline indicates primary method ${paymentMethod} is temporarily restricted. Prompt customer to switch to Netbanking or alternate credit card.`,
        confidence: 0.85,
      };

    case "REPEATED_FAILURE":
      return {
        diagnosis: `Multi-attempt failure pattern detected across short timeframe. Risk of automated script or card testing.`,
        riskLevel: "high",
        recoverability: 0.35,
        recommendedAction: "ESCALATE",
        reason: `Velocity controls flagged suspicious repeated payment declines. Agent halts automated actions and routes to risk operations.`,
        confidence: 0.94,
      };

    case "CUSTOMER_CANCELLED":
      return {
        diagnosis: `Customer manually closed OTP screen or cancelled 3DS authentication.`,
        riskLevel: "medium",
        recoverability: 0.58,
        recommendedAction: "SEND_RECOVERY_MESSAGE",
        reason: `Customer hesitated during 3DS screen. Send gentle follow-up reminder with single-click checkout URL.`,
        confidence: 0.8,
      };

    default:
      return {
        diagnosis: `Unspecified payment processing error for order ${input.orderNumber}.`,
        riskLevel: "medium",
        recoverability: 0.6,
        recommendedAction: "CREATE_PAYMENT_LINK",
        reason: `Defaulting to safe payment link creation for friction-free customer recovery.`,
        confidence: 0.75,
      };
  }
}
