import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  apiKey?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"] as string | undefined;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: "Missing API key. Include header: X-API-Key",
    });
  }

  const validKeys = (process.env.API_KEYS || "").split(",").map((k) => k.trim()).filter(Boolean);

  if (!validKeys.includes(apiKey)) {
    return res.status(403).json({
      success: false,
      error: "Invalid API key",
    });
  }

  req.apiKey = apiKey;
  next();
}
