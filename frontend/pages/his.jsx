import React from "react"
import DataTable from "react-data-table-component";
import Navbar from '@/components/Navbar/Navbar'
import { BsCoin, BsBoxArrowUpRight, BsArrowLeft } from "react-icons/bs";
import Link from 'next/link';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { DualRing } from 'react-awesome-spinners';
import { PublicKey } from '@solana/web3.js';


export default function History() {
    const [isLoading, setIsLoading] = React.useState(false);
    const wallet = useWallet();
    const tokenMint = new PublicKey(
        process.env.NEXT_PUBLIC_TOKEN_ADDRESS
    );
    const { connection } = useConnection();
    const { publicKey, signTransaction } = useWallet();
    const [hisArray, setHisArray] = React.useState();
    async function getHistory() {
        const apiUrl = process.env.NEXT_PUBLIC_BACK_URL + 'getHistory';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        if (!response) return 0;

        return response.json();
    }
    React.useEffect(() => {
        const getHisData = async () => {
            setIsLoading(true);
            const result = await getHistory();

            const mintInfo = await connection.getParsedAccountInfo(tokenMint)
            if (!mintInfo.value) throw new Error("Token info error")

            // @ts-ignore
            const numberDecimals = mintInfo.value.data.parsed.info.decimals ? mintInfo.value.data.parsed.info.decimals : 6;
            let tempArray = [];
            let tempIndex = result?.length;
            if (result.length) {
                result.forEach((item, index) => {
                    let tempUrEntry = 0;
                    if (item.players?.length) {
                        item.players.forEach((smallIt, index) => {
                            if (smallIt.address == wallet.publicKey?.toString()) {
                                tempUrEntry = smallIt.amount;
                            }
                        })
                    }
                    tempArray.push(
                        {
                            round: tempIndex--,
                            pool: item.total_wager ? item.total_wager / Math.pow(10, numberDecimals) : 0,
                            win: item.result,
                            urEntry: tempUrEntry / Math.pow(10, numberDecimals),
                            players: item.players?.length,
                            time: new Date(item.start_timestamp).toTimeString()
                        }
                    )
                })


            }
            setIsLoading(false);
            console.log(result, 'result');
            setHisArray(tempArray);
        }
        getHisData();
        console.log(wallet.publicKey?.toString(), 'wallet.publicKey?.toString()');

    }, [publicKey])
    const customStyles = {
        headCells: {
            style: {
                backgroundColor: '#0d0f51cc', // override the cell padding for head cells
                color: '#aaa',
                fontWeight: '600px'
            },
        },
        cells: {
            style: {
                backgroundColor: '#0d0f51dd',  // override the cell padding for data cells
            },
        },
    };
    const columnST = [
        {
            cell: (row) => (
                <div
                    className=''
                >
                    {row.round}
                </div>
            ),
            name: "Round",
            selector: "round",
            style: {
                color: "white",
                fontWeight: 500
                // marginLeft:"20px"
            },
            // sortable: true,
        },
        {
            cell: (row) => (
                <div
                    className=''
                >
                    {row.pool}
                </div>
            ),
            name: "Prize Pool",
            selector: "pool",
            style: {
                backgroundColor: "",
                color: "white",
                fontWeight: 500
                // marginLeft:"20px"
            },
            // sortable: true,
        },
        {
            cell: (row) => (
                <div
                    className=''
                >
                    {row.win}
                </div>
            ),
            name: "Win",
            selector: "win",
            style: {
                backgroundColor: "",
                color: "white",
                fontWeight: 500
                // marginLeft:"20px"
            },

            // sortable: true
        },
        {
            cell: (row) => (
                <div
                    className=''
                >
                    {row.urEntry ? row.urEntry : '-'}
                </div>
            ),
            name: "Your Entry",
            selector: "urEntry",
            style: {
                backgroundColor: "",
                color: "white",
                fontWeight: 500
                // marginLeft:"20px"
            },

        },
        {
            cell: (row) => (
                <div
                    className=''
                >
                    {row.players}
                </div>
            ),
            name: "Players",
            selector: "players",
            style: {
                backgroundColor: "",
                color: "white",
                fontWeight: 500
                // marginLeft:"20px"
            },

        },
        {
            cell: (row) => (
                <div
                    className=''
                >
                    {row.time}
                </div>
            ),
            name: "Start Time",
            selector: "time",
            style: {
                backgroundColor: "",
                color: "white",
                fontWeight: 500
                // marginLeft:"20px"
            },

        },
    ];
    return (
        <div className='min-h-screen h-full w-full min-w-full bg-mycellium'>
            <Navbar />
            <div className="mx-auto w-[calc(100vw-10px)] md:w-[calc(100vw-50px)] lg:w-[calc(100vw-100px)] min-h-full h-full mt-10 flex flex-col justify-center">
                <Link href='\' className="flex items-center text-myText gap-2 font-semibold cursor-pointer">
                    <BsArrowLeft />
                    <p>
                        Current Round
                    </p>
                </Link>
                <div className={`relative w-full rounded-3xl opponent visible flex items-center justify-center `}>
                    {
                        (!isLoading) ? (
                            <DataTable
                                className="mt-12 border-[black] z-0 bg-[#0d0f1166]"
                                columns={columnST}
                                overflowYOffset={true}
                                data={hisArray}
                                customStyles={customStyles}
                                pagination
                            />
                        ) : (
                            <div className="mt-10">
                                <DualRing color='rgb(38, 195, 255)' size='100' sizeUnit='px' />
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}
