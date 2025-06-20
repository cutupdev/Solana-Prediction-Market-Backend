import React, { useState, useEffect } from 'react';
import { DualRing, Ring } from 'react-awesome-spinners';
interface Props {
  count: number,
  isRand: boolean,
  isSpin: boolean,
  randValue: number | undefined,
  isLeft: boolean,
  leftCount: number,
  isSparkle: boolean,
  spinText: boolean
}
const SpinWheel: React.FC<Props> = ({ count, isSpin, isRand, randValue, isLeft, leftCount, isSparkle, spinText }) => {

  const [angle, setAngle] = useState<number>(0);
  // const [alert, setAlert] = useState(false);
  // useEffect(() => {
  //   const calculateUTCTimestamp = () => {
  //     const utcTimestamp = Date.UTC(
  //       new Date().getUTCFullYear(),
  //       new Date().getUTCMonth(),
  //       new Date().getUTCDate(),
  //       new Date().getUTCHours(),
  //       new Date().getUTCMinutes(),
  //       new Date().getUTCSeconds(),
  //       new Date().getUTCMilliseconds()
  //     );
  //     const remainder = (utcTimestamp / 1000) % 100;
  //   };

  //   // Calculate the UTC timestamp initially and update it every second
  //   calculateUTCTimestamp();
  //   const interval = setInterval(calculateUTCTimestamp, 1000);

  //   // Cleanup function to clear the interval when component unmounts
  //   return () => clearInterval(interval);
  // }, [alert]);

  useEffect(() => {
    if (isSpin) {
      if (randValue == 0) {
        setAngle(1764);
      } else if (randValue == 1.5) {
        setAngle(1908);
      } else if (randValue == 1.2) {
        setAngle(1872);
      } else if (randValue == 2) {
        setAngle(1800);
      } else if (randValue == 4) {
        setAngle(1836);
      }
    }
  }, [isSpin, randValue])
  // useEffect(() => {
  //   if (isSpin) {
  //     const img = document.getElementById('rotatingImg');
  //     if (img) {
  //       img.style.setProperty('--rotation-deg', `${angle}deg`);
  //     }
  //   }
  // }, [isSpin]);

  return (

    <div className='flex top-2 w-full h-full items-center justify-center relaitve' >
      <img src='/yolo/arrow.png' className=' max-h-20 z-[8] absolute top-0' style={{ rotate: '90deg' }} />
      <div className='relative w-full h-full flex items-center justify-center px-4'>
        <img id="rotatingImg" src='/yolo/spin.png' alt='fox' className={`${isSpin ? 'cus-rotate' : ''} mt-10`} style={{ '--rotation-deg': `${angle}deg` } as any} />
        <div className={`${count ? 'vertical-shake' : 'hidden'} w-[70px] absolute top-[calc(50%-8px)] text-center left-[calc(50%-40px)] text-5xl font-bold  text-myText`}>
          {count}
        </div>
        <div className={`${(spinText) ? '' : 'hidden'} w-[70px] absolute top-[calc(50%-40px)] text-center left-[calc(50%-65px)] text-6xl font-bold  text-myText`}>
          <Ring color='rgb(38, 195, 255)' size='110' sizeUnit='px' />
          <div className='absolute top-[calc(50%+10px)] left-[calc(50%-10px)] text-base'>
            Rotating
          </div>
        </div>
        <div className={`${(isRand) ? '' : 'hidden'} w-[70px] absolute top-[calc(50%-30px)] text-center left-[calc(50%-55px)] text-6xl font-bold  text-myText`}>
          <DualRing color='rgb(38, 195, 255)' size='100' sizeUnit='px' />
          <div className='absolute top-[calc(50%-2px)] left-[calc(50%-35px)] text-base'>
            Randomizing
          </div>
        </div>
        <div className={`${isSparkle ? '' : 'hidden'} ${randValue == 0 ? 'text-[#4291ce]' : 'text-myText'} w-[80px] absolute top-[calc(50%-8px)] text-center left-[calc(50%-35px)] text-4xl font-bold  `}>
          <div className='relative'>
            {randValue == 0 ? 'Lost' : randValue == 4 ? 'Jackpot' : `${randValue!}X`}
          </div>
        </div>

        <div className={`${isLeft ? 'vertical-shake' : 'hidden'} w-[180px] absolute top-[calc(50%)] text-center left-[calc(50%-85px)] text-2xl font-bold  text-[#43afee]`}>
          Next Round: {leftCount}
        </div>
      </div>
    </div>
  )
}

export default SpinWheel;