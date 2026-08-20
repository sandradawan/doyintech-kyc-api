import { Router } from "express";
import { plans, getKeyInfo } from "../services/keys";
import { addPayment, listPayments } from "../services/billing";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";
const CALLBACK_URL = process.env.PAYMENT_CALLBACK_URL || "";

router.post("/initialize", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { plan, email } = req.body;

    if (!plan || !plans[plan as keyof typeof plans]) {
      return res.status(400).json({
        success: false,
        error: "Invalid plan. Use: starter | growth | business",
      });
    }

    if (!email) {
      return res.status(400).json({ success: false, error: "email is required" });
    }

    if (!PAYSTACK_SECRET) {
      return res.status(500).json({
        success: false,
        error: "PAYSTACK_SECRET_KEY is not configured on the server",
      });
    }

    const amount = plans[plan as keyof typeof plans].price * 100;

    const payload: any = {
      email,
      amount,
      currency: "NGN",
      metadata: {
        apiKey: req.apiKey,
        plan,
        service: "doyintech-kyc",
      },
    };

    if (CALLBACK_URL) {
      payload.callback_url = CALLBACK_URL;
    }

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return res.status(400).json({
        success: false,
        error: paystackData.message || "Failed to initialize Paystack transaction",
      });
    }

    res.json({
      success: true,
      data: {
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
        amount,
        plan,
      },
    });
  } catch (err: any) {
    console.error("[Paystack Initialize]", err);
    res.status(500).json({ success: false, error: err.message || "Payment initialization failed" });
  }
});

router.post("/verify", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { reference, plan } = req.body;

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: "reference is required",
      });
    }

    if (!PAYSTACK_SECRET) {
      return res.status(500).json({
        success: false,
        error: "PAYSTACK_SECRET_KEY is not configured on the server",
      });
    }

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.status) {
      return res.status(400).json({
        success: false,
        error: verifyData.message || "Verification failed",
      });
    }

    const transaction = verifyData.data;

    if (transaction.status !== "success") {
      return res.status(400).json({
        success: false,
        error: `Payment not successful. Status: ${transaction.status}`,
      });
    }

    const upgradedPlan = plan || transaction.metadata?.plan || "growth";

    const info = getKeyInfo(req.apiKey!);
    if (!info) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    info.plan = upgradedPlan;
    info.monthlyLimit = plans[upgradedPlan as keyof typeof plans]?.limit || info.monthlyLimit;
    info.usedThisMonth = 0;

    addPayment({
      reference: transaction.reference,
      plan: upgradedPlan,
      amount: transaction.amount,
      email: transaction.customer?.email || "",
      apiKey: req.apiKey!,
      status: "success",
      paidAt: transaction.paid_at || new Date().toISOString(),
    });

    res.json({
      success: true,
      data: {
        message: "Payment verified and plan upgraded",
        plan: info.plan,
        monthlyLimit: info.monthlyLimit,
        reference: transaction.reference,
        amount: transaction.amount,
        paidAt: transaction.paid_at,
      },
    });
  } catch (err: any) {
    console.error("[Paystack Verify]", err);
    res.status(500).json({ success: false, error: err.message || "Verification failed" });
  }
});

router.get("/plans", (_req, res) => {
  res.json({
    success: true,
    data: Object.entries(plans).map(([name, p]) => ({
      name,
      monthlyLimit: p.limit,
      priceNGN: p.price,
      priceFormatted: p.price === 0 ? "Custom" : `₦${p.price.toLocaleString()}`,
    })),
  });
});

router.get("/history", authMiddleware, (req: AuthRequest, res) => {
  res.json({ success: true, data: listPayments(req.apiKey) });
});

export default router;
