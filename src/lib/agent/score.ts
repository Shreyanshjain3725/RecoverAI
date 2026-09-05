export interface RecoveryScoreInput {
  amount: number;
  failureCategory: string;
  totalSpent: number;
  ordersCount: number;
  trustScore: number;
  retryCount: number;
  previousSuccessfulPayments?: number;
  isCheckoutAbandonment?: boolean;
}

export interface RecoveryScoreOutput {
  score: number; // 0 - 100
  recoverability: number; // 0.00 - 1.00
  expectedRevenue: number;
  breakdown: {
    customerTrustContribution: number;
    failureCategoryContribution: number;
    retryPenalty: number;
    amountContribution: number;
  };
}

export function calculateRecoveryScore(input: RecoveryScoreInput): RecoveryScoreOutput {
  const {
    amount,
    failureCategory,
    totalSpent,
    ordersCount,
    trustScore,
    retryCount,
    isCheckoutAbandonment,
  } = input;

  // Base score starting from customer trust
  let baseScore = trustScore * 0.4; // max 40 points

  // Customer purchase history contribution (max 25 points)
  let historyScore = 0;
  if (ordersCount > 5 || totalSpent > 25000) {
    historyScore = 25;
  } else if (ordersCount >= 2 || totalSpent > 5000) {
    historyScore = 18;
  } else if (ordersCount >= 1) {
    historyScore = 12;
  } else {
    historyScore = 5;
  }

  // Failure category contribution (max 25 points)
  let categoryScore = 15;
  switch (failureCategory) {
    case "TEMPORARY_FAILURE":
      categoryScore = 25;
      break;
    case "CHECKOUT_ABANDONED":
      categoryScore = 22;
      break;
    case "NETWORK_ERROR":
      categoryScore = 20;
      break;
    case "BANK_DECLINED":
      categoryScore = 14;
      break;
    case "CUSTOMER_CANCELLED":
      categoryScore = 10;
      break;
    case "REPEATED_FAILURE":
      categoryScore = 5;
      break;
    default:
      categoryScore = 12;
  }

  // Amount penalty/bonus (max 10 points)
  let amountScore = 10;
  if (amount > 10000) {
    amountScore = 4;
  } else if (amount > 5000) {
    amountScore = 7;
  }

  // Retry penalty
  const retryPenalty = Math.min(retryCount * 22, 60);

  // Total calculation
  let rawScore = Math.round(baseScore + historyScore + categoryScore + amountScore - retryPenalty);
  if (isCheckoutAbandonment) {
    rawScore = Math.min(100, rawScore + 5);
  }

  const score = Math.max(5, Math.min(99, rawScore));
  const recoverability = Math.round((score / 100) * 100) / 100;
  const expectedRevenue = Math.round(amount * recoverability * 100) / 100;

  return {
    score,
    recoverability,
    expectedRevenue,
    breakdown: {
      customerTrustContribution: Math.round(baseScore + historyScore),
      failureCategoryContribution: categoryScore,
      retryPenalty,
      amountContribution: amountScore,
    },
  };
}
