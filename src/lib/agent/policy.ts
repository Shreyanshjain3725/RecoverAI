export interface PolicyCheckContext {
  caseId: string;
  amount: number;
  retryCount: number;
  failureCategory: string;
  recommendedAction: string;
  customerTrustScore: number;
  existingActionsCount: number;
  isDuplicateRequest?: boolean;
}

export interface PolicyDecisionResult {
  allowed: boolean;
  decision: "APPROVED" | "BLOCKED" | "REQUIRES_HUMAN_APPROVAL" | "ESCALATED";
  reason: string;
  appliedRule: string;
  effectiveAction: string;
  stoppingRuleTriggered?: string;
}

export const ALLOWED_ACTIONS = [
  "RETRY",
  "CREATE_PAYMENT_LINK",
  "SEND_RECOVERY_MESSAGE",
  "ALTERNATIVE_METHOD",
  "ESCALATE",
  "NO_ACTION",
];

export function evaluatePolicyRules(context: PolicyCheckContext): PolicyDecisionResult {
  const highValueThreshold = parseFloat(process.env.HIGH_VALUE_THRESHOLD || "10000");
  const maxAttempts = parseInt(process.env.MAX_RECOVERY_ATTEMPTS || "3", 10);

  // RULE 7: Idempotency / Duplicate Check
  if (context.isDuplicateRequest) {
    return {
      allowed: false,
      decision: "BLOCKED",
      reason: "Duplicate recovery action prevented by idempotency policy.",
      appliedRule: "RULE_7_IDEMPOTENCY",
      effectiveAction: "NO_ACTION",
      stoppingRuleTriggered: "Idempotency check failed: Action already executed for payment.",
    };
  }

  // RULE 5: Allowed Action List Check
  if (!ALLOWED_ACTIONS.includes(context.recommendedAction)) {
    return {
      allowed: false,
      decision: "BLOCKED",
      reason: `Action '${context.recommendedAction}' is not in the deterministic policy allowed list.`,
      appliedRule: "RULE_5_INVALID_ACTION",
      effectiveAction: "NO_ACTION",
      stoppingRuleTriggered: `Recommended action ${context.recommendedAction} not permitted.`,
    };
  }

  // If AI recommended ESCALATE or NO_ACTION directly
  if (context.recommendedAction === "ESCALATE") {
    return {
      allowed: true,
      decision: "ESCALATED",
      reason: "AI agent recommended human escalation based on context diagnosis.",
      appliedRule: "AI_RECOMMENDED_ESCALATION",
      effectiveAction: "ESCALATE",
      stoppingRuleTriggered: "AI diagnosis determined human intervention is required.",
    };
  }

  if (context.recommendedAction === "NO_ACTION") {
    return {
      allowed: true,
      decision: "APPROVED",
      reason: "No automated action recommended by policy.",
      appliedRule: "NO_ACTION_APPROVED",
      effectiveAction: "NO_ACTION",
    };
  }

  // RULE 1 & 2: Maximum automatic recovery attempts = 3
  if (context.retryCount >= maxAttempts) {
    return {
      allowed: false,
      decision: "REQUIRES_HUMAN_APPROVAL",
      reason: `Maximum automated attempts (${maxAttempts}) reached (current: ${context.retryCount}). Automatic recovery blocked.`,
      appliedRule: "RULE_2_MAX_RETRIES_EXCEEDED",
      effectiveAction: "ESCALATE",
      stoppingRuleTriggered: `Retry count (${context.retryCount}) exceeds policy ceiling of ${maxAttempts}.`,
    };
  }

  // RULE 3: Suspicious repeated failures / Fraud check
  if (context.failureCategory === "REPEATED_FAILURE" && context.retryCount >= 2) {
    return {
      allowed: false,
      decision: "BLOCKED",
      reason: "Suspicious velocity and repeated failure patterns detected. Automated retries blocked for safety.",
      appliedRule: "RULE_3_SUSPICIOUS_VELOCITY",
      effectiveAction: "ESCALATE",
      stoppingRuleTriggered: "Suspicious repeated failure pattern detected.",
    };
  }

  // RULE 4: High Value Amount Threshold (> ₹10,000)
  if (context.amount > highValueThreshold) {
    return {
      allowed: false,
      decision: "REQUIRES_HUMAN_APPROVAL",
      reason: `Transaction amount (₹${context.amount.toLocaleString("en-IN")}) exceeds human approval threshold (₹${highValueThreshold.toLocaleString("en-IN")}). Escalated for review.`,
      appliedRule: "RULE_4_HIGH_VALUE_THRESHOLD",
      effectiveAction: "ESCALATE",
      stoppingRuleTriggered: `High transaction amount ₹${context.amount.toLocaleString("en-IN")} requires compliance approval.`,
    };
  }

  // DEFAULT: APPROVED
  return {
    allowed: true,
    decision: "APPROVED",
    reason: `Passed policy checks: attempt count ${context.retryCount + 1}/${maxAttempts}, amount ₹${context.amount.toLocaleString("en-IN")} below ₹${highValueThreshold.toLocaleString("en-IN")} threshold.`,
    appliedRule: "RULE_DEFAULT_APPROVAL",
    effectiveAction: context.recommendedAction,
  };
}
