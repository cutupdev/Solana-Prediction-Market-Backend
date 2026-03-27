import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";
import { env } from "../config/env";
import { logger } from "../lib/logger";

export function getOptionalAuthorityKeypair(): Keypair | null {
  const raw = env.solanaAuthoritySecretKey;
  if (!raw?.trim()) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.every((n) => typeof n === "number")) {
      return Keypair.fromSecretKey(Uint8Array.from(parsed));
    }
  } catch {
    /* not JSON array */
  }
  try {
    return Keypair.fromSecretKey(bs58.decode(raw.trim()));
  } catch (e) {
    logger.error({ err: e }, "Failed to decode SOLANA_AUTHORITY_SECRET_KEY");
    throw new Error("Invalid SOLANA_AUTHORITY_SECRET_KEY");
  }
}
