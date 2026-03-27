import { Connection, type Commitment } from "@solana/web3.js";
import { env } from "../config/env";

const commitment: Commitment = "confirmed";

let connectionSingleton: Connection | null = null;

export function getConnection(): Connection {
  if (!connectionSingleton) {
    connectionSingleton = new Connection(env.solanaRpcUrl, { commitment });
  }
  return connectionSingleton;
}

export async function getHealthySlot(): Promise<number> {
  const conn = getConnection();
  return conn.getSlot("processed");
}
