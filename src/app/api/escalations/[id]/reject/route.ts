import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const escalationId = params.id;

    const escalation = await prisma.escalation.findUnique({
      where: { id: escalationId },
    });

    if (!escalation) {
      return NextResponse.json(
        { success: false, error: "Escalation record not found" },
        { status: 404 }
      );
    }

    await prisma.escalation.update({
      where: { id: escalationId },
      data: {
        status: "REJECTED",
        resolvedBy: "HUMAN_OPERATOR",
        resolvedAt: new Date(),
      },
    });

    await prisma.recoveryCase.update({
      where: { id: escalation.caseId },
      data: {
        status: "FAILED",
      },
    });

    await prisma.auditEvent.create({
      data: {
        caseId: escalation.caseId,
        event: "escalation_rejected_by_human",
        actor: "HUMAN",
        details: JSON.stringify({
          action: "Human operator rejected recovery proposal. Case closed.",
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Escalation rejected. Recovery case closed.",
    });
  } catch (err) {
    console.error(`POST /api/escalations/${params.id}/reject error:`, err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
