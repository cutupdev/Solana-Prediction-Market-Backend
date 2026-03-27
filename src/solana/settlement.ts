import { BN } from "@coral-xyz/anchor";
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { getConnection } from "./connection";
import { createAnchorProgram, type PredictionMarketIdl } from "./program";

export type PlaceOnChainOrderArgs = {
  legYes: boolean;
  sideBid: boolean;
  priceBps: number;
  size: bigint;
};

/**
 * Builds a **unsigned** versioned transaction for the connected wallet to sign.
 * Accounts must match your real program; adjust `.accounts({ ... })` after you wire IDL + PDAs.
 */
export async function buildUnsignedPlaceOnChainOrderTx(params: {
  feePayer: PublicKey;
  market: PublicKey;
  user: PublicKey;
  args: PlaceOnChainOrderArgs;
}): Promise<VersionedTransaction> {
  const connection = getConnection();
  const program = createAnchorProgram(connection);
  const ix = await program.methods
    .placeOnChainOrder(
      params.args.legYes,
      params.args.sideBid,
      params.args.priceBps,
      new BN(params.args.size.toString())
    )
    .accounts({
      market: params.market,
      user: params.user,
    } as Record<string, PublicKey>)
    .instruction();

  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  const message = new TransactionMessage({
    payerKey: params.feePayer,
    recentBlockhash: blockhash,
    instructions: [ix],
  }).compileToV0Message();

  return new VersionedTransaction(message);
}

export function serializeVersionedTx(tx: VersionedTransaction): string {
  return Buffer.from(tx.serialize()).toString("base64");
}

type MarketAccountClient = { fetch: (p: PublicKey) => Promise<unknown> };

/**
 * Fetch an on-chain market account if your IDL defines `market` and discriminators match the deployment.
 */
export async function fetchOnChainMarketAccount(marketPda: PublicKey): Promise<unknown | null> {
  const program = createAnchorProgram(getConnection());
  const marketNs = (program.account as unknown as { market?: MarketAccountClient }).market;
  if (!marketNs) return null;
  try {
    return await marketNs.fetch(marketPda);
  } catch {
    return null;
  }
}
