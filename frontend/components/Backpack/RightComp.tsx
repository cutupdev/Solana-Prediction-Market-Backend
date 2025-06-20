import React, { useEffect, useState } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  useWallet,
} from '@solana/wallet-adapter-react';
// import enterModalContext from '@/contexts/EnterModalContext';
import { useSocket } from '@/contexts/SocketContext';
import axios from 'axios';
import { formatNumber } from '@/utils/format_number';
import { SiSonar } from "react-icons/si";
interface Props {
  jackValue: number,
  count: number
}
const RightComp = ({ jackValue, count }) => {
  const wallet = useWallet();

  // const { setEnterModal } = React.useContext(enterModalContext);
  const { socket, pastSpins, setPastSpins, futureJackpots, setFutureJackpots, setEnterModal, gameState, spinNumber, leaderboard } = useSocket();
  const [tableState, setTableState] = useState<string>("LAST SPINS");

  React.useEffect(() => {
    if (socket && socket.connected) {
      console.log("HERE")
      callGameState();
    }
  }, [socket && socket.connected])

  const callGameState = async () => {
    console.log("HERE2")
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_BACK_URL}getStates/`);
    } catch (err) {
      console.log('Fetching error during game states ===> ', err);
    }
  }


  const formatWalletAddress = (address: string) => {
    if (!address || address.length < 10) {
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
    <div className='flex order-2 lg:order-1 lg:w-[30%] min-h-[580px] flex-col pb-1 grow-0 border border-box-border rounded-xl bg-boxBlack shadow-lg shadow-[#193975] relative object-cover overflow-hidden'>
      <div className='flex items-center text-[10px] 3.5xs:text-[12px] text-myText border-b-box-border border-b-[1px] object-cover overflow-hidden'>
        <div onClick={() => setTableState("LAST SPINS")} className={`${tableState === "LAST SPINS" && "bg-myText text-white"} w-full text-center py-3 border-r-box-border font-semibold  border-r-[1px] cursor-pointer`}>SPINS</div>
        <div onClick={() => setTableState("NEXT JACKPOTS")} className={`${tableState === "NEXT JACKPOTS" && "bg-myText text-white"} w-full text-center font-semibold py-3  cursor-pointer`}>NEXT JACKPOTS</div>
        <div onClick={() => setTableState("LEADERBOARD")} className={`${tableState === "LEADERBOARD" && "bg-myText text-white"} w-full text-center font-semibold py-3 border-r-[1px] border-r-box-border cursor-pointer rounded-tr-lg`}>LEADERBOARD</div>
      </div>
      <div className="w-full h-[250px] overflow-auto md:overflow-visible">
        {tableState === "LAST SPINS" &&
          <table className="min-w-full text-thick-grey divide-y divide-gray-200 bottom-0 ">
            <thead>
              <tr className="text-myText border-b-[1px] border-b-box-border font-semibold px-1 text-[12px]">
                <th className="px-1 py-2 border-r-[1px] border-r-box-border text-center font-medium text-gray-500">No</th>
                <th className="px-1 py-2 border-r-[1px] border-r-box-border text-center font-medium text-gray-500">SPIN #</th>
                <th className="px-1 py-2 border-r-[1px] border-r-box-border text-center font-medium text-gray-500">WAGER</th>
                <th className="px-1 py-2 border-r-[1px] border-r-box-border text-center font-medium text-gray-500">RESULT</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {pastSpins?.map((item, index) =>
                <tr key={index} className='border-b-[1px] border-b-thick-grey text-[12px] text-gray-700'>
                  <td className="py-2 border-r-[1px] border-r-thick-grey text-center px-[2px]">
                    {index + 1}
                  </td>
                  <td className="py-2 border-r-[1px] border-r-thick-grey text-center px-[2px]">
                    {spinNumber ? (spinNumber - index).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'Loading...'}
                  </td>
                  <td className="py-2 border-r-[1px] border-r-thick-grey text-center">
                    {item ? (
                      item.total_wager != null ? (
                        (item.total_wager / 1000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " TOKE"
                      ) : (
                        'None'
                      )
                    ) : (
                      'None'
                    )}
                  </td>
                  <td className="py-2 border-r-[1px] border-r-thick-grey text-center">
                    {item ? (
                      <>
                        {item.result === 4 ? 'Jackpot' : ''}
                        {item.result === 0 ? 'Lost' : ''}
                        {(item.result > 0 && item.result < 4) ? item.result + "x" : ''}
                        {(item.result < 0 || item.result > 4 || item.result === undefined || item.result === null) ? 'Lost' : ''}
                      </>
                    ) : (
                      'Lost'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        }
        {tableState === "NEXT JACKPOTS" &&
          <table className="min-w-full text-thick-grey divide-y divide-gray-200 bottom-0 ">
            <thead>
              <tr className="text-myText border-b-[1px] border-b-box-border font-semibold px-1 text-[12px]">
                <th className="px-1 py-2 border-r-[1px] border-r-box-border text-center font-medium text-gray-500">No</th>
                <th className="px-1 py-2 border-r-[1px] border-r-box-border text-center font-medium text-gray-500">TOKEN</th>
                <th className="px-1 py-2 border-r-[1px] border-r-box-border text-center font-medium text-gray-500">AMOUNT</th>
                <th className="px-1 py-2 border-r-[1px] border-r-box-border text-center font-medium text-gray-500">VALUE</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {pastSpins?.map((item, index) =>
                <tr key={index} className={`border-b-[1px] border-b-thick-grey text-[12px] text-gray-700 ${index === 0 ? 'bg-[darkcyan]' : ''}`}>
                  <td className="py-2 border-r-[1px] border-r-thick-grey text-center px-[2px]">
                    {index + 1}
                  </td>
                  <td className="flex flex-row gap-2 justify-center items-center py-1 border-r-[1px] border-r-thick-grey text-center">
                    {futureJackpots[index]?.imageUri === 'No_Image' ?
                      <SiSonar height={30} width={30} />
                      :
                      <img src={futureJackpots[index]?.imageUri.replace('cf-ipfs.com', 'ipfs.io')} height={30} width={30} className='text-white text-4xl rounded-full' />
                    }
                    {futureJackpots[index]?.mintSymbol ? futureJackpots[index]?.mintSymbol : "LOADING"}
                  </td>
                  <td className="py-2 border-r-[1px] border-r-thick-grey text-center px-[2px]">{(futureJackpots[index]?.balance / Math.pow(10, futureJackpots[index]?.decimal)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                  <td className="py-2 border-r-[1px] border-r-thick-grey text-center px-[2px]">
                    $ {(futureJackpots[index]?.balance * futureJackpots[index]?.price / Math.pow(10, futureJackpots[index]?.decimal)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        }
        {tableState === "LEADERBOARD" &&
          <div className='flex flex-col w-full items-center border-t-box-border border-b-box-border border-t-[1px] border-b-[1px] text-[9px] md:text-[12px]'>
            <table className="min-w-full text-thick-grey divide-y divide-gray-200">
              <thead>
                <tr className="text-myText border-b-[1px] border-b-box-border font-semibold px-1">
                  <th className="px-1 py-2 border-r-[1px] border-r-box-border text-center font-medium text-gray-500">No</th>
                  <th className="px-1 py-2 border-r-[1px] border-r-box-border text-center font-medium text-gray-500">ADDRESS</th>
                  <th className="px-1 py-2 border-r-[1px] border-r-box-border text-center font-medium text-gray-500">SPINS</th>
                  <th className="px-1 py-2 border-r-[1px] border-r-box-border text-center font-medium text-gray-500">TOTAL WAGER</th>
                  <th className="px-1 py-2 text-center font-medium text-gray-500">JACKPOT</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {leaderboard?.map((item, index) =>
                  <tr key={index} className={`${index === 10 ? "" : "border-b-[1px] border-b-thick-grey"}`}>
                    <td className="py-2 border-r-[1px] border-r-thick-grey text-center px-[2px]">
                      {index + 1}
                    </td>
                    <td className="px-1 py-2 border-r-[1px] border-r-thick-grey text-center text-gray-700">{formatWalletAddress(item.address)}</td>
                    <td className="px-1 py-2 border-r-[1px] border-r-thick-grey text-center text-gray-700">{(item.enteredSpins).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                    <td className="px-1 py-2 border-r-[1px] border-r-thick-grey text-center text-gray-700">{(item.totalWager / 1000).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                    <td className="px-1 py-2 text-center text-gray-700">{(item.jackpots).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        }
      </div>
      <div className='flex flex-col w-full items-center border-t-box-border border-t-[1px] absolute bottom-0'>
        <div className='w-full py-2  text-[11px] 3.5xs:text-sm font-semibold text-myText text-center flex flex-col border-b-box-border border-b-[1px]'>
          ALL-TIME STATS
        </div>
        <table className="min-w-full text-thick-grey divide-y divide-gray-200 bottom-0 rounded-lg">
          <tbody className="text-white rounded-lg">
            {/* {gameState.map((item, index) => */}
            <tr key={0} className={`border-b-[1px] border-b-thick-grey text-sm text-gray-700`}>
              <td className="py-2 w-3/4 border-r-[1px] pl-2 border-r-thick-grey text-start">Total number of spins</td>
              <td className="py-2 w-1/4 text-end pr-2">{spinNumber ? spinNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'Loading...'}</td>
            </tr>
            <tr key={1} className={`border-b-[1px] border-b-thick-grey text-sm text-gray-700`}>
              <td className="py-2 w-3/4 border-r-[1px] pl-2 border-r-thick-grey text-start">Total jackpots in game</td>
              <td className="py-2 w-1/4 text-end pr-2">{gameState ? (gameState.numberOfJackpot).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'Loading...'}</td>
            </tr>
            <tr key={2} className={`border-b-[1px] border-b-thick-grey text-sm text-gray-700`}>
              <td className="py-2 w-3/4 border-r-[1px] pl-2 border-r-thick-grey text-start">Total amount of TOKE awarded</td>
              <td className="py-2 w-1/4 text-end pr-2">{gameState ? formatNumber(gameState.awardedAmount / 1000) : 'Loading...'}</td>
            </tr>
            <tr key={3} className={`border-b-[1px] border-b-thick-grey text-sm text-gray-700`}>
              <td className="py-2 w-3/4 border-r-[1px] pl-2 border-r-thick-grey text-start">Total unique wallets played game</td>
              <td className="py-2 w-1/4 text-end pr-2">{gameState ? (gameState.uniqueWallets).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'Loading...'}</td>
            </tr>
            <tr key={6} className={`text-sm text-gray-700`}>
              <td className="py-2 w-3/4 border-r-[1px] pl-2 border-r-thick-grey text-start">Longest spin for one jackpot</td>
              <td className="py-2 w-1/4 text-end pr-2">{gameState ? (gameState.longestSpin).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'Loading...'}</td>
            </tr>
            {/* )} */}
          </tbody>
        </table>
      </div>
    </div >
  )
}

export default RightComp;