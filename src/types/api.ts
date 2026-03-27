import type { MarketStatus, OrderSide, OrderStatus, Outcome, OutcomeLeg } from "@prisma/client";

export type MarketDto = {
  id: string;
  slug: string;
  chainMarketPda: string | null;
  question: string;
  description: string | null;
  yesMint: string | null;
  noMint: string | null;
  collateralMint: string | null;
  resolvesAt: string | null;
  status: MarketStatus;
  winningOutcome: Outcome | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderBookLevel = {
  priceBps: number;
  size: string;
};

export type OrderBookSnapshot = {
  marketId: string;
  leg: OutcomeLeg;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  asOf: string;
};

export type OrderDto = {
  id: string;
  marketId: string;
  ownerPubkey: string;
  leg: OutcomeLeg;
  side: OrderSide;
  priceBps: number;
  sizeRemaining: string;
  sizeOriginal: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type TradeDto = {
  id: string;
  marketId: string;
  makerOrderId: string;
  takerOrderId: string;
  priceBps: number;
  size: string;
  createdAt: string;
};
