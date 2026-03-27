import { OutcomeLeg } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import * as marketService from "../../services/marketService";
import * as orderbookService from "../../services/orderbookService";
import { asyncHandler } from "../asyncHandler";

export const orderbookRouter = Router({ mergeParams: true });

orderbookRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const key = req.params.slugOrId;
    const m = (await marketService.getMarketBySlug(key)) ?? (await marketService.getMarketById(key));
    if (!m) {
      res.status(404).json({ error: "Market not found" });
      return;
    }
    const q = z.object({ leg: z.nativeEnum(OutcomeLeg) }).parse(req.query);
    const snap = await orderbookService.getOrderBookSnapshot(m.id, q.leg);
    res.json({ orderbook: snap });
  })
);
