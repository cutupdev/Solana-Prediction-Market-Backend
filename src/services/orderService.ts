import type { Order, OrderSide, OrderStatus, OutcomeLeg } from "@prisma/client";
import { prisma } from "../db/prisma";
import { HttpError } from "../lib/httpError";
import type { OrderDto, TradeDto } from "../types/api";
import { matchIncomingOrder } from "./orderbookMatcher";

function toOrderDto(o: Order): OrderDto {
  return {
    id: o.id,
    marketId: o.marketId,
    ownerPubkey: o.ownerPubkey,
    leg: o.leg,
    side: o.side,
    priceBps: o.priceBps,
    sizeRemaining: o.sizeRemaining.toString(),
    sizeOriginal: o.sizeOriginal.toString(),
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

export type PlaceOrderInput = {
  marketId: string;
  ownerPubkey: string;
  leg: OutcomeLeg;
  side: OrderSide;
  priceBps: number;
  size: bigint;
};

export async function placeOrder(input: PlaceOrderInput): Promise<OrderDto> {
  if (input.priceBps < 0 || input.priceBps > 10_000) {
    throw new HttpError(400, "priceBps must be between 0 and 10000");
  }
  if (input.size <= 0n) {
    throw new HttpError(400, "size must be positive");
  }

  const market = await prisma.market.findUnique({ where: { id: input.marketId } });
  if (!market || market.status !== "ACTIVE") {
    throw new HttpError(404, "Market not found or not active");
  }

  const created = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        marketId: input.marketId,
        ownerPubkey: input.ownerPubkey,
        leg: input.leg,
        side: input.side,
        priceBps: input.priceBps,
        sizeRemaining: input.size,
        sizeOriginal: input.size,
        status: "OPEN",
      },
    });
    await matchIncomingOrder(tx, o.id);
    return tx.order.findUniqueOrThrow({ where: { id: o.id } });
  });

  return toOrderDto(created);
}

export async function cancelOrder(orderId: string, ownerPubkey: string): Promise<OrderDto | null> {
  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing || existing.ownerPubkey !== ownerPubkey) {
    return null;
  }
  if (existing.status === "FILLED" || existing.status === "CANCELLED") {
    return toOrderDto(existing);
  }

  const o = await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });
  return toOrderDto(o);
}

export async function listOrdersForOwner(
  ownerPubkey: string,
  opts?: { marketId?: string; status?: OrderStatus }
): Promise<OrderDto[]> {
  const rows = await prisma.order.findMany({
    where: {
      ownerPubkey,
      marketId: opts?.marketId,
      status: opts?.status,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return rows.map(toOrderDto);
}

export async function listTradesForMarket(marketId: string, take = 100): Promise<TradeDto[]> {
  const rows = await prisma.trade.findMany({
    where: { marketId },
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map((t) => ({
    id: t.id,
    marketId: t.marketId,
    makerOrderId: t.makerOrderId,
    takerOrderId: t.takerOrderId,
    priceBps: t.priceBps,
    size: t.size.toString(),
    createdAt: t.createdAt.toISOString(),
  }));
}
