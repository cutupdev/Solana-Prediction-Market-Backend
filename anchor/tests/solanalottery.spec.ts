import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Solanalottery } from "../target/types/solanalottery";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

describe("token-lottery", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);

  const program = anchor.workspace.Solanalottery as Program<Solanalottery>;

  const rngKp = anchor.web3.Keypair.generate();

  const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  const priorityIx = anchor.web3.ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 1,
  });

  it("Is initialized!", async () => {
    const slot = await connection.getSlot();
    console.log("Current slot", slot);

    const mint = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("collection_mint")],
      program.programId
    )[0];

    const metadata = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];

    const masterEdition = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];

    const initConfigIx = await program.methods
      .initializeConfig(
        new anchor.BN(0),
        new anchor.BN(0),
        new anchor.BN(slot + 10),
        new anchor.BN(10000)
      )
      .instruction();

    const initLotteryIx = await program.methods
      .initializeLottery()
      .accounts({
        masterEdition: masterEdition,
        metadata: metadata,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    const blockhashContext = await connection.getLatestBlockhash();

    const tx = new anchor.web3.Transaction({
      blockhash: blockhashContext.blockhash,
      lastValidBlockHeight: blockhashContext.lastValidBlockHeight,
      feePayer: wallet.payer.publicKey,
    })
      .add(initConfigIx)
      .add(initLotteryIx);

    const sig = await anchor.web3.sendAndConfirmTransaction(
      connection,
      tx,
      [wallet.payer],
      { skipPreflight: true }
    );
    console.log(sig);
  });
});
