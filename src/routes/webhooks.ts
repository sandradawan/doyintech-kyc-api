import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { setWebhook, getWebhook, deleteWebhook } from "../services/webhooks";

const router = Router();

router.get("/", authMiddleware, (req: AuthRequest, res) => {
  const cfg = getWebhook(req.apiKey!);
  if (!cfg) return res.json({ success: true, data: null });
  res.json({
    success: true,
    data: {
      url: cfg.url,
      events: cfg.events,
      active: cfg.active,
      secret: cfg.secret,
      updatedAt: cfg.updatedAt,
    },
  });
});

router.post("/", authMiddleware, (req: AuthRequest, res) => {
  const { url, events } = req.body;
  if (!url) return res.status(400).json({ success: false, error: "url is required" });
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ success: false, error: "Invalid URL" });
  }
  const cfg = setWebhook(req.apiKey!, url, events);
  res.json({
    success: true,
    data: {
      url: cfg.url,
      events: cfg.events,
      active: cfg.active,
      secret: cfg.secret,
      updatedAt: cfg.updatedAt,
    },
  });
});

router.delete("/", authMiddleware, (req: AuthRequest, res) => {
  deleteWebhook(req.apiKey!);
  res.json({ success: true, message: "Webhook removed" });
});

export default router;
