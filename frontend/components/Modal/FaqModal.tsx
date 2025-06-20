import React from 'react';
import faqContext from '@/contexts/faqContext';

const FaqModal = ({ isFaqState, close }: { isFaqState: boolean; close: () => void }) => {
  // const { isFaq, setIsFaq } = React.useContext(faqContext);

  return (
    <>
      <div className={`fixed inset-0 flex items-center justify-center bg-boxBlack z-10 transition-opacity duration-300 ${isFaqState ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className='p-10 py-20 rounded-lg bg-modalBack border border-[#313b47] z-10 flex flex-col relative text-white'>
          <div className='absolute right-2 top-4' onClick={() => close()}>
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="text-white hover:scale-105 text-2xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"></path></svg>
          </div>
          <div className="mt-4 px-4 font-semibold">
            <div className="font-semibold text-6xl uppercase text-center mb-8 ">
              How to Play</div>
            <div className="flex flex-col my-8">
              <div className='font-semibold text-2xl font-mono underline'>
                First, deposit TOKE into your game balance.
              </div>
              <ul className='text-lg ml-2 mt-2 list-disc list-inside'>
                <li>Connect your wallet.</li>
                <li>Click the token logo next to the wallet button.</li>
                <li>Click <span className='text-myText'>`Deposit`</span>.</li>
                <li>Enter the deposit amount and click the <span className='text-myText'>`Deposit`</span> button.</li>
              </ul>
            </div>
            <div className="flex flex-col my-8">
              <div className='font-semibold text-2xl font-mono underline'>
                Second, play with tokens (TOKE)
              </div>
              <ul className='text-lg ml-2 mt-2 list-disc list-inside'>
                <li>Click <span className='text-myText'>`Enter Now`</span>.</li>
                <li>Add the number of tokens (TOKE) to <span className='text-myText'>`TOKE PER ROUND`</span>.</li>
                <li>
                  You can add the number of rounds to <span className='text-myText'>`ROUNDS`</span>. <br />
                  <span className='ml-4 text-sm'>( For example, by adding numbers like "TOKE PER ROUND: 10; ROUNDS: 5", every 5 rounds you can bet 10 TOKE on the next round. )</span>
                </li>
                <li>You must not pay more than 10% of the jackpot amount.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>

  )
}

export default FaqModal;