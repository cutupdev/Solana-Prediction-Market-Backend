import { OrderSide, OrderStatus, OutcomeLeg } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import * as orderService from "../../services/orderService";
import { asyncHandler } from "../asyncHandler";

export const ordersRouter = Router();

const placeBody = z.object({
  marketId: z.string().min(1),
  ownerPubkey: z.string().min(32).max(64),
  leg: z.nativeEnum(OutcomeLeg),
  side: z.nativeEnum(OrderSide),
  priceBps: z.number().int().min(0).max(10_000),
  size: z.string().regex(/^\d+$/),
});

ordersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = placeBody.parse(req.body);
    const order = await orderService.placeOrder({
      marketId: body.marketId,
      ownerPubkey: body.ownerPubkey,
      leg: body.leg,
      side: body.side,
      priceBps: body.priceBps,
      size: BigInt(body.size),
    });
    res.status(201).json({ order });
  })
);

ordersRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const ownerPubkey = z
      .string()
      .min(32)
      .max(64)
      .parse(
        (req.body as { ownerPubkey?: string } | undefined)?.ownerPubkey ??
          (req.query as { owner?: string }).owner
      );
    const order = await orderService.cancelOrder(req.params.id, ownerPubkey);
    if (!order) {
      res.status(404).json({ error: "Order not found or not owned by wallet" });
      return;
    }
    res.json({ order });
  })
);

ordersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = z
      .object({
        owner: z.string().min(32).max(64),
        marketId: z.string().optional(),
        status: z.nativeEnum(OrderStatus).optional(),
      })
      .parse(req.query);
    const orders = await orderService.listOrdersForOwner(q.owner, {
      marketId: q.marketId,
      status: q.status,
    });
    res.json({ orders });
  })
);
