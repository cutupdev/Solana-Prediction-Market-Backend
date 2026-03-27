import { PublicKey } from "@solana/web3.js";
import { getProgramId } from "./program";

/**
 * Example PDA layout — **must match** your on-chain `seeds` in the Anchor program.
 * Replace seeds with your program's actual derivation.
 */
export function deriveMarketPda(questionHash32: Uint8Array): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("market"), Buffer.from(questionHash32)], getProgramId());
}
