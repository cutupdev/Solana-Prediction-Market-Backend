import type { Market, MarketStatus, Outcome } from "@prisma/client";
import { prisma } from "../db/prisma";
import type { MarketDto } from "../types/api";

function toDto(m: Market): MarketDto {
  return {
    id: m.id,
    slug: m.slug,
    chainMarketPda: m.chainMarketPda,
    question: m.question,
    description: m.description,
    yesMint: m.yesMint,
    noMint: m.noMint,
    collateralMint: m.collateralMint,
    resolvesAt: m.resolvesAt?.toISOString() ?? null,
    status: m.status,
    winningOutcome: m.winningOutcome,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}

export async function listMarkets(status?: MarketStatus): Promise<MarketDto[]> {
  const rows = await prisma.market.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toDto);
}

export async function getMarketBySlug(slug: string): Promise<MarketDto | null> {
  const m = await prisma.market.findUnique({ where: { slug } });
  return m ? toDto(m) : null;
}

export async function getMarketById(id: string): Promise<MarketDto | null> {
  const m = await prisma.market.findUnique({ where: { id } });
  return m ? toDto(m) : null;
}

export type CreateMarketInput = {
  slug: string;
  question: string;
  description?: string;
  chainMarketPda?: string;
  yesMint?: string;
  noMint?: string;
  collateralMint?: string;
  resolvesAt?: Date;
};

export async function createMarket(input: CreateMarketInput): Promise<MarketDto> {
  const m = await prisma.market.create({
    data: {
      slug: input.slug,
      question: input.question,
      description: input.description,
      chainMarketPda: input.chainMarketPda,
      yesMint: input.yesMint,
      noMint: input.noMint,
      collateralMint: input.collateralMint,
      resolvesAt: input.resolvesAt,
    },
  });
  return toDto(m);
}

export async function resolveMarket(
  id: string,
  winning: Outcome
): Promise<MarketDto | null> {
  try {
    const m = await prisma.market.update({
      where: { id },
      data: { status: "RESOLVED", winningOutcome: winning },
    });
    return toDto(m);
  } catch {
    return null;
  }
}
