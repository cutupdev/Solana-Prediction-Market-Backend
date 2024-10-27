// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import SolanalotteryIDL from '../target/idl/solanalottery.json'
import type { Solanalottery } from '../target/types/solanalottery'

// Re-export the generated IDL and type
export { Solanalottery, SolanalotteryIDL }

// The programId is imported from the program IDL.
export const SOLANALOTTERY_PROGRAM_ID = new PublicKey(SolanalotteryIDL.address)

// This is a helper function to get the Solanalottery Anchor program.
export function getSolanalotteryProgram(provider: AnchorProvider) {
  return new Program(SolanalotteryIDL as Solanalottery, provider)
}

// This is a helper function to get the program ID for the Solanalottery program depending on the cluster.
export function getSolanalotteryProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Solanalottery program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return SOLANALOTTERY_PROGRAM_ID
  }
}
