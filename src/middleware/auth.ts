import { Request, Response, NextFunction } from "express";
import { validateAndTrack } from "../services/keys";

export interface AuthRequest extends Request {
  apiKey?: string;
  keyRecord?: any;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"] as string | undefined;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: "Missing API key. Include header: X-API-Key",
    });
  }

  const result = validateAndTrack(apiKey);

  if (!result.ok) {
    const status = result.error?.includes("quota") ? 429 : 403;
    return res.status(status).json({
      success: false,
      error: result.error,
    });
  }

  req.apiKey = apiKey;
  req.keyRecord = result.record;
  next();
}
