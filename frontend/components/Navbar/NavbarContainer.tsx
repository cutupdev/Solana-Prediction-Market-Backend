import React, { useEffect } from 'react'
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { BiSolidUserCircle } from "react-icons/bi";
import { BsWallet2 } from "react-icons/bs";
import { AiOutlineDollarCircle } from "react-icons/ai";
// import { wallet_scan } from '@/utils/wallet_scan';
import {
  useWallet
} from '@solana/wallet-adapter-react';
import { LuFerrisWheel } from "react-icons/lu";
import { GiAstronautHelmet } from "react-icons/gi";
import { HiMenu } from "react-icons/hi";
import { Snackbar } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
import { AiFillQuestionCircle } from "react-icons/ai";
import { formatNumber } from '@/utils/format_number';
import { GiParachute } from "react-icons/gi";
import { useSocket } from '@/contexts/SocketContext';
import axios from 'axios';
import FaqModal from '../Modal/FaqModal';
import { faucetSocket } from '@/contexts/FaucetSocket';
import CountDown from './CountDown';

async function getUserAmount(address: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACK_URL + 'getUserAmount';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    if (!response) return 0;

    return response.json();
  } catch (err) {
    console.log('error get user amount ===> ', err);
  }
}

const NavbarContainer = () => {
  const wallet = useWallet();
  const [isShow, setIsShow] = React.useState(false);
  const [isIn, setIsIn] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);
  const [totalUserBalance, setTotalUserBalance] = React.useState(0);
  const [isFaq, setIsFaq] = React.useState(false);
  const { faucetAmount, setFaucetAmount } = faucetSocket();
  const { alertState, setAlertState, isShowModal, setIsShowModal, currentDepositAmount, setCurrentDepositAmount, numberDecimals, backendWalletInf, setBackendWalletInf } = useSocket();
  const menuDropdown = React.useRef(null);
  const [faucetDate, setFaucetDate] = React.useState(0)
  const [countdown, setCountdown] = React.useState(0);
  const [faucetState, setFaucetState] = React.useState(false);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (menuDropdown.current && !menuDropdown.current.contains(event.target)) {
        setShowMobileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuDropdown]);

  React.useEffect(() => {
    const fun = async () => {
      const lastFaucet: number = JSON.parse(localStorage.getItem('lastFaucet'));
      if (!lastFaucet) {
        setFaucetAmount(30.000);
      } else {
        setFaucetAmount(lastFaucet);
      }

      if (wallet.connected && wallet.publicKey) {
        setIsConnected(true);
        if (wallet.publicKey) {
          const tempamount = await getUserAmount(wallet.publicKey.toString());
          const amount = parseInt(tempamount) / Math.pow(10, numberDecimals);
          setCurrentDepositAmount(amount);
        }
      } else {
        setIsConnected(false);
      }
    }
    fun();
  }, [wallet.connected])

  React.useEffect(() => {
    getMasterWallet(process.env.NEXT_PUBLIC_BACKEND_WALLET);
    getTotalUsersBalance();
  }, [])

  const getMasterWallet = async (address: string) => {
    try {
      // console.log('call backend for wallet scan')
      const walletInf = await axios.post(`${process.env.NEXT_PUBLIC_BACK_URL}walletScan`, { address: address });
      // console.log('finished wallet scanning ===> ', walletInf)
      if (walletInf && walletInf?.data) {
        const newInf = {
          nft: walletInf.data?.walletInf?.nft ? walletInf.data?.walletInf?.nft : 0,
          ft: walletInf.data?.walletInf?.ft ? walletInf.data?.walletInf?.ft : 0
        }
        setBackendWalletInf({ ...newInf });
      }
    } catch (err) {
      console.log('error during backend wallet scan ===> ', err);
    }
  }

  const getTotalUsersBalance = async () => {
    try {
      const totalBalance: any = await axios.get(`${process.env.NEXT_PUBLIC_BACK_URL}getTotalUserBalance`);
      // console.log('total user balance ===> ', totalBalance.data.total)
      setTotalUserBalance(totalBalance.data.total / 1000);
    } catch (err) {
      console.log('error during to get total user balance ===> ', totalUserBalance);
    }
  }

  const getFaucet = async () => {
    // { address: wallet.publicKey }
    console.log("wallet address ===> ", wallet.publicKey)
    try {
      // const response = await axios.post("https://api.faucet-bot.mctoken.xyz/faucet", { address: wallet.publicKey });
      const response = await axios.post(`${process.env.NEXT_PUBLIC_FAUCET_BACK_URL}faucet`, { address: wallet.publicKey });

      if (response?.data?.success) {
        localStorage.setItem('lastFaucet', JSON.stringify(response?.data?.amount));
        setFaucetAmount(response?.data?.amount);

        setAlertState({
          open: true,
          message: `You get faucet ${(response?.data?.amount).toFixed(3)} TOKE successfully!`,
          severity: undefined,
        })
        setFaucetState(false)
        getFaucetDate()
      }
    } catch (err) {
      setAlertState({
        open: true,
        message: `${err.response.data.msg}`,
        severity: undefined,
      })
    }
  }

  useEffect(() => {
    if (wallet.publicKey) {
      getFaucetDate()
    }
  }, [wallet.publicKey])

  useEffect(() => {
    if (faucetDate > 0) {
      const interval = setInterval(() => {
        setFaucetDate((prevDate) => prevDate - 1000); // Update the countdown every second
      }, 1000);

      return () => clearInterval(interval); // Cleanup the interval on unmount
    }
  }, [faucetDate]);

  const getFaucetDate = async () => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_FAUCET_BACK_URL}getTime`, { address: wallet.publicKey });
      if (!response?.data) {
        console.error('response error');
        return;
      }

      if (response?.data.newWallet) {
        setFaucetState(true)
      } else {
        const lastFaucetDate = new Date(response?.data.time);
        const currentData = Date.now()
        let _faucetDate = currentData - lastFaucetDate.getTime();
        if (_faucetDate >= 1000 * 60 * 60 * 24) {
          setFaucetState(true)
        } else {
          setFaucetState(false)
          setFaucetDate((1000 * 60 * 60 * 24) - _faucetDate)
        }
      }
    } catch (err) {
      console.error('Error getting faucet date:', err);
    }
  }

  return (
    <div className='w-full h-full border-b-[1px] border-box-border shadow-xl shadow-[#193975] relative flex flex-col'>
      <div className='container'>
        <div className='flex relative py-4 items-center justify-between px-2 custom-xs:px-6 sm:px-4 lg:max-w-full w-full gap-10'>
          <div className=' font-semibold text-sm xl:text-xl text-white'>
            McToken App
          </div>
          <div className='relative hidden md:flex'>
            <div className='flex items-center gap-4 text-[11px] 3.5xs:text-sm'>
              <AiFillQuestionCircle onClick={() => setIsFaq(true)} className='text-white text-3xl cursor-pointer hover:scale-110 duration-300' />
              <div className={`${isConnected ? '' : 'hidden'} text-white font-semibold flex items-center gap-[2px]`} onClick={() => { }}  >
                {/* <LuFerrisWheel className='bg-icon-bg text-white p-1 rounded-full text-2xl' /> */}
                <span className='text-myText pr-1'>
                  PROTOCOL :
                </span>
                <span className=''>
                  {backendWalletInf?.ft?.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") === '0.000' ?
                    'LOADING'
                    :
                    backendWalletInf?.ft?.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
              </div>
              <div className={`${isConnected ? '' : 'hidden'} text-white font-semibold flex items-center gap-[2px]`} onClick={() => { }}  >
                {/* <GiAstronautHelmet className='bg-icon-bg text-white p-1 rounded-full text-2xl' /> */}
                <span className='text-myText pr-1'>
                  PLAYERS :
                </span>
                <span className=''>{totalUserBalance.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
              </div><div className={`${isConnected ? '' : 'hidden'} text-white font-semibold cursor-pointer flex items-center gap-[2px]`} onClick={() => { setIsShow(!isShow) }}  >
                {/* <img src='mctoken.png' className='w-[20px] ml-1 aspect-square rounded-full' /> */}
                <span className='text-myText pr-1'>
                  ME :
                </span>
                <span className=''>{currentDepositAmount.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
              </div>
              <div className={`${wallet.publicKey ? "flex" : "hidden"} text-white items-center flex justify-center gap-[2px]`}>
                {faucetState ?
                  <div className='flex flex-row gap-1 justify-center items-center px-2 py-3 rounded-xl border-[#00FF2F] border-[1px] cursor-pointer hover:bg-thick-grey duration-300'
                    onClick={() => getFaucet()}  >
                    <img src="./img/machineBot.png" alt='FaucetImage' className='w-6 rounded-sm' />
                    <span className='text-white'>
                      : {faucetAmount.toFixed(3)}
                    </span>
                  </div>
                  :
                  <div className='flex flex-row gap-1 justify-center items-center px-2 py-3 rounded-xl border-[#FF0028] border-[1px] cursor-pointer hover:bg-thick-grey duration-300'>
                    <CountDown date={faucetDate} />
                  </div>
                }
              </div>
              <div className='flex items-center justify-center' >
                <WalletMultiButton />
              </div>
            </div>
            <div onMouseEnter={() => setIsIn(true)} onMouseLeave={() => setIsShow(!isShow)} className={`${isShow ? 'flex' : 'hidden'} text-white border border-[#313b47] rounded-lg flex-col p-4 gap-3 absolute top-[52px] right-20 z-[5] bg-modalBack`}>
              <div className='flex items-center gap-2'>
                <BiSolidUserCircle className='text-4xl' />
                <p className='max-w-[100px] truncate'>
                  {wallet.publicKey ? wallet.publicKey.toString() : 'undefined'}
                </p>
              </div>
              <div className='bg-modalLine flex flex-col rounded-lg border border-[#313b47] p-3 gap-3'>
                <div className='flex items-center gap-2 cursor-pointer w-full p-2 rounded-lg duration-300 hover:bg-thick-grey' onClick={() => {
                  setIsShowModal('deposit');
                  setIsShow(!isShow)
                  console.log(isShowModal);
                }}>
                  <BsWallet2 />
                  <p>Deposit</p>
                </div>
                <div className='flex items-center gap-2 cursor-pointer w-full p-2 rounded-lg duration-300 hover:bg-thick-grey' onClick={() => {
                  setIsShowModal('withdraw');
                  setIsShow(!isShow)
                }}>
                  <AiOutlineDollarCircle />
                  <p>Withdraw</p>
                </div>
              </div>
            </div>
          </div>

          <div className='relative flex md:hidden'>
            <div onClick={() => setShowMobileMenu(true)} className='rounded-full flex flex-col p-2 border-[1px] border-box-border text-myText text-xl cursor-pointer'>
              <HiMenu />
            </div>
            <div ref={menuDropdown} className={`${showMobileMenu ? "py-4 px-2 flex flex-col z-50 border-[1px] border-box-border shadow-md shadow-main-blue opacity-100" : "h-[0px] opacity-0"} transition-all duration-500 absolute top-11 right-0 w-[210px]  gap-3 rounded-lg bg-[#000000] object-cover`}>
              <div className={`${showMobileMenu ? "flex flex-col items-center gap-4" : "hidden"}`}>
                <div className={`${isConnected ? '' : 'hidden'} text-white font-semibold cursor-pointer flex items-center gap-[2px]`} onClick={() => { setIsShow(!isShow) }}  >
                  <span className='text-sm'>
                    {backendWalletInf?.ft?.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") === '0.000' ?
                      'LOADING'
                      :
                      backendWalletInf?.ft?.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                  <span className='uppercase text-xs pr-1'>
                    Toke
                  </span>
                  <LuFerrisWheel className='bg-icon-bg text-white p-1 rounded-full text-2xl' />
                </div>
                <div className={`${isConnected ? '' : 'hidden'} text-white font-semibold cursor-pointer flex items-center gap-[2px]`} onClick={() => { setIsShow(!isShow) }}  >
                  <span className='text-sm'>{totalUserBalance.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                  <span className='uppercase text-xs pr-1'>
                    Toke
                  </span>
                  <GiAstronautHelmet className='bg-icon-bg text-white p-1 rounded-full text-2xl' />
                </div><div className={`${isConnected ? '' : 'hidden'} text-white font-semibold cursor-pointer flex items-center gap-[2px]`} onClick={() => { setIsShow(!isShow) }}  >
                  <span className='text-sm'>{currentDepositAmount.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                  <span className='uppercase text-xs'>
                    Toke
                  </span>
                  <img src='mctoken.png' className='w-[25px] ml-1 aspect-square rounded-full' />
                </div>
                <div className={`${wallet.publicKey ? "flex" : "hidden"} text-white items-center flex justify-center gap-[2px]`}>
                {faucetState ?
                  <div className='flex flex-row gap-1 justify-center items-center px-2 py-3 rounded-xl border-[#00FF2F] border-[1px] cursor-pointer hover:bg-thick-grey duration-300'
                    onClick={() => getFaucet()}  >
                    <img src="./img/machineBot.png" alt='FaucetImage' className='w-6 rounded-sm' />
                    <span className='text-white'>
                      : {faucetAmount.toFixed(3)}
                    </span>
                  </div>
                  :
                  <div className='flex flex-row gap-1 justify-center items-center px-2 py-3 rounded-xl border-[#FF0028] border-[1px] cursor-pointer hover:bg-thick-grey duration-300'>
                    <CountDown date={faucetDate} />
                  </div>
                }
              </div>
                <div className='flex flex-row gap-3 items-center justify-center' >
                  <AiFillQuestionCircle onClick={() => setIsFaq(true)} className='text-white text-2xl cursor-pointer hover:scale-110 duration-300' />
                  <WalletMultiButton />
                </div>
              </div>
              <div onMouseEnter={() => setIsIn(true)} onMouseOver={() => setIsShow(!isShow)} className={`${isShow ? 'flex' : 'hidden'} text-white border border-[#313b47] rounded-lg flex-col p-4 gap-3 absolute top-[52px] right-20 z-[5] bg-modalBack`}>
                <div className='flex items-center gap-2'>
                  <BiSolidUserCircle className='text-4xl' />
                  <p className='max-w-[100px] truncate'>
                    {wallet.publicKey ? wallet.publicKey.toString() : 'undefined'}
                  </p>
                </div>
                <div className='bg-modalLine flex flex-col rounded-lg border border-[#313b47] p-3 gap-3'>
                  <div className='flex items-center gap-2 cursor-pointer w-full p-2 rounded-lg duration-300 hover:bg-thick-grey' onClick={() => {
                    setIsShowModal('deposit');
                    setIsShow(!isShow)
                    setShowMobileMenu(!showMobileMenu)
                    console.log(isShowModal);
                  }}>
                    <BsWallet2 />
                    <p>Deposit</p>
                  </div>
                  <div className='flex items-center gap-2 cursor-pointer w-full p-2 rounded-lg duration-300 hover:bg-thick-grey' onClick={() => {
                    setIsShowModal('withdraw');
                    setIsShow(!isShow)
                    setShowMobileMenu(!showMobileMenu)

                  }}>
                    <AiOutlineDollarCircle />
                    <p>Withdraw</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <Snackbar
            open={alertState.open}
            autoHideDuration={6000}
            onClose={() => setAlertState({ ...alertState, open: false })}
          >
            <Alert
              onClose={() => setAlertState({ ...alertState, open: false })}
              severity={alertState.severity}
              className='text-[red]'
            >
              {alertState.message}
            </Alert>
          </Snackbar>
        </div>
      </div>
      {isFaq &&
        <FaqModal isFaqState={isFaq} close={() => setIsFaq(false)} />
      }
    </div>
  )
}

export default NavbarContainer;