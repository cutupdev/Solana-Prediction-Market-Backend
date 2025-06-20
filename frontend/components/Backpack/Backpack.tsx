import React from 'react'
import {
  useWallet,
} from '@solana/wallet-adapter-react';
import {
  getParsedNftAccountsByOwner
} from "@nfteyez/sol-rayz";
import { get_nft_api_rec } from '@/utils/web3_api';
import { getNFTTokenAccount } from '@/utils/web3_api';
import getConfig from 'next/config';
import { PublicKey } from "@solana/web3.js";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Wheel from '../SpinWheel/SpinWheel';
import Link from 'next/link';
import Modal from '../Modal/Modal';
import EnterModal from '../Modal/EnterModal';
import Sparkles from 'react-sparkle'
import { useSocket } from '@/contexts/SocketContext';
import UserComp from './UserComp';
import RightComp from './RightComp';
import { sleep } from '@/utils/sleep';
import axios from 'axios';
import { TokenPocketWalletAdapter } from '@solana/wallet-adapter-wallets';

// export const COOL_DOWN = 100;
// export const WAITING_PERIOD = 69;
// export const COOL_DOWN = 231;
// export const WAITING_PERIOD = 200;
export const COOL_DOWN = 451;
export const WAITING_PERIOD = 420;


// export const COOL_DOWN = 100;
// export const WAITING_PERIOD = 69;

const { publicRuntimeConfig } = getConfig();
const RPC_URL = publicRuntimeConfig.rpcUrl;
interface Props {
  searchAddress: string,
}
export async function getSpinStatus(timestamp: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACK_URL + 'getSpinStatus';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ timestamp }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    let jsonData;
    try {
      jsonData = await response.json();
    } catch (error) {
      console.error("Error parsing JSON: ", error);
      // Optionally return or handle the error further here
    }
    return jsonData;
  } catch (err) {
    console.error("Error parsing JSON: ", err);
  }
}

export async function getJackpot() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACK_URL + 'getJackpot';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    let jsonData;
    try {
      jsonData = await response.json();
    } catch (error) {
      console.error("Error parsing JSON: ", error);
      // Optionally return or handle the error further here
    }
    return jsonData.result;
  } catch (err) {
    console.error("Error parsing JSON: ", err);
  }
}

export async function getTokenPrice(address: string) {
  try {
    const data = (await axios.post(`${process.env.NEXT_PUBLIC_BACK_URL}getTokenPrice`, { address: address })).data;

    if (data.success === true) {
      return data.price;
    } else {
      return 0;
    }

  } catch (err) {
    console.error("Error getting token price: ", err);
    return 0;
  }
}

const Backpack = () => {
  const [isRand, setIsRand] = React.useState(false);
  const [isSpin, setIsSpin] = React.useState(false);
  const [isSparkle, setIsSparkle] = React.useState(false);
  const [isLeft, setIsLeft] = React.useState(false);
  const [leftCount, setLeftCount] = React.useState(0);
  const [spinText, setSpinText] = React.useState(false);
  const [userEnterStatus, setUserEnterStatus] = React.useState(false);
  const [utcTimestamp, setUTCTimestamp] = React.useState<number | null>(null);
  const [jackValue, setJackValue] = React.useState({
    amount: 0,
    decimal: 3,
    symbol: 'TOKE',
    standard: 'normal',
    imageUri: "https://gateway.irys.xyz/QcppOvUHIMIzMOohBoe3wOm60qCogABYiYstUtLgPF8",
    price: 5,
    tokePrice: 0.1
  });

  const { counter, randValue, userArr, setUserArr, numberDecimals, setEnterModal, pastSpins, gameState, totalWager, setTotalWager, setPastSpins, futureJackpots, setFutureJackpots, spinNumber, setSpinNumber, spinAfterJackpot, setSpinAfterJackpot } = useSocket();

  const [count, setCount] = React.useState(70);

  const wallet = useWallet();

  React.useEffect(() => {

    const calculateUTCTimestamp = () => {
      const utcTimestamp = new Date().getTime();
      const remainder = (utcTimestamp / 1000) % COOL_DOWN;
      if (Math.floor(remainder) == 0) {
        setUsersInspin();
      }
      if (Math.ceil(remainder) < (COOL_DOWN - 30)) {
        setIsLeft(false);
        setCount(Math.floor((COOL_DOWN - 30) - remainder));
      } else {
        setCount(0);
      }
      if ((Math.ceil(remainder) > (COOL_DOWN - 31)) && (Math.ceil(remainder) < (COOL_DOWN - 24))) {
        setIsRand(true);
      } else {
        setIsRand(false);
      }
      if ((Math.ceil(remainder) > (COOL_DOWN - 25)) && (Math.ceil(remainder) < (COOL_DOWN - 14))) {
        setIsSpin(true);
        setSpinText(true);
      } else {
        setSpinText(false);
      }
      if ((Math.ceil(remainder) > (COOL_DOWN - 15)) && (Math.ceil(remainder) < (COOL_DOWN - 12))) {
        setIsSparkle(true);
      } else {
        setIsSparkle(false);
      }
      if ((Math.ceil(remainder) > (COOL_DOWN - 13)) && (Math.ceil(remainder) < COOL_DOWN)) {
        setIsLeft(true);
        setLeftCount(Math.floor(COOL_DOWN - remainder));
      } else {
        setIsLeft(false);
      }
      if (Math.floor(remainder) == (COOL_DOWN - 1)) {
        setIsSpin(false);
      }
      setUTCTimestamp(utcTimestamp);
    };
    // Clean up the socket connection when component unmounts
    // Calculate the UTC timestamp initially and update it every second
    calculateUTCTimestamp();
    const interval = setInterval(calculateUTCTimestamp, 1000);
    // Cleanup function to clear the interval when component unmounts
    return () => {
      clearInterval(interval);
    }
  }, []);

  React.useEffect(() => {
    if (wallet) {
      getUserEnterStatus();
    }
    // console.log('count ===> ', leftCount)
  }, [userArr, pastSpins, isLeft])

  React.useEffect(() => {
    setPastAndFuture();
    setUsersInspin();
    getSpinNumber();
  }, [])

  const setUsersInspin = async () => {
    try {
      const timeSt = new Date().getTime().toString();
      const arr = await getSpinStatus(timeSt);

      const jack = await getJackpot();
      const tokenPrice = await getTokenPrice(jack.tokenAddress);
      const tokePrice = await getTokenPrice(process.env.NEXT_PUBLIC_TOKEN_ADDRESS);

        
      if(!futureJackpots)
        setJackValue({
          amount: jack.amount,
          decimal: jack.decimal,
          symbol: jack.symbol,
          standard: jack.standard,
          imageUri: jack.imageUri,
          price: tokenPrice,
          tokePrice: tokePrice
        });
      // setJackValue(jack);
      const totalWager = arr[0]?.total_wager / Math.pow(10, numberDecimals);
      setTotalWager(totalWager);
      const tempArr = [] as any[];
      let futureSpins = [] as any[];

      if (arr[0] && arr[0]?.players) {
        futureSpins = (await axios.post(`${process.env.NEXT_PUBLIC_BACK_URL}getUserFutureSpins`, { players: arr[0].players, timestamps: timeSt })).data.spinLists;
      }

      if (arr[0]?.players) {
        for (const item of arr[0].players) {

          await sleep(200);

          const countItem = futureSpins.find(spins => spins.address === item.address);

          tempArr.push({
            id: item._id,
            address: item.address,
            amount: item.amount / Math.pow(10, numberDecimals),
            percent: ((item.amount / Math.pow(10, numberDecimals)) / totalWager * 100).toFixed(2),
            hasNFT: item?.hasNFT,
            counts: countItem ? countItem.counts : 0
          });
        }
      }

      // console.log('temp array on backpack ===> ', tempArr, 'length ===> ', tempArr.length)
      setUserArr([...tempArr]);
    } catch (err) {
      console.log('error in setUsersInspin ===> ', err);
    }
  }

  const setPastAndFuture = async () => {
    const localSpins = JSON.parse(localStorage.getItem('spins'));
    const localJackpots = JSON.parse(localStorage.getItem('jackpots'));
    if (!localSpins || !localJackpots) {
      await axios.get(`${process.env.NEXT_PUBLIC_BACK_URL}initialBrowser`);
    } else {
      setPastSpins([...localSpins]);
      setFutureJackpots([...localJackpots]);
    }
  }

  const getSpinNumber = async () => {
    const localSpin = JSON.parse(localStorage.getItem('spinNumber'));
    const spinAfterJackpot = JSON.parse(localStorage.getItem('spinAfterJackpot'));
    if (!localSpin || !spinAfterJackpot) {
      await axios.get(`${process.env.NEXT_PUBLIC_BACK_URL}initialBrowser`);
    } else {
      setSpinNumber(localSpin);
      setSpinAfterJackpot(spinAfterJackpot);
    }
  }

  const getUserEnterStatus = async () => {
    try {
      const timeSt = new Date().getTime().toString();

      const state = await getSpinStatus(timeSt);

      if (state && state[0] && state[0].players.length !== 0) {
        // Ensure wallet is defined before accessing its publicKey
        if (wallet && wallet.publicKey) {
          const findRes = state[0].players.find(x => x.address === wallet.publicKey.toBase58());

          // console.log('findRes ===> ', findRes)

          if (findRes) {
            setUserEnterStatus(true);
            return;
          } else {
            setUserEnterStatus(false);
          }
        } else {
          setUserEnterStatus(false); // Wallet is either null or doesn't have a publicKey
        }
      } else {
        setUserEnterStatus(false); // State is not valid or has no players
      }
    } catch (err) {
      console.log('error when fatching spin status ===> ', err);
    }
  }

  return (
    <div className='container'>
      <div className='flex flex-col md2:flex-row justify-center w-full gap-4 px-4 pb-4' >
        <Modal numberDecimals={numberDecimals} />
        <EnterModal numberDecimals={numberDecimals} jackValue={futureJackpots? futureJackpots[0].balance / Math.pow(10, futureJackpots[0].decimal) :jackValue.amount / Math.pow(10, jackValue.decimal)} />
        {isSparkle && <Sparkles />}
        <div className='flex flex-col w-full md2:w-[70%] lg:flex-row lg:w-[70%] gap-4'>
          <UserComp counter={counter} />
          <div className='flex order-1 lg:order-2 lg:w-[60%] flex-col gap-3 border border-box-border rounded-xl bg-boxBlack shadow-lg shadow-box-border'>
            <div className='w-full flex flex-col'>
              <div className='flex items-center justify-between px-1 border-b-box-border border-b-[1px] text-myText text-sm'>

                <div className='w-1/3 py-3 border-r-box-border border-r-[1px] text-center'>
                  {
                  futureJackpots
                  ?
                  (futureJackpots[0].balance / Math.pow(10, futureJackpots[0].decimal)).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  :
                  (jackValue.amount / Math.pow(10, jackValue.decimal)).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  } {futureJackpots ? futureJackpots[0].mintSymbol : jackValue.symbol}
                </div>
                <div className='w-1/3 py-3 border-r-box-border border-r-[1px] text-center'>
                  {totalWager.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} TOKE
                </div>
                <div className='w-1/3 py-3 text-center'>
                  SPIN: #{`${spinNumber ? spinNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'Loading...'}`}
                </div>
              </div>

              <div className='flex items-center justify-between px-1 border-b-box-border border-b-[1px] text-myText text-sm'>
                <div className='w-1/3 py-3 border-r-box-border border-r-[1px] text-center'>
                  $ {futureJackpots ?
                  ((futureJackpots[0].balance / Math.pow(10, futureJackpots[0].decimal)) * futureJackpots[0].price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  :
                  ((jackValue.amount / Math.pow(10, jackValue.decimal)) * jackValue.price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
                <div className='w-1/3 py-3 border-r-box-border border-r-[1px] text-center'>
                  $ {(totalWager * jackValue.tokePrice).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
                <div className='w-1/3 py-3 text-center'>
                  SINCE: +{`${spinAfterJackpot ? spinAfterJackpot.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'Loading...'}`}
                </div>
              </div>
            </div>

            <div className='flex relative'>
              <Wheel count={count} isRand={isRand} isSpin={isSpin} randValue={randValue} isLeft={isLeft} leftCount={leftCount} isSparkle={isSparkle} spinText={spinText} />
            </div>
            <div className='flex w-full h-full items-center justify-center p-2 min-h-24'>
              {
                wallet.connected ?
                  (
                    <button disabled={!count} onClick={() => { setEnterModal(true) }} className={`text-thick-grey  rounded-lg mx-4 w-full text-center font-semibold shadow-md hover:scale-105 duration-300 cursor-pointer py-2 ${count ? 'bg-myText' : 'bg-[#193975] cursor-not-allowed'}`}>
                      {userEnterStatus ? 'INCREASE BET' : 'ENTER NOW'}
                    </button>
                  ) : (
                    <WalletMultiButton />
                  )
              }
            </div>

          </div>
        </div>
        <RightComp jackValue={jackValue} count={count} />
      </div>

    </div>
  )
}

export default Backpack;