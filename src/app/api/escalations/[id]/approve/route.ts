import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRazorpayPaymentLink } from "@/lib/razorpay";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const escalationId = params.id;

    const escalation = await prisma.escalation.findUnique({
      where: { id: escalationId },
      include: {
        case: {
          include: {
            customer: true,
            order: true,
            payment: true,
          },
        },
      },
    });

    if (!escalation) {
      return NextResponse.json(
        { success: false, error: "Escalation record not found" },
        { status: 404 }
      );
    }

    // Execute human override action (e.g. Create Payment Link)
    const link = await createRazorpayPaymentLink({
      amount: escalation.case.amount,
      description: `Human Approved Recovery Link for Order ${escalation.case.order.orderNumber}`,
      customer: {
        name: escalation.case.customer.name,
        email: escalation.case.customer.email,
        contact: escalation.case.customer.phone || undefined,
      },
      referenceId: escalation.case.id,
    });

    await prisma.recoveryAction.create({
      data: {
        caseId: escalation.case.id,
        actionType: "CREATE_PAYMENT_LINK",
        razorpayLinkId: link.id,
        razorpayLinkUrl: link.url,
        status: "EXECUTED",
        resultPayload: JSON.stringify(link),
      },
    });

    // Update escalation & case status
    await prisma.escalation.update({
      where: { id: escalationId },
      data: {
        status: "APPROVED",
        resolvedBy: "HUMAN_OPERATOR",
        resolvedAt: new Date(),
      },
    });

    await prisma.recoveryCase.update({
      where: { id: escalation.caseId },
      data: {
        status: "RECOVERED",
      },
    });

    await prisma.payment.update({
      where: { id: escalation.case.paymentId },
      data: { status: "SUCCESS" },
    });

    await prisma.order.update({
      where: { id: escalation.case.orderId },
      data: { status: "PAID" },
    });

    // Log Audit Event
    await prisma.auditEvent.create({
      data: {
        caseId: escalation.caseId,
        event: "escalation_approved_by_human",
        actor: "HUMAN",
        details: JSON.stringify({
          action: "Human override executed payment link creation.",
          paymentLinkUrl: link.url,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Escalation approved and recovery action executed successfully.",
      paymentLinkUrl: link.url,
    });
  } catch (err) {
    console.error(`POST /api/escalations/${params.id}/approve error:`, err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
