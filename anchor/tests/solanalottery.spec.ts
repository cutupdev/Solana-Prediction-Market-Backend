import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { Solanalottery } from "../target/types/solanalottery";

describe("solanalottery", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.Solanalottery as Program<Solanalottery>;

  const solanalotteryKeypair = Keypair.generate();

  it("Is Initialized", async () => {
    const slot = await connection.getSlot();
    console.log("Current slot", slot);

    const initConfigIx = await program.methods
      .initializeConfig(
        new anchor.BN(0),
        new anchor.BN(0),
        new anchor.BN(slot + 10),
        new anchor.BN(10000)
      )
      .instruction();

    const blockhashContext = await connection.getLatestBlockhash();

    const tx = new anchor.web3.Transaction({
      blockhash: blockhashContext.blockhash,
      lastValidBlockHeight: blockhashContext.lastValidBlockHeight,
      feePayer: wallet.payer.publicKey,
    }).add(initConfigIx);

    const sig = await anchor.web3.sendAndConfirmTransaction(connection, tx, [
      wallet.payer,
    ]);
    console.log(sig);
  });
});
