import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const escalations = await prisma.escalation.findMany({
      include: {
        case: {
          include: {
            customer: true,
            order: true,
            payment: true,
            decision: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, count: escalations.length, escalations });
  } catch (err) {
    console.error("GET /api/escalations error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
