import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/error";
import kycRoutes from "./routes/kyc";
import healthRoutes from "./routes/health";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("combined"));

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later." },
});
app.use(limiter);

app.use("/health", healthRoutes);
app.use("/v1/kyc", authMiddleware, kycRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 DoyinTech KYC API running on port ${PORT}`);
});
