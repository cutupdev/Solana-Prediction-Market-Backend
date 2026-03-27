import { Router } from "express";
import { prisma } from "../../db/prisma";
import { getHealthySlot } from "../../solana/connection";
import { asyncHandler } from "../asyncHandler";

export const healthRouter = Router();

healthRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    const slot = await getHealthySlot();
    res.json({ ok: true, db: true, solanaSlot: slot });
  })
);
