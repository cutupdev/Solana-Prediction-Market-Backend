'use client'

import {getSolanalotteryProgram, getSolanalotteryProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useSolanalotteryProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getSolanalotteryProgramId(cluster.network as Cluster), [cluster])
  const program = getSolanalotteryProgram(provider)

  const accounts = useQuery({
    queryKey: ['solanalottery', 'all', { cluster }],
    queryFn: () => program.account.solanalottery.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['solanalottery', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ solanalottery: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useSolanalotteryProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useSolanalotteryProgram()

  const accountQuery = useQuery({
    queryKey: ['solanalottery', 'fetch', { cluster, account }],
    queryFn: () => program.account.solanalottery.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['solanalottery', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ solanalottery: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['solanalottery', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ solanalottery: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['solanalottery', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ solanalottery: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['solanalottery', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ solanalottery: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
