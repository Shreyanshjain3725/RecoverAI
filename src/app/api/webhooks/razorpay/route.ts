import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRazorpayWebhookSignature } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    const isValid = validateRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid Razorpay webhook signature" },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event || "unknown";
    const eventId = payload.account_id ? `${payload.event}_${payload.created_at}_${Math.random().toString(36).slice(2, 6)}` : `evt_${Date.now()}`;

    // Check Idempotency
    const existingWebhook = await prisma.webhookEvent.findUnique({
      where: { eventId },
    });

    if (existingWebhook && existingWebhook.processed) {
      return NextResponse.json({
        success: true,
        message: "Webhook event already processed (idempotent duplicate skipped).",
      });
    }

    // Save Webhook Event
    await prisma.webhookEvent.upsert({
      where: { eventId },
      create: {
        eventId,
        eventType,
        payload: rawBody,
        processed: true,
      },
      update: {
        processed: true,
      },
    });

    // Process Event Types
    if (eventType === "payment.failed") {
      const p = payload.payload?.payment?.entity;
      if (p) {
        const orderNumber = p.order_id || `ORD-${p.id.slice(-6)}`;
        let customer = await prisma.customer.findFirst({
          where: { email: p.email || "guest@example.in" },
        });

        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              name: p.contact || "Razorpay Customer",
              email: p.email || "guest@example.in",
              phone: p.contact || "+919876543210",
              trustScore: 75,
            },
          });
        }

        const order = await prisma.order.create({
          data: {
            orderNumber,
            totalAmount: p.amount / 100,
            currency: p.currency || "INR",
            status: "UNPAID",
            customerId: customer.id,
          },
        });

        const payment = await prisma.payment.create({
          data: {
            paymentId: p.id,
            orderId: order.id,
            customerId: customer.id,
            amount: p.amount / 100,
            currency: p.currency || "INR",
            status: "FAILED",
            paymentMethod: p.method ? p.method.toUpperCase() : "CARD",
            failureReason: p.error_description || "Payment authorization failed",
            failureCategory: "TEMPORARY_FAILURE",
            razorpayPaymentId: p.id,
          },
        });

        const caseNumber = `RC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const recoveryCase = await prisma.recoveryCase.create({
          data: {
            caseNumber,
            paymentId: payment.id,
            orderId: order.id,
            customerId: customer.id,
            amount: p.amount / 100,
            status: "DETECTED",
          },
        });

        await prisma.auditEvent.create({
          data: {
            caseId: recoveryCase.id,
            event: "payment.failed",
            actor: "RAZORPAY",
            details: JSON.stringify({ razorpayPaymentId: p.id, amount: p.amount / 100 }),
          },
        });
      }
    } else if (eventType === "payment_link.paid" || eventType === "payment.authorized") {
      const plink = payload.payload?.payment_link?.entity;
      if (plink) {
        const referenceId = plink.notes?.reference_id;
        if (referenceId) {
          const rCase = await prisma.recoveryCase.findUnique({
            where: { id: referenceId },
          });

          if (rCase) {
            await prisma.recoveryCase.update({
              where: { id: referenceId },
              data: { status: "RECOVERED" },
            });

            await prisma.payment.update({
              where: { id: rCase.paymentId },
              data: { status: "SUCCESS" },
            });

            await prisma.order.update({
              where: { id: rCase.orderId },
              data: { status: "PAID" },
            });

            await prisma.auditEvent.create({
              data: {
                caseId: rCase.id,
                event: "payment.recovered",
                actor: "RAZORPAY",
                details: JSON.stringify({ amount: rCase.amount, linkId: plink.id }),
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, eventId, eventType });
  } catch (err) {
    console.error("POST /api/webhooks/razorpay error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
