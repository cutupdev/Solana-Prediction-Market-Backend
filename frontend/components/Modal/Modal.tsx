import React from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {useSocket} from '@/contexts/SocketContext';

import {
    createTransferInstruction,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
    getAccount
} from '@solana/spl-token';
import {
    PublicKey,
    Transaction,
    Connection,
    TransactionInstruction,
    LAMPORTS_PER_SOL,
    ComputeBudgetProgram,
} from '@solana/web3.js';
import { WalletContextState } from "@solana/wallet-adapter-react"
// import loadingContext from '@/contexts/LoadingContext';


const tokenMint = new PublicKey(
    process.env.NEXT_PUBLIC_TOKEN_ADDRESS
);
const treasuryWallet: PublicKey = new PublicKey(process.env.NEXT_PUBLIC_BACKEND_WALLET)



async function performTx(address: string, tx: string) {
    const apiUrl = process.env.NEXT_PUBLIC_BACK_URL + 'performTx';

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, tx }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    } else {
        return true;
    }
}

async function withdrawToken(address: string, amount: string) {
    const apiUrl = process.env.NEXT_PUBLIC_BACK_URL + 'withdrawToken';

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, amount }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    } else {
        return true;
    }
}

export const getTokenBalance = async (wallet: WalletContextState, connection: Connection) => {
    try {
        if (!wallet.publicKey) {
            console.log("Wallet not connected")
            return undefined
        }
        const sourceAccount = await getAssociatedTokenAddress(
            tokenMint,
            wallet.publicKey
        );

        const info = await connection.getTokenAccountBalance(sourceAccount);
        if (info.value.uiAmount == null) throw new Error('No balance found');

        return info.value.uiAmount;
    } catch (e) {
        return 0
    }
}


export const depositToken = async (wallet: WalletContextState, connection: Connection, depositAmount: number) => {
    try {
        if (!wallet || !wallet.publicKey) {
            console.log("Wallet not connected")
            return { signature: '', tokenBalance: 0 }
        }

        const sourceAccount = await getAssociatedTokenAddress(
            tokenMint,
            wallet.publicKey
        );

        const tresuryTokenAccount = await getAssociatedTokenAddress(
            tokenMint,
            treasuryWallet
        );

        const mintInfo = await connection.getParsedAccountInfo(tokenMint)
        if (!mintInfo.value) throw new Error("Token info error")

        // @ts-ignore
        const numberDecimals = mintInfo.value.data.parsed!.info.decimals;
        const updateCpIx = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 5_000_000 })
        const updateCuIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 })
        // create tx
        let tx = new Transaction();
        tx.add(updateCpIx, updateCuIx)
        // send token
        tx.add(createTransferInstruction(
            sourceAccount,
            tresuryTokenAccount,
            wallet.publicKey,
            depositAmount * Math.pow(10, numberDecimals)
        ))
        // send sol
        // .add(
        //     SystemProgram.transfer({
        //         fromPubkey: wallet.publicKey,
        //         toPubkey: tresuryTokenAccount,
        //         lamports: 0.01 * LAMPORTS_PER_SOL,
        //     })
        // );
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
        tx.feePayer = wallet.publicKey

        if (!wallet || !wallet.publicKey || !wallet.signTransaction)
            return null;

        const signedTx = await wallet.signTransaction(tx);
        const signature = await connection.sendRawTransaction(signedTx.serialize(), {
            skipPreflight: true
        })

        performTx(wallet.publicKey.toString(), signature);
        // connection.confirmTransaction(signature, "confirmed");

        // // send and confirm
        // const signature = await wallet.sendTransaction(tx, connection);
        // await connection.confirmTransaction(signature, "confirmed");

        // const log = `\x1b[32mTransaction Success!🎉\nhttps://solscan.io/tx/${signature}`
        // console.log(log)
        // const tokenBalance = await getTokenBalance(wallet, connection);

        return true;
    } catch (e) {
        console.warn(e)
        return { signature: '', tokenBalance: 0 }
    }
}

interface Props {
    numberDecimals: number
}
const Modal: React.FC<Props> = ({ numberDecimals }) => {
    const wallet = useWallet();

    const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=3b5315ac-170e-4e0e-a60e-4ff5b444fbcf');
    // const connection = new Connection(process.env.NEXT_PUBLIC_RPC);
    // const { connection } = useConnection();
    const { publicKey, signTransaction } = useWallet();
    const [tokenWallet, setTokenWallet] = React.useState(0);
    // const {  } = React.useContext(loadingContext);
    React.useEffect(() => {
        const getTokenAccountInfo = async () => {
            const currentValue = await getTokenBalance(wallet, connection)
            if (currentValue) {
                setTokenWallet(currentValue);
            }
        }
        getTokenAccountInfo();

    }, [publicKey])


    const { currentDepositAmount, setCurrentDepositAmount, isShowModal, setIsShowModal, isLoading, setIsLoading } = useSocket();
    const [depoValue, setDepoValue] = React.useState(0);
    const [withValue, setWithValue] = React.useState(0);
    const [err, setErr] = React.useState('');

    const handleWithDraw = async () => {
        if (withValue <= 0 || withValue > currentDepositAmount) {
            setErr('Please Input Valid Value !');
        } else {
            setIsLoading(true);
            setErr('');
            // setIsShowModal('');
            if (wallet.publicKey) {
                const fox = await withdrawToken(wallet.publicKey?.toString(), (withValue * Math.pow(10, numberDecimals)).toString());
            }
        }
    }
    const handleDepo = async () => {
        if (depoValue <= 0 || depoValue > tokenWallet) {
            setErr('Please Input Valid Value !');
        } else {
            setErr('');
            if (wallet.publicKey) {
                await depositToken(wallet, connection, depoValue);
                setIsLoading(true);

            }
            // setIsLoading(false);
            // setIsShowModal('');
        }
    }

    return (
        <>
            <div className={`min-w-[100vw] min-h-screen flex items-center justify-center absolute top-0 right-0 bg-[#000007bb] z-10 ${isShowModal ? 'visible' : 'invisible'}`}>
                <div className='p-10 rounded-lg bg-modalBack border border-[#313b47] z-10 flex flex-col relative text-white'>
                    <div className='absolute right-2 top-4' onClick={() => setIsShowModal('')}>
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="text-white hover:scale-105 text-2xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"></path></svg>
                    </div>
                    <div className="mt-4 px-4">
                        <div className="font-semibold text-4xl uppercase text-center mb-4 ">
                            {isShowModal == 'deposit' ? 'Deposit' : 'Withdraw'}</div>
                        <div className="flex flex-col">
                            {isShowModal == 'deposit' ?
                                <input className="bg-[transparent] border border-white py-2 pl-4 pr-8 focus:outline-none rounded-md focus:ring-1 ring-white focus:border-none font-light text-white w-full" onChange={(e) => { setDepoValue(parseFloat(parseFloat(e.target.value).toFixed(3))) }} />
                                : <input className="bg-[transparent] border border-white py-2 pl-4 pr-8 focus:outline-none rounded-md focus:ring-1 ring-white focus:border-none font-light text-white w-full" onChange={(e) => { setWithValue(parseFloat(parseFloat(e.target.value).toFixed(3))) }} />
                            }
                            <div className={`${err ? 'text-sm text-[red] mt-1' : 'hidden'}`}>
                                {err}
                            </div>
                        </div>
                    </div>
                    <div className='mt-10 px-4'>
                        <div className='flex items-center'>
                            <div><span className='font-semibold text-base font-mono'>Game Balance:</span>&nbsp;</div>
                            <div className='italic text-myText font-bold font-mono'>{currentDepositAmount}</div>
                        </div>
                    </div>
                    <div className='my-2 px-4'>
                        <div className='flex items-center'>
                            <div><span className='font-semibold text-base font-mono'>Wallet Balance:</span>&nbsp;</div>
                            <div className='italic text-myText font-bold font-mono'>{Math.floor(tokenWallet)}</div>
                        </div>
                    </div>
                    <div className='w-full flex justify-center mt-6'>
                        <button className={`${isLoading ? 'cursor-not-allowed' : ''} px-4 py-2 w-25 h-12 flex items-center justify-center text-center relative border border-white rounded-md font-semibold uppercase  bg-modalLine hover:scale-105 duration-300`}
                            disabled={isLoading}
                            onClick={isShowModal == 'deposit' ? handleDepo : handleWithDraw}>
                            {isLoading ? (
                                <div className={`relative inline-block h-6 w-6 animate-spin text-white rounded-full border-4 border-solid border-current border-r-[transparent] align-[-0.125em]  motion-reduce:animate-[spin_1.5s_linear_infinite]`}
                                    role="status">
                                </div>
                            ) : isShowModal == 'deposit' ? 'Deposit' : 'Withdraw'}
                        </button>
                    </div>
                </div>
            </div>
        </>

    )
}

export default Modal;