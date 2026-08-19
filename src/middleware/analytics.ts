import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { trackEvent } from "../services/analytics";

export function analyticsMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    if (!req.apiKey) return;
    trackEvent({
      apiKey: req.apiKey,
      endpoint: req.originalUrl || req.path,
      method: req.method,
      statusCode: res.statusCode,
      latencyMs: Date.now() - start,
    });
  });
  next();
}
