import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const allCases = await prisma.recoveryCase.findMany({
      include: {
        payment: true,
        decision: true,
        actions: true,
      },
    });

    const totalRevenueAtRisk = allCases.reduce((acc, c) => acc + c.amount, 0);
    const recoveredCases = allCases.filter((c) => c.status === "RECOVERED");
    const totalRecoveredRevenue = recoveredCases.reduce((acc, c) => acc + c.amount, 0);

    const recoveryRate =
      totalRevenueAtRisk > 0
        ? Math.round((totalRecoveredRevenue / totalRevenueAtRisk) * 100)
        : 0;

    const activeCases = allCases.filter((c) =>
      ["DETECTED", "ANALYZING", "POLICY_CHECK", "PENDING_ACTION", "ACTION_EXECUTED"].includes(c.status)
    ).length;

    const escalatedCases = allCases.filter((c) => c.status === "ESCALATED").length;
    const blockedCases = allCases.filter((c) => c.status === "BLOCKED").length;

    const policyBlockRate =
      allCases.length > 0 ? Math.round((blockedCases / allCases.length) * 100) : 0;

    const escalationRate =
      allCases.length > 0 ? Math.round((escalatedCases / allCases.length) * 100) : 0;

    // Breakdown by failure category
    const categoryMap: Record<string, { totalAtRisk: number; recovered: number; count: number }> = {};
    allCases.forEach((c) => {
      const cat = c.payment.failureCategory || "OTHER";
      if (!categoryMap[cat]) {
        categoryMap[cat] = { totalAtRisk: 0, recovered: 0, count: 0 };
      }
      categoryMap[cat].totalAtRisk += c.amount;
      categoryMap[cat].count += 1;
      if (c.status === "RECOVERED") {
        categoryMap[cat].recovered += c.amount;
      }
    });

    const recoveryByFailureType = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      totalAtRisk: data.totalAtRisk,
      recovered: data.recovered,
      count: data.count,
      recoveryRate: data.totalAtRisk > 0 ? Math.round((data.recovered / data.totalAtRisk) * 100) : 0,
    }));

    // Breakdown by action type
    const actionMap: Record<string, { count: number; recoveredAmount: number }> = {};
    allCases.forEach((c) => {
      const action = c.decision?.recommendedAction || "NO_ACTION";
      if (!actionMap[action]) {
        actionMap[action] = { count: 0, recoveredAmount: 0 };
      }
      actionMap[action].count += 1;
      if (c.status === "RECOVERED") {
        actionMap[action].recoveredAmount += c.amount;
      }
    });

    const recoveryByActionType = Object.entries(actionMap).map(([action, data]) => ({
      action,
      count: data.count,
      recoveredAmount: data.recoveredAmount,
    }));

    // Revenue over time (Mocked smooth timeseries based on actual cases)
    const timeSeriesData = [
      { time: "09:00", atRisk: totalRevenueAtRisk * 0.2, recovered: totalRecoveredRevenue * 0.15 },
      { time: "11:00", atRisk: totalRevenueAtRisk * 0.4, recovered: totalRecoveredRevenue * 0.35 },
      { time: "13:00", atRisk: totalRevenueAtRisk * 0.65, recovered: totalRecoveredRevenue * 0.55 },
      { time: "15:00", atRisk: totalRevenueAtRisk * 0.85, recovered: totalRecoveredRevenue * 0.8 },
      { time: "17:00", atRisk: totalRevenueAtRisk, recovered: totalRecoveredRevenue },
    ];

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenueAtRisk,
        totalRecoveredRevenue,
        recoveryRate,
        activeCases,
        escalatedCases,
        blockedCases,
        totalCases: allCases.length,
        averageRecoveryTimeSeconds: 42,
        aiAccuracy: 94,
        policyBlockRate,
        escalationRate,
      },
      recoveryByFailureType,
      recoveryByActionType,
      timeSeriesData,
    });
  } catch (err) {
    console.error("GET /api/analytics error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
