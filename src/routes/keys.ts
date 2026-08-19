import { Router } from "express";
import { createKey, getKeyInfo, plans } from "../services/keys";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/plans", (_req, res) => {
  res.json({
    success: true,
    data: Object.entries(plans).map(([name, p]) => ({
      name,
      monthlyLimit: p.limit,
      priceNGN: p.price,
    })),
  });
});

router.get("/me", authMiddleware, (req: AuthRequest, res) => {
  const info = getKeyInfo(req.apiKey!);
  if (!info) {
    return res.status(404).json({ success: false, error: "Key not found" });
  }
  res.json({
    success: true,
    data: {
      name: info.name,
      plan: info.plan,
      monthlyLimit: info.monthlyLimit,
      usedThisMonth: info.usedThisMonth,
      remaining: info.monthlyLimit - info.usedThisMonth,
      active: info.active,
      lastUsedAt: info.lastUsedAt,
    },
  });
});

router.post("/create", (req, res) => {
  const { name, plan } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: "name is required" });
  }
  const record = createKey(name, plan || "starter");
  res.status(201).json({
    success: true,
    data: {
      key: record.key,
      name: record.name,
      plan: record.plan,
      monthlyLimit: record.monthlyLimit,
    },
  });
});

export default router;
