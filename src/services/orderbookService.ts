import type { OrderSide, OutcomeLeg } from "@prisma/client";
import { prisma } from "../db/prisma";
import type { OrderBookLevel, OrderBookSnapshot } from "../types/api";

const active = { in: ["OPEN", "PARTIALLY_FILLED"] as const };

async function aggregateSide(
  marketId: string,
  leg: OutcomeLeg,
  side: OrderSide
): Promise<OrderBookLevel[]> {
  const rows = await prisma.order.groupBy({
    by: ["priceBps"],
    where: {
      marketId,
      leg,
      side,
      status: active,
      sizeRemaining: { gt: 0n },
    },
    _sum: { sizeRemaining: true },
    orderBy: { priceBps: side === "BID" ? "desc" : "asc" },
  });

  return rows
    .map((r) => ({
      priceBps: r.priceBps,
      size: (r._sum.sizeRemaining ?? 0n).toString(),
    }))
    .filter((l) => l.size !== "0");
}

export async function getOrderBookSnapshot(
  marketId: string,
  leg: OutcomeLeg
): Promise<OrderBookSnapshot> {
  const [bids, asks] = await Promise.all([
    aggregateSide(marketId, leg, "BID"),
    aggregateSide(marketId, leg, "ASK"),
  ]);

  return {
    marketId,
    leg,
    bids,
    asks,
    asOf: new Date().toISOString(),
  };
}
