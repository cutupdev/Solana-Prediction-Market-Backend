import type { Order, OrderSide, Prisma } from "@prisma/client";

function minBig(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

function nextOrderStatus(remaining: bigint): "OPEN" | "PARTIALLY_FILLED" | "FILLED" {
  if (remaining <= 0n) return "FILLED";
  return "PARTIALLY_FILLED";
}

/**
 * Price–time matching on a single outcome leg. Resting order is always **maker**; incoming is **taker**.
 */
export async function matchIncomingOrder(
  tx: Prisma.TransactionClient,
  incomingId: string
): Promise<void> {
  let incoming = await tx.order.findUnique({ where: { id: incomingId } });
  if (!incoming || incoming.status === "CANCELLED" || incoming.status === "FILLED") {
    return;
  }

  const opposite: OrderSide = incoming.side === "BID" ? "ASK" : "BID";

  while (incoming.sizeRemaining > 0n) {
    const priceFilter: Prisma.OrderWhereInput =
      incoming.side === "BID"
        ? { priceBps: { lte: incoming.priceBps } }
        : { priceBps: { gte: incoming.priceBps } };

    const candidate = await tx.order.findFirst({
      where: {
        marketId: incoming.marketId,
        leg: incoming.leg,
        side: opposite,
        id: { not: incoming.id },
        status: { in: ["OPEN", "PARTIALLY_FILLED"] },
        sizeRemaining: { gt: 0n },
        ...priceFilter,
      },
      orderBy:
        incoming.side === "BID"
          ? [{ priceBps: "asc" as const }, { createdAt: "asc" as const }]
          : [{ priceBps: "desc" as const }, { createdAt: "asc" as const }],
    });

    if (!candidate) {
      await tx.order.update({
        where: { id: incoming.id },
        data: {
          status: incoming.sizeRemaining === incoming.sizeOriginal ? "OPEN" : "PARTIALLY_FILLED",
        },
      });
      return;
    }

    const fill = minBig(incoming.sizeRemaining, candidate.sizeRemaining);
    const tradePriceBps = candidate.priceBps;

    await tx.trade.create({
      data: {
        marketId: incoming.marketId,
        makerOrderId: candidate.id,
        takerOrderId: incoming.id,
        priceBps: tradePriceBps,
        size: fill,
      },
    });

    const candRem = candidate.sizeRemaining - fill;
    const incRem = incoming.sizeRemaining - fill;

    await tx.order.update({
      where: { id: candidate.id },
      data: {
        sizeRemaining: candRem,
        status: nextOrderStatus(candRem),
      },
    });

    await tx.order.update({
      where: { id: incoming.id },
      data: {
        sizeRemaining: incRem,
        status: nextOrderStatus(incRem),
      },
    });

    const refreshed = await tx.order.findUnique({ where: { id: incoming.id } });
    if (!refreshed) return;
    incoming = refreshed;
  }
}
