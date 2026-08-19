import { Router } from "express";
import { plans, getKeyInfo } from "../services/keys";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

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

    const amount = plans[plan as keyof typeof plans].price * 100;
    const reference = `dt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    res.json({
      success: true,
      data: {
        authorization_url: `https://checkout.paystack.com/mock/${reference}`,
        access_code: reference,
        reference,
        amount,
        plan,
        message: "In production this returns a real Paystack authorization_url",
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/verify", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { reference, plan } = req.body;

    if (!reference || !plan) {
      return res.status(400).json({
        success: false,
        error: "reference and plan are required",
      });
    }

    const info = getKeyInfo(req.apiKey!);
    if (!info) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    info.plan = plan;
    info.monthlyLimit = plans[plan as keyof typeof plans]?.limit || info.monthlyLimit;
    info.usedThisMonth = 0;

    res.json({
      success: true,
      data: {
        message: "Plan upgraded successfully",
        plan: info.plan,
        monthlyLimit: info.monthlyLimit,
        reference,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
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

export default router;
