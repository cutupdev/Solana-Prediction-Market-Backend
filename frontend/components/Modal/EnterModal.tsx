import React from 'react';
import {
  useWallet,
} from '@solana/wallet-adapter-react';
// import enterModalContext from '@/contexts/EnterModalContext';
import toast from 'react-hot-toast';
import { useSocket } from '@/contexts/SocketContext';
import { wallet_scan } from '@/utils/wallet_scan';
import { getSpinStatus } from '../Backpack/Backpack';
import { getJackpot } from '../Backpack/Backpack';
import { GiConsoleController } from 'react-icons/gi';


interface Props {
  numberDecimals: number,
  jackValue: number
}
const EnterModal: React.FC<Props> = ({ numberDecimals, jackValue }) => {

  const [status, setStatus] = React.useState('');
  const wallet = useWallet();
  const { currentDepositAmount, setCurrentDepositAmount, setEnterModal, enterModal, backendWalletInf } = useSocket()

  React.useEffect(() => {
    checkAvailablilty();
  }, [])

  async function checkAvailablilty() {
    const timeSt = new Date().getTime().toString();
    const currentSpin = await getSpinStatus(timeSt);
    const totalWager = currentSpin.total_wager ? currentSpin.total_wager : 0;
  }

  async function requestDeposit(address: string, amount: string, times: string) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACK_URL + 'requestDeposit';
  
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, amount, times }),
      });
  
      if (!response.ok) {
        // throw new Error(`HTTP error! Status: ${response.status}`);
        setStatus(response.status.toString());
      }
      return response.json();
    } catch (err) {
      console.log('error fetching request deposit ===> ', err);
    }
  }
  // const { enterModal, setEnterModal } = React.useContext(enterModalContext);
  
  const [depoValue, setDepoValue] = React.useState(0);
  const [round, setRound] = React.useState(0);
  // const [withValue, setWithValue] = React.useState(0);
  const [err, setErr] = React.useState('');

  const handleDepo = async () => {
    const timeSt = new Date().getTime().toString();
    const jack = await getJackpot();
    const currentSpin = await getSpinStatus(timeSt);
    const totalWager = currentSpin?.[0]?.total_wager ?? 0;
    if (depoValue <= 0 || depoValue * round > currentDepositAmount || (totalWager/1000 + depoValue) * 10 > backendWalletInf?.ft || round <= 0) {
      console.log("total wager ===> ", totalWager/1000, "deposit value ===> ", depoValue, "backend balance ===> ", backendWalletInf?.ft, 'available value ===>', backendWalletInf?.ft/10 - totalWager/1000);
      setErr('Please Input Valid Value !');
    } else {
      setErr('');
      if (wallet.publicKey) {
        const timeSt = new Date().getTime().toString();
        // const state = await getSpinStatus(timeSt);
        // if (state && state[0] && state[0].players.length !== 0) {
        //   const findRes = state[0].players.find(x => x.address == wallet.publicKey.toBase58());
        //   if (findRes) {
        //     setErr('Already Entered this game !');
        //     return;
        //   }
        // }

        const suc = await requestDeposit(wallet.publicKey.toString(), (depoValue * Math.pow(10, numberDecimals)).toString(), round.toString());
        if (suc == "You can't deposit at this time!") {
          toast('Not deposit at this time!', {
            duration: 2000,
            position: 'bottom-center',

            // Styling
            style: {},
            className: 'text-[red]',

            // Custom Icon
            icon: '⏲',
            // Change colors of success/error/loading icon
            iconTheme: {
              primary: '#000',
              secondary: '#fff',
            },

            // Aria
            ariaProps: {
              role: 'status',
              'aria-live': 'polite',
            },
          });
        } else if (suc == "Deposit Amount is Larger than Limit!") {
          toast('Deposit Amount is Larger than Limit!', {
            duration: 2000,
            position: 'bottom-center',

            // Styling
            style: {},
            className: 'text-[red]',

            // Custom Icon
            icon: '❌',
            // Change colors of success/error/loading icon
            iconTheme: {
              primary: '#000',
              secondary: '#fff',
            },

            // Aria
            ariaProps: {
              role: 'status',
              'aria-live': 'polite',
            },
          });
        } else if (suc == "Deposit Success!") {
          // toast('Deposit Success!', {
          //     duration: 4000,
          //     position: 'bottom-center',

          //     // Styling
          //     style: {},
          //     className: '',

          //     // Custom Icon
          //     icon: '👏',

          //     // Change colors of success/error/loading icon
          //     iconTheme: {
          //         primary: '#000',
          //         secondary: '#fff',
          //     },

          //     // Aria
          //     ariaProps: {
          //         role: 'status',
          //         'aria-live': 'polite',
          //     },
          // });
        }
      }
      setEnterModal(false);
    }
  }
  return (
    <div className={`min-w-[100vw] min-h-screen flex items-center justify-center absolute top-0 left-0 bg-[#000007bb] z-10 duration-300 ${enterModal ? '' : 'invisible '}`}>
      <div className='p-10 rounded-lg bg-modalBack border border-[#313b47] z-10 flex flex-col relative text-white'>
        <div className='absolute right-2 top-4' onClick={() => setEnterModal(false)}>
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="text-white hover:scale-105 text-2xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"></path></svg>
        </div>
        <div className="mt-4 px-4">
          <div className="font-semibold uppercase text-2xl ">
            TOKE Per Round
          </div>
          <div className="flex flex-col">
            <input className="bg-[transparent] border border-white py-1 pl-4 pr-8 focus:outline-none rounded-md focus:ring-1 ring-white focus:border-none font-light text-white w-full" onChange={(e) => { setDepoValue(parseFloat(parseFloat(e.target.value).toFixed(3))) }} />
            {/* <div className='flex items-center mt-2 text-xs gap-2'>
                            <div className='flex items-center rounded-full border px-2 gap-1 border-white text-white'>
                                <img src='/yolo/solana.png' className=' w-5 aspect-square'/>
                                <p>0.01</p>
                            </div>
                            <div className='flex items-center rounded-full border px-2 gap-1 border-white text-white'>
                                <img src='/yolo/solana.png' className=' w-5 aspect-square'/>
                                <p>0.05</p>
                            </div>
                            <div className='flex items-center rounded-full border px-2 gap-1 border-white text-white'>
                                <img src='/yolo/solana.png' className=' w-5 aspect-square'/>
                                <p>0.1</p>
                            </div>
                        </div> */}
            <div className={`${err ? 'text-sm text-[red] mt-1' : 'hidden'}`}>
              {err}
            </div>
          </div>
        </div>
        <div className="mt-4 px-4">
          <div className="font-semibold uppercase text-2xl ">
            Rounds
          </div>
          <div className="flex flex-col">
            <input className="bg-[transparent] border border-white py-1 pl-4 pr-1 focus:outline-none rounded-md focus:ring-1 ring-white focus:border-none font-light text-white w-full" type='number' onChange={(e) => { setRound(parseInt(e.target.value)) }} />
          </div>
        </div>
        <div className='my-1 px-4'>
          <div className='flex items-center font-mono'>
            <div><span className='font-semibold text-sm'>Game Balance:</span>&nbsp;</div>
            <div className='italic text-myText font-bold'>{currentDepositAmount}</div>
          </div>
        </div>
        <div className='my-1 px-4'>
          <div className='flex items-center font-mono'>
            <div><span className='font-semibold text-sm'>Maximum Amount:</span>&nbsp;</div>
            <div className='italic text-myText font-bold'>{backendWalletInf?.ft/10}</div>
          </div>
        </div>
        {/* <div className='my-1 px-4'>
                    <div className='flex items-center'>
                        <div><span className='font-semibold text-sm'>Wallet Balance:</span>&nbsp;</div>
                        <div className='italic text-[yellow] font-bold'>4000</div>
                    </div>
                </div> */}
        <div className='w-full flex justify-center mt-6'>
          <button className='px-4 py-2 border relative border-white rounded-md font-semibold uppercase  bg-modalLine hover:scale-105 duration-300'
            onClick={handleDepo}>
            Enter Now
          </button>
        </div>

      </div>
    </div>
  )
}

export default EnterModal;