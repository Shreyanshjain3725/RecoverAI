import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const caseId = params.id;

    const recoveryCase = await prisma.recoveryCase.findUnique({
      where: { id: caseId },
      include: {
        customer: true,
        order: true,
        payment: true,
        decision: true,
        actions: {
          orderBy: { createdAt: "asc" },
        },
        auditEvents: {
          orderBy: { timestamp: "asc" },
        },
        escalation: true,
      },
    });

    if (!recoveryCase) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, case: recoveryCase });
  } catch (err) {
    console.error("GET /api/cases/[id] error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
