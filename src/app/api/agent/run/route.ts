import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runAgentOnCase } from "@/lib/agent";

export async function POST() {
  try {
    // Find all cases eligible for agent processing (DETECTED or ANALYZING)
    const eligibleCases = await prisma.recoveryCase.findMany({
      where: {
        status: {
          in: ["DETECTED", "ANALYZING"],
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (eligibleCases.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No eligible pending cases found to process.",
        processedCount: 0,
        results: [],
      });
    }

    const results = [];

    for (const c of eligibleCases) {
      try {
        const result = await runAgentOnCase(c.id);
        results.push(result);
      } catch (err) {
        console.error(`Agent error on case ${c.id}:`, err);
      }
    }

    // Compute dynamically aggregated batch summary
    const totalRisk = results.reduce((acc, curr) => acc + curr.amount, 0);
    const totalRecovered = results
      .filter((r) => r.status === "RECOVERED")
      .reduce((acc, curr) => acc + curr.amount, 0);
    const recoveryRate = totalRisk > 0 ? Math.round((totalRecovered / totalRisk) * 100) : 0;
    const escalationsCount = results.filter((r) => r.status === "ESCALATED").length;
    const actionsCount = results.filter((r) => r.status === "ACTION_EXECUTED" || r.status === "RECOVERED").length;
    const blockedCount = results.filter((r) => r.policyDecision === "BLOCKED").length;

    return NextResponse.json({
      success: true,
      processedCount: results.length,
      summary: {
        totalRevenueAtRisk: totalRisk,
        totalRecovered,
        recoveryRate,
        actionsCount,
        escalationsCount,
        blockedCount,
      },
      results,
    });
  } catch (err) {
    console.error("POST /api/agent/run error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
