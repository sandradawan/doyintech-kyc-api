import { Router } from "express";
import { z } from "zod";
import { verifyBVN, verifyNIN, verifyDocument, faceMatch } from "../services/verification";

const router = Router();

const bvnSchema = z.object({
  bvn: z.string().length(11, "BVN must be 11 digits"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const ninSchema = z.object({
  nin: z.string().length(11, "NIN must be 11 digits"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const documentSchema = z.object({
  documentType: z.enum(["passport", "drivers_license", "voters_card", "national_id"]),
  documentImage: z.string().min(100, "Base64 image required"),
  selfieImage: z.string().optional(),
});

const faceMatchSchema = z.object({
  image1: z.string().min(100),
  image2: z.string().min(100),
});

router.post("/bvn", async (req, res, next) => {
  try {
    const body = bvnSchema.parse(req.body);
    const result = await verifyBVN(body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/nin", async (req, res, next) => {
  try {
    const body = ninSchema.parse(req.body);
    const result = await verifyNIN(body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/document", async (req, res, next) => {
  try {
    const body = documentSchema.parse(req.body);
    const result = await verifyDocument(body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/face-match", async (req, res, next) => {
  try {
    const body = faceMatchSchema.parse(req.body);
    const result = await faceMatch(body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
