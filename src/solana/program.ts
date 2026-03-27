import * as anchor from "@coral-xyz/anchor";
import { readFileSync } from "fs";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import { getOptionalAuthorityKeypair } from "./wallet";

export type PredictionMarketIdl = anchor.Idl;

function loadIdl(): PredictionMarketIdl {
  const raw = readFileSync(env.predictionMarketIdlPath, "utf8");
  const idl = JSON.parse(raw) as PredictionMarketIdl;
  (idl as { address?: string }).address = env.predictionMarketProgramId;
  return idl;
}

class ReadOnlyWallet implements anchor.Wallet {
  constructor(readonly payer: Keypair) {}

  get publicKey(): PublicKey {
    return this.payer.publicKey;
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
    if (tx instanceof VersionedTransaction) {
      tx.sign([this.payer]);
      return tx;
    }
    tx.partialSign(this.payer);
    return tx;
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
    for (const t of txs) {
      await this.signTransaction(t);
    }
    return txs;
  }
}

export function getProgramId(): PublicKey {
  return new PublicKey(env.predictionMarketProgramId);
}

/**
 * Anchor `Program` bound to your IDL file. Without `SOLANA_AUTHORITY_SECRET_KEY`,
 * an ephemeral keypair is used so read-only RPC helpers still initialize; on-chain
 * signing from the server requires a real authority key.
 */
export function createAnchorProgram(connection: Connection): anchor.Program<PredictionMarketIdl> {
  const idl = loadIdl();
  const auth = getOptionalAuthorityKeypair();
  const kp = auth ?? Keypair.generate();
  if (!auth) {
    logger.warn(
      "No SOLANA_AUTHORITY_SECRET_KEY: using ephemeral keypair for Anchor provider (server cannot sign production txs)."
    );
  }
  const wallet = new ReadOnlyWallet(kp);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
  return new anchor.Program(idl, provider);
}
