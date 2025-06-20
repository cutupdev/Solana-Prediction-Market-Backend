import Navbar from '@/components/Navbar/Navbar'
import Backpack from '@/components/Backpack/Backpack'
import React from 'react';
export default function Home() {


  return (
    <div className='overflow-y-hidden h-full w-full min-w-full min-h-screen bg-[#000000] relative harlow'>
      <Navbar />
      <div className='mx-auto w-[calc(100vw-10px)] md:w-[calc(100vw-50px)] lg:w-[calc(100vw-100px)] h-full pt-10 flex items-center justify-center'>
        <Backpack />
      </div>
    </div>
  )
}
