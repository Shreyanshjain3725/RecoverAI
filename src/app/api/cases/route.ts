import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { caseNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { email: { contains: search } } },
        { order: { orderNumber: { contains: search } } },
      ];
    }

    const cases = await prisma.recoveryCase.findMany({
      where,
      include: {
        customer: true,
        order: true,
        payment: true,
        decision: true,
        actions: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
        escalation: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, count: cases.length, cases });
  } catch (err) {
    console.error("GET /api/cases error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
