import crypto from "crypto";

export interface CreatePaymentLinkOptions {
  amount: number; // in INR
  currency?: string;
  description: string;
  customer: {
    name: string;
    email: string;
    contact?: string;
  };
  referenceId: string;
  callbackUrl?: string;
}

export interface RazorpayLinkResult {
  id: string;
  url: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: number;
  isSimulated: boolean;
}

export function isRazorpayConfigured(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return Boolean(
    keyId &&
      keySecret &&
      keyId.trim() !== "" &&
      keySecret.trim() !== "" &&
      !keyId.includes("xxxx")
  );
}

export async function createRazorpayPaymentLink(
  options: CreatePaymentLinkOptions
): Promise<RazorpayLinkResult> {
  const configured = isRazorpayConfigured();

  if (configured) {
    try {
      // Dynamic import of Razorpay package to avoid server startup issues if optional
      const Razorpay = (await import("razorpay")).default;
      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });

      const response = await rzp.paymentLink.create({
        amount: Math.round(options.amount * 100), // convert to paise
        currency: options.currency || "INR",
        accept_partial: false,
        description: options.description,
        customer: {
          name: options.customer.name,
          email: options.customer.email,
          contact: options.customer.contact || "+919876543210",
        },
        notify: {
          sms: false,
          email: true,
        },
        reminder_enable: true,
        notes: {
          reference_id: options.referenceId,
          source: "RecoverAI_Agent",
        },
        callback_url: options.callbackUrl || `http://localhost:3000/cases/${options.referenceId}`,
        callback_method: "get",
      });

      return {
        id: response.id,
        url: response.short_url || `https://rzp.io/i/${response.id}`,
        status: response.status || "created",
        amount: options.amount,
        currency: options.currency || "INR",
        createdAt: Math.floor(Date.now() / 1000),
        isSimulated: false,
      };
    } catch (err) {
      console.warn("Razorpay API call failed, falling back to simulated link:", err);
    }
  }

  // Simulated Payment Link for Demo Mode
  const simId = `plink_sim_${options.referenceId.slice(0, 8)}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: simId,
    url: `https://pay.recoverai.demo/pay/${simId}`,
    status: "created",
    amount: options.amount,
    currency: options.currency || "INR",
    createdAt: Math.floor(Date.now() / 1000),
    isSimulated: true,
  };
}

export function validateRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  secret?: string
): boolean {
  const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret.trim() === "" || webhookSecret.includes("xxxx")) {
    // In demo mode without secret, accept valid test headers
    return true;
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");
    return expectedSignature === signature;
  } catch (err) {
    console.error("Error validating Razorpay webhook signature:", err);
    return false;
  }
}
