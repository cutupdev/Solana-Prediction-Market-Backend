import { Server, Socket } from "socket.io";
import dotenv from "dotenv"
import { createGame, createTxPool, enterGame, getJackpot, getPool, getTxPoolStatus, getUserpool, init, sleep, updateUserPool, setWithdraw, withdrawAble } from "./db";
import { BACKEND_WALLET, BACKEND_WALLET_KEYPAIR, COOL_DOWN, MINT_ADDRESS, SPL_TOKEN_PROGRAM } from "./config";
import { Connection, Keypair, ParsedAccountData, ParsedInnerInstruction, ParsedInstruction, ComputeBudgetProgram, PartiallyDecodedInstruction, PublicKey, sendAndConfirmTransaction, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountIdempotentInstruction, createTransferInstruction, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

dotenv.config();

const rpcUrl:any =  process.env.RPC;
export const solConnection = new Connection(rpcUrl, "confirmed")

export const autoDepositIx = async (
    recentStartTime: number,
    user: string,
    amount: number,
    times: number,
    io: Server
) => {
    try {
        init();

        for (let i = 0; i < times; i++) {
            const startTime = recentStartTime + i * COOL_DOWN;
            const poolResult = await getPool(startTime);

            if (poolResult === 1) {
                await enterGame(startTime, user, amount, io)
            } else {
                await createGame(startTime, user, amount, io);
            }
        }
    } catch (e) {
        // console.log(e, " : error from Auto Deposit Ix");
        return false;
    }
};

export const performTx = async (
    address: string,
    txId: string,
    io: Server
) => {
    try {
        init();
        // console.log("==============")

        const result = await getTxPoolStatus(txId);
        if (result === 1) {
            return 0;
        } else {
            let txInfo;
            for (let i = 0; ; i++) {
                await sleep(2000)
                txInfo = await getDataFromSignature(txId, io);

                // console.log(txInfo)
                if (txInfo !== undefined) {
                    break;
                }
                if (i > 30) {
                    io.emit("performedTx", address, "Time Out");
                    return;
                }
            }

        }
    } catch (err) {

    }

}

const getDataFromSignature = async (sig: string, io: Server) => {

    try {
        let tx = await solConnection.getParsedTransaction(sig, 'confirmed');
        if (tx && tx.meta && !tx.meta.err) {
            let length = tx.transaction.message.instructions.length;

            for (let i = length; i > 0; i--) {
                const ix = tx.transaction.message.instructions[i - 1] as ParsedInstruction

                if (ix.programId.toBase58() === SPL_TOKEN_PROGRAM) {
                    // console.log(ix, " =============> ix")
                    const srcAcc = await solConnection.getParsedAccountInfo(new PublicKey(ix.parsed.info.source));
                    const destAcc = await solConnection.getParsedAccountInfo(new PublicKey(ix.parsed.info.destination));
                    const src = (srcAcc.value?.data as ParsedAccountData).parsed.info.owner;
                    const dest = (destAcc.value?.data as ParsedAccountData).parsed.info.owner;
                    const amount = parseInt(ix.parsed.info.amount);

                    await createTxPool(sig, src, dest, amount);

                    if (dest === BACKEND_WALLET) {
                        await updateUserPool(src, amount, false, io);
                    }

                    if (src === BACKEND_WALLET) {
                        await updateUserPool(dest, amount, true, io);
                        
                    }

                    break;
                }

            }

            return true;

        }

    } catch (error) {
        // console.log("error:", error)
    }
}

export const getJackpotAmount = async () => {
    try {
        init();
        const result = await getJackpot();
        return result;
    } catch (e) {
        // console.log(e, " : error from get Jackpot Amount");
        return undefined;
    }
};

export const transferFromBackend = async (
    receiver: string,
    amount: number,
    io: Server
) => {
    await setWithdraw('doing', receiver);
    const limitAmount = await getUserpool(receiver);
    if (!limitAmount || limitAmount < amount) { return 0 }
    // console.log("----------")
    const senderKeypair = Keypair.fromSecretKey(new Uint8Array(BACKEND_WALLET_KEYPAIR))

    const source = await getAssociatedTokenAccount(new PublicKey(BACKEND_WALLET), new PublicKey(MINT_ADDRESS));
    const destination = await getAssociatedTokenAccount(new PublicKey(receiver), new PublicKey(MINT_ADDRESS));

    const updateCpIx = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 7_000_000 })
    const updateCuIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 })

    const transferIx = createTransferInstruction(
        source,
        destination,
        new PublicKey(BACKEND_WALLET),
        amount,
        [],
        TOKEN_PROGRAM_ID
    );

    sendAndConfirmTransaction(
        solConnection,
        new Transaction().add(updateCuIx, updateCpIx, transferIx),
        [senderKeypair],
    ).then(async (res) => {
        // console.log('Transaction confirmed with signature: ', res);
        await performTx(BACKEND_WALLET, res, io);
        await setWithdraw('possible', receiver);
        return true;
    }).catch(async (err) => {
        await setWithdraw('possible', receiver);
        console.error('Transaction failed: ', err);
    });

}

export const transferInDynamic = async (
    receiver: string,
    amount: number,
    tokenAddress: string
) => {
    try {
        // const senderKeypair = Keypair.fromSecretKey(new Uint8Array(BACKEND_WALLET_KEYPAIR))
        const source = await getAssociatedTokenAccount(new PublicKey(BACKEND_WALLET), new PublicKey(tokenAddress));
        const destination = await getAssociatedTokenAccount(new PublicKey(receiver), new PublicKey(tokenAddress));
        // const balance = (await solConnection.getTokenAccountBalance(source)).value.amount
        // console.log("balance ", balance)
        // const updateCpIx = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 7_000_000 })
        // const updateCuIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 })

        const transferIx = createTransferInstruction(
            source,
            destination,
            new PublicKey(BACKEND_WALLET),
            amount
        );
        // const createAtaBEIx = createAssociatedTokenAccountIdempotentInstruction(new PublicKey(BACKEND_WALLET), source, new PublicKey(BACKEND_WALLET), new PublicKey(tokenAddress))
        const createAtaDestIx = createAssociatedTokenAccountIdempotentInstruction(new PublicKey(BACKEND_WALLET), destination, new PublicKey(receiver), new PublicKey(tokenAddress))

        return [createAtaDestIx, transferIx]
    } catch (error) {
        console.log("error : ", error)
        return []
    }
    // const transferTx = new Transaction().add(updateCuIx, updateCpIx, createAtaBEIx, createAtaDestIx, transferIx)

    // transferTx.feePayer = senderKeypair.publicKey
    // transferTx.recentBlockhash = (await solConnection.getLatestBlockhash()).blockhash

    // await sendAndConfirmTransaction(
    //     solConnection,
    //     transferTx,
    //     [senderKeypair],
    // ).then(async (res) => {
    //     console.log('dynamic transaction success');
    //     // await performTx(BACKEND_WALLET, res, io);
    //     return true;
    // }).catch((err) => {
    //     console.error('Transaction failed: ', err);
    // });
}

const getAssociatedTokenAccount = async (ownerPubkey: PublicKey, mintPk: PublicKey): Promise<PublicKey> => {
    let associatedTokenAccountPubkey = (await PublicKey.findProgramAddress(
        [
            ownerPubkey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            mintPk.toBuffer(), // mint address
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    ))[0];
    return associatedTokenAccountPubkey;
}

export const getATokenAccountsNeedCreate = async (
    connection: Connection,
    walletAddress: PublicKey,
    owner: PublicKey,
    nfts: PublicKey[],
) => {
    let instructions = [], destinationAccounts = [];
    for (const mint of nfts) {
        const destinationPubkey = await getAssociatedTokenAccount(owner, mint);
        let response = await connection.getAccountInfo(destinationPubkey);
        if (!response) {
            const createATAIx = createAssociatedTokenAccountInstruction(
                destinationPubkey,
                walletAddress,
                owner,
                mint,
            );
            instructions.push(createATAIx);
        }
        destinationAccounts.push(destinationPubkey);
        if (walletAddress != owner) {
            const userAccount = await getAssociatedTokenAccount(walletAddress, mint);
            response = await connection.getAccountInfo(userAccount);
            if (!response) {
                const createATAIx = createAssociatedTokenAccountInstruction(
                    userAccount,
                    walletAddress,
                    walletAddress,
                    mint,
                );
                instructions.push(createATAIx);
            }
        }
    }
    return {
        instructions,
        destinationAccounts,
    };
}

export const createAssociatedTokenAccountInstruction = (
    associatedTokenAddress: PublicKey,
    payer: PublicKey,
    walletAddress: PublicKey,
    splTokenMintAddress: PublicKey
) => {
    const keys = [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
        { pubkey: walletAddress, isSigner: false, isWritable: false },
        { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
        {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new TransactionInstruction({
        keys,
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.from([]),
    });
}

export const tokenTransfer = async (
    instructions: TransactionInstruction[]
) => {
    console.log(instructions)
    const txs: Transaction[] = []
    if (instructions.length) {
        for (let i = 0; i < Math.ceil(instructions.length / 10); i++) {
            const downIndex = i * 10
            const upperIndex = (i + 1) * 10
            const tx = new Transaction()
            tx.add(
                ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 7_000_000 }),
                ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 })
            )
            for (let j = downIndex; j < upperIndex; j++) {
                if (instructions[j])
                    tx.add(instructions[j])
            }
            txs.push(tx)
        }
    }
    console.log(txs)

    const senderKeypair = Keypair.fromSecretKey(new Uint8Array(BACKEND_WALLET_KEYPAIR))
    if (txs.length) {
        for (let i = 0; i < txs.length; i++) {
            await sleep(500);
            txs[i].feePayer = senderKeypair.publicKey
            txs[i].recentBlockhash = (await solConnection.getLatestBlockhash()).blockhash
            const sig = await sendAndConfirmTransaction(solConnection, txs[i], [senderKeypair])
            console.log(`Transfer success : https://solscan.io/tx/${sig}`)

        }
    }
}

export const transfer2022InDynamic = async (
    receiver: string,
    amount: number,
    tokenAddress: string
) => {
    try {
        // const senderKeypair = Keypair.fromSecretKey(new Uint8Array(BACKEND_WALLET_KEYPAIR))
        const source = await getAssociatedToken2022Account(new PublicKey(BACKEND_WALLET), new PublicKey(tokenAddress));
        const destination = await getAssociatedToken2022Account(new PublicKey(receiver), new PublicKey(tokenAddress));
        // const balance = (await solConnection.getTokenAccountBalance(source)).value.amount
        // console.log("balance ", balance)
        // const updateCpIx = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 7_000_000 })
        // const updateCuIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 })

        const transferIx = createTransferInstruction(
            source,
            destination,
            new PublicKey(BACKEND_WALLET),
            amount,
            [],
            TOKEN_2022_PROGRAM_ID
        );

        const createAtaDestIx = createAssociatedTokenAccountIdempotentInstruction(new PublicKey(BACKEND_WALLET), destination, new PublicKey(receiver), new PublicKey(tokenAddress), TOKEN_2022_PROGRAM_ID)

        return [createAtaDestIx, transferIx]
    } catch (error) {
        console.log("error : ", error)
        return []
    }
}

const getAssociatedToken2022Account = async (ownerPubkey: PublicKey, mintPk: PublicKey): Promise<PublicKey> => {
    try {
        let associatedTokenAccountPubkey = (await PublicKey.findProgramAddress(
            [
                ownerPubkey.toBuffer(),
                TOKEN_2022_PROGRAM_ID.toBuffer(),
                mintPk.toBuffer(), // mint address
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID
        ))[0];
        return associatedTokenAccountPubkey;
    } catch (err) {
        console.log('error in getAssociatedTokenAccount ===> ', err);
        return new PublicKey('');
    }
}