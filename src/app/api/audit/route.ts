import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const actor = searchParams.get("actor");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (actor && actor !== "ALL") {
      where.actor = actor;
    }

    if (search) {
      where.OR = [
        { event: { contains: search } },
        { caseId: { contains: search } },
        { details: { contains: search } },
      ];
    }

    const events = await prisma.auditEvent.findMany({
      where,
      include: {
        case: {
          include: {
            customer: true,
            order: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json({ success: true, count: events.length, events });
  } catch (err) {
    console.error("GET /api/audit error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
