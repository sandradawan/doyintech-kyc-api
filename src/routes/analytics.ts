import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { getSummary, getEventsForKey } from "../services/analytics";

const router = Router();

router.get("/summary", authMiddleware, (req: AuthRequest, res) => {
  res.json({ success: true, data: getSummary(req.apiKey) });
});

router.get("/events", authMiddleware, (req: AuthRequest, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  res.json({ success: true, data: getEventsForKey(req.apiKey!, limit) });
});

router.get("/global", (_req, res) => {
  res.json({ success: true, data: getSummary() });
});

export default router;
