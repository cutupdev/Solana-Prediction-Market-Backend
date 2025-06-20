import React from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { AiFillEye, AiOutlineClockCircle } from "react-icons/ai";
import { useSocket } from '@/contexts/SocketContext';
import { BiSolidUserCircle } from "react-icons/bi";
import axios from "axios";

interface Props {
  counter: number,
}
const UserComp: React.FC<Props> = ({ counter }) => {
  const { leaderboard, setLeaderboard, userArr, totalWager } = useSocket();
  const wallet = useWallet();

  React.useEffect(() => {
    getLearderboard();
  }, [])

  const getLearderboard = async () => {
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_BACK_URL}getLeaderboard/`);
    } catch (err) {
      console.log('Fetching error during leaderboard ===> ', err);
    }
  }

  const formatWalletAddress = (address: string) => {
    if (!address || address.length < 8) {
      return 'No Address'
    }
    const firstFive = address.slice(0, 4)
    const lastThree = address.slice(-4)
    return `${firstFive}...${lastThree}`
  }

  const usersWalletAddress = (address: string) => {
    if (!address || address.length < 10) {
      return 'No Address'
    }
    // const firstFive = address.slice(0, 4)
    // const lastThree = address.slice(-4)
    return `${formatWalletAddress(address)}`
  }

  return (
    <div className='flex order-2 lg:order-1 lg:w-[40%] flex-col min-h-[700px] grow-0 py-2 border border-box-border rounded-xl bg-boxBlack shadow-lg shadow-[#193975] relative'>
      <div className='flex h-10 items-center justify-between pb-3 text-[11px] 3.5xs:text-sm px-4 border-b-box-border border-b-[1px] text-myText'>
        <div className='flex flex-row font-semibold'>{userArr?.length ? userArr?.length : 0} PLAYING</div>
        <div className='flex-row flex items-center gap-1 font-semibold'>
          <h1>{counter} WATCHING</h1>
          <AiFillEye className='text-xl' />
        </div>
      </div>
      <div className="w-full flex flex-row item-start text-[12px] justify-between border-b-box-border border-b-[1px] text-myText py-2 px-2">
        <span>PLAYER</span>
        <span>SPIN LEFT</span>
        <span>LVEIGHT</span>
      </div>
      <div className="w-full h-full flex flex-col item-start justify-start object-cover overflow-hidden overflow-y-scroll">
        {
          userArr?.map((item: any, index: number) =>
          (
            userArr.length && (
              <div key={index} className='flex flex-col w-full items-center gap-1 font-semibold border-b-[1px] border-b-box-border'>
                <div className={`${item.address === wallet.publicKey?.toBase58() ? "bg-[#f4c144]/70 hover:bg-[#f4c144]" : "bg-[#1845F3]/30 hover:bg-[#1845F3]"} relative w-full cursor-pointer duration-300`}>
                  <div className='flex items-center flex-row gap-2 py-1 px-2'>
                    {item.hasNFT ? <img src="/img/toke-nft.png" alt="logo" height={30} width={30} className='text-white text-4xl' /> : <img src="/img/toke.png" alt="logo" height={30} width={30} className='text-white text-4xl' />}
                    <div className='flex flex-col w-full'>
                      {/* <BiSolidUserCircle className='text-white text-4xl' /> */}
                      <div className='flex flex-row gap-1 max-w-[340px] justify-start'>
                        <p className='text-textGrey text-xs truncate'>
                          {usersWalletAddress(item.address)}
                        </p>
                      </div>
                      <div className='flex flex-row items-center justify-between gap-1 text-sm w-full'>
                        <h2 className='text-white text-sm'>
                          {(item.amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} TOKE
                        </h2>
                        <p className='text-white'>
                          {(item.counts).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Spins Left
                        </p>
                        <p className='text-white'>
                          {item.percent}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))
        }
      </div>

    </div >
  )
}
export default UserComp;