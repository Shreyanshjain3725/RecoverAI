import { prisma } from "./prisma";

export async function generateDemoBatch() {
  // Clear existing demo cases if any to reset cleanly
  await prisma.escalation.deleteMany();
  await prisma.recoveryAction.deleteMany();
  await prisma.agentDecision.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.recoveryCase.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.webhookEvent.deleteMany();

  const demoScenarios = [
    {
      customer: {
        name: "Aarav Sharma",
        email: "aarav.sharma@example.in",
        phone: "+919876543210",
        totalSpent: 18500,
        ordersCount: 4,
        trustScore: 88,
      },
      orderNumber: "ORD-2026-8801",
      amount: 2499,
      paymentMethod: "UPI",
      failureReason: "UPI PIN timeout at issuer bank server",
      failureCategory: "TEMPORARY_FAILURE",
      retryCount: 0,
    },
    {
      customer: {
        name: "Priya Nair",
        email: "priya.nair@example.in",
        phone: "+919812345678",
        totalSpent: 4200,
        ordersCount: 1,
        trustScore: 78,
      },
      orderNumber: "ORD-2026-8802",
      amount: 799,
      paymentMethod: "CARD",
      failureReason: "Checkout session expired during address selection",
      failureCategory: "CHECKOUT_ABANDONED",
      retryCount: 0,
    },
    {
      customer: {
        name: "Rohan Verma",
        email: "rohan.v@example.in",
        phone: "+919988776655",
        totalSpent: 12000,
        ordersCount: 2,
        trustScore: 82,
      },
      orderNumber: "ORD-2026-8803",
      amount: 4999,
      paymentMethod: "CARD",
      failureReason: "3DS authentication OTP expired",
      failureCategory: "TEMPORARY_FAILURE",
      retryCount: 0,
    },
    {
      customer: {
        name: "Vikram Malhotra",
        email: "vikram.m@enterprise.in",
        phone: "+919765432109",
        totalSpent: 85000,
        ordersCount: 9,
        trustScore: 92,
      },
      orderNumber: "ORD-2026-8804",
      amount: 12000, // Exceeds Policy High Value Threshold ₹10,000
      paymentMethod: "NETBANKING",
      failureReason: "Corporate Netbanking daily limits exceeded",
      failureCategory: "BANK_DECLINED",
      retryCount: 1,
    },
    {
      customer: {
        name: "Ananya Deshmukh",
        email: "ananya.d@example.in",
        phone: "+919822334455",
        totalSpent: 9400,
        ordersCount: 3,
        trustScore: 85,
      },
      orderNumber: "ORD-2026-8805",
      amount: 1299,
      paymentMethod: "UPI",
      failureReason: "NPCI Gateway route timeout",
      failureCategory: "NETWORK_ERROR",
      retryCount: 0,
    },
    {
      customer: {
        name: "Siddharth Gupta",
        email: "sid.gupta@example.in",
        phone: "+919911223344",
        totalSpent: 34000,
        ordersCount: 6,
        trustScore: 94,
      },
      orderNumber: "ORD-2026-8806",
      amount: 3499,
      paymentMethod: "CARD",
      failureReason: "Temporary international transaction restriction",
      failureCategory: "TEMPORARY_FAILURE",
      retryCount: 0,
    },
    {
      customer: {
        name: "Kavya Patel",
        email: "kavya.patel@example.in",
        phone: "+919877665544",
        totalSpent: 6999,
        ordersCount: 1,
        trustScore: 60,
      },
      orderNumber: "ORD-2026-8807",
      amount: 6999,
      paymentMethod: "CARD",
      failureReason: "Insufficient funds / Limit exceeded across 3 prior attempts",
      failureCategory: "REPEATED_FAILURE",
      retryCount: 3, // Triggers Rule 2: Exceeded max retries threshold
    },
    {
      customer: {
        name: "Rajesh Kulkarni",
        email: "rajesh.k@example.in",
        phone: "+919654321098",
        totalSpent: 0,
        ordersCount: 0,
        trustScore: 35,
      },
      orderNumber: "ORD-2026-8808",
      amount: 15000,
      paymentMethod: "CARD",
      failureReason: "High-frequency card testing pattern detected",
      failureCategory: "REPEATED_FAILURE", // Triggers Rule 3 & 4
      retryCount: 2,
    },
    {
      customer: {
        name: "Meera Reddy",
        email: "meera.reddy@example.in",
        phone: "+919844556677",
        totalSpent: 5200,
        ordersCount: 2,
        trustScore: 81,
      },
      orderNumber: "ORD-2026-8809",
      amount: 999,
      paymentMethod: "UPI",
      failureReason: "Abandoned cart at UPI app selection screen",
      failureCategory: "CHECKOUT_ABANDONED",
      retryCount: 0,
    },
    {
      customer: {
        name: "Devendra Mehta",
        email: "devendra.m@example.in",
        phone: "+919733445566",
        totalSpent: 16800,
        ordersCount: 3,
        trustScore: 86,
      },
      orderNumber: "ORD-2026-8810",
      amount: 8499,
      paymentMethod: "NETBANKING",
      failureReason: "Bank authentication gateway offline",
      failureCategory: "TEMPORARY_FAILURE",
      retryCount: 0,
    },
  ];

  const createdCases = [];

  for (let i = 0; i < demoScenarios.length; i++) {
    const s = demoScenarios[i];

    const customer = await prisma.customer.create({
      data: {
        externalId: `cust_demo_${i + 1}`,
        name: s.customer.name,
        email: s.customer.email,
        phone: s.customer.phone,
        totalSpent: s.customer.totalSpent,
        ordersCount: s.customer.ordersCount,
        trustScore: s.customer.trustScore,
      },
    });

    const order = await prisma.order.create({
      data: {
        orderNumber: s.orderNumber,
        totalAmount: s.amount,
        currency: "INR",
        status: "UNPAID",
        customerId: customer.id,
      },
    });

    const payment = await prisma.payment.create({
      data: {
        paymentId: `pay_demo_${i + 1}_${Date.now()}`,
        orderId: order.id,
        customerId: customer.id,
        amount: s.amount,
        currency: "INR",
        status: "FAILED",
        paymentMethod: s.paymentMethod,
        failureReason: s.failureReason,
        failureCategory: s.failureCategory,
      },
    });

    const caseNumber = `RC-2026-${(1001 + i).toString()}`;
    const recoveryCase = await prisma.recoveryCase.create({
      data: {
        caseNumber,
        paymentId: payment.id,
        orderId: order.id,
        customerId: customer.id,
        amount: s.amount,
        status: "DETECTED",
        retryCount: s.retryCount,
      },
    });

    // Create initial audit log
    await prisma.auditEvent.create({
      data: {
        caseId: recoveryCase.id,
        event: "payment.failed",
        actor: "RAZORPAY",
        details: JSON.stringify({
          orderNumber: s.orderNumber,
          amount: s.amount,
          reason: s.failureReason,
          category: s.failureCategory,
        }),
      },
    });

    await prisma.auditEvent.create({
      data: {
        caseId: recoveryCase.id,
        event: "recovery_case.created",
        actor: "SYSTEM",
        details: JSON.stringify({
          caseNumber,
          customer: s.customer.name,
          amount: s.amount,
        }),
      },
    });

    createdCases.push(recoveryCase);
  }

  return {
    success: true,
    message: `Successfully generated ${createdCases.length} demo recovery cases.`,
    casesCount: createdCases.length,
    totalRevenueAtRisk: demoScenarios.reduce((acc, curr) => acc + curr.amount, 0),
  };
}
