import React, { useEffect, useState } from 'react';

interface CountDateProp {
  date: number; // The target date in milliseconds (future timestamp)
}

const CountDown: React.FC<CountDateProp> = ({ date }) => {
  const [countdown, setCountdown] = useState<number>(date); // Initialize the countdown with the remaining time

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1000); // Decrease by 1 second
    }, 1000);

    // Cleanup the interval on unmount
    return () => clearInterval(interval);
  }, [countdown]);

  useEffect(() => {
    setCountdown(date)
  }, [date])

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 1000 / 60 / 60);
    const minutes = Math.floor((time / 1000 / 60) % 60);
    return `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')}`;
  };

  return <span>{countdown > 0 ? formatTime(countdown) : '00:00'}</span>; // Show countdown or '00:00' when time is up
};

export default CountDown;
