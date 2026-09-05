import { NextResponse } from "next/server";
import { generateDemoBatch } from "@/lib/simulation";

export async function POST() {
  try {
    const result = await generateDemoBatch();
    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/simulation/generate error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
