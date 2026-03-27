import { MarketStatus, Outcome } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import * as marketService from "../../services/marketService";
import * as orderService from "../../services/orderService";
import { asyncHandler } from "../asyncHandler";
import { optionalAdminAuth } from "../middleware/adminAuth";
import { orderbookRouter } from "./orderbook";

export const marketsRouter = Router();

marketsRouter.use("/:slugOrId/orderbook", orderbookRouter);

const createBody = z.object({
  slug: z.string().min(1).max(120),
  question: z.string().min(1).max(2000),
  description: z.string().max(8000).optional(),
  chainMarketPda: z.string().optional(),
  yesMint: z.string().optional(),
  noMint: z.string().optional(),
  collateralMint: z.string().optional(),
  resolvesAt: z.string().datetime().optional(),
});

marketsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = z.object({ status: z.nativeEnum(MarketStatus).optional() }).safeParse(req.query);
    if (!q.success) {
      res.status(400).json({ error: "Invalid query", details: q.error.flatten() });
      return;
    }
    const rows = await marketService.listMarkets(q.data.status);
    res.json({ markets: rows });
  })
);

marketsRouter.post(
  "/",
  optionalAdminAuth,
  asyncHandler(async (req, res) => {
    const body = createBody.parse(req.body);
    const m = await marketService.createMarket({
      slug: body.slug,
      question: body.question,
      description: body.description,
      chainMarketPda: body.chainMarketPda,
      yesMint: body.yesMint,
      noMint: body.noMint,
      collateralMint: body.collateralMint,
      resolvesAt: body.resolvesAt ? new Date(body.resolvesAt) : undefined,
    });
    res.status(201).json({ market: m });
  })
);

marketsRouter.get(
  "/:slugOrId/trades",
  asyncHandler(async (req, res) => {
    const key = req.params.slugOrId;
    const m = (await marketService.getMarketBySlug(key)) ?? (await marketService.getMarketById(key));
    if (!m) {
      res.status(404).json({ error: "Market not found" });
      return;
    }
    const take = z.coerce.number().int().min(1).max(500).optional().parse(req.query.take) ?? 100;
    const trades = await orderService.listTradesForMarket(m.id, take);
    res.json({ trades });
  })
);

marketsRouter.get(
  "/:slugOrId",
  asyncHandler(async (req, res) => {
    const key = req.params.slugOrId;
    const m = (await marketService.getMarketBySlug(key)) ?? (await marketService.getMarketById(key));
    if (!m) {
      res.status(404).json({ error: "Market not found" });
      return;
    }
    res.json({ market: m });
  })
);

const resolveBody = z.object({
  winningOutcome: z.nativeEnum(Outcome),
});

marketsRouter.post(
  "/:id/resolve",
  optionalAdminAuth,
  asyncHandler(async (req, res) => {
    const { winningOutcome } = resolveBody.parse(req.body);
    const m = await marketService.resolveMarket(req.params.id, winningOutcome);
    if (!m) {
      res.status(404).json({ error: "Market not found" });
      return;
    }
    res.json({ market: m });
  })
);
