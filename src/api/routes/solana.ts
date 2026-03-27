import { Router } from "express";
import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { fetchOnChainMarketAccount, buildUnsignedPlaceOnChainOrderTx, serializeVersionedTx } from "../../solana/settlement";
import { asyncHandler } from "../asyncHandler";

export const solanaRouter = Router();

const preparedPlaceOrder = z.object({
  feePayer: z.string().min(32).max(64),
  market: z.string().min(32).max(64),
  user: z.string().min(32).max(64),
  legYes: z.boolean(),
  sideBid: z.boolean(),
  priceBps: z.number().int().min(0).max(10_000),
  size: z.string().regex(/^\d+$/),
});

solanaRouter.post(
  "/prepared/place-order",
  asyncHandler(async (req, res) => {
    const body = preparedPlaceOrder.parse(req.body);
    const tx = await buildUnsignedPlaceOnChainOrderTx({
      feePayer: new PublicKey(body.feePayer),
      market: new PublicKey(body.market),
      user: new PublicKey(body.user),
      args: {
        legYes: body.legYes,
        sideBid: body.sideBid,
        priceBps: body.priceBps,
        size: BigInt(body.size),
      },
    });
    res.json({
      transactionBase64: serializeVersionedTx(tx),
    });
  })
);

solanaRouter.get(
  "/on-chain-market/:address",
  asyncHandler(async (req, res) => {
    const addr = z.string().min(32).max(64).parse(req.params.address);
    const data = await fetchOnChainMarketAccount(new PublicKey(addr));
    res.json({ marketAccount: data });
  })
);
