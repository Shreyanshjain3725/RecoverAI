import { NextResponse } from "next/server";
import { runAgentOnCase } from "@/lib/agent";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const caseId = params.id;
    const result = await runAgentOnCase(caseId);
    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error(`POST /api/agent/run/${params.id} error:`, err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
