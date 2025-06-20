import '@/styles/globals.css'
import '../styles/styles.css'
import React from 'react';
import dynamic from "next/dynamic";
import getConfig from 'next/config';
import type { AppProps } from 'next/app';
import openPackContext from '@/contexts/OpenPackContext';
import userNftInfoContext from '@/contexts/UserNftInfoContext';
// import enterModalContext from '@/contexts/EnterModalContext';
import enterAlarmContext from '@/contexts/EnterAlarmContext';
import loadingContext from '@/contexts/LoadingContext';
import ClientWalletProvider from '@/contexts/ClientWalletProvider';
import SocketProvider from '@/contexts/SocketContext';
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";

import { useMemo, ReactNode } from "react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { Toaster } from 'react-hot-toast';
import randValueContext from '@/contexts/randValueContext';
import faqContext from '@/contexts/faqContext';
import FaucetSocketProvider from '@/contexts/FaucetSocket';
const { publicRuntimeConfig } = getConfig();

export default function App({ Component, pageProps }: AppProps) {
  const [isPack, setIsPack] = React.useState(false);
  const [userNFTInfo, setUserNFTInfo] = React.useState<any[]>([] as any[]);
  const [packNftInfo, setPackNftInfo] = React.useState(null as any);
  const [isShowModal, setIsShowModal] = React.useState('');
  // const [enterModal, setEnterModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [alarmContent, setAlarmContent] = React.useState('');
  const [currentDepositAmount, setCurrentDepositAmount] = React.useState(0);
  const [randValue, setRandValue] = React.useState(0);
  const [isFaq, setIsFaq] = React.useState(false);
  const ClientWalletProvider = dynamic(
    () => import("../contexts/ClientWalletProvider"),
    {
      ssr: false,
    }
  );
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const endpoint = publicRuntimeConfig.rpcUrl;
  return (
    <ConnectionProvider endpoint={endpoint}>
      <ClientWalletProvider>
        <SocketProvider>
          <FaucetSocketProvider>
            <openPackContext.Provider value={{ isPack, setIsPack, packNftInfo, setPackNftInfo }} >
              <userNftInfoContext.Provider value={{ userNFTInfo, setUserNFTInfo }} >
                <enterAlarmContext.Provider value={{ alarmContent, setAlarmContent }}>
                  {/* <enterModalContext.Provider value={{ enterModal, setEnterModal }}> */}
                  <loadingContext.Provider value={{ isLoading, setIsLoading }}>
                    <randValueContext.Provider value={{ randValue, setRandValue }} >
                      <faqContext.Provider value={{ isFaq, setIsFaq }} >
                        {/* <Toaster /> */}
                        <Component {...pageProps} />
                      </faqContext.Provider>
                    </randValueContext.Provider>
                  </loadingContext.Provider>
                  {/* </enterModalContext.Provider> */}
                </enterAlarmContext.Provider>
              </userNftInfoContext.Provider>
            </openPackContext.Provider>
          </FaucetSocketProvider>
        </SocketProvider>
      </ClientWalletProvider>
    </ConnectionProvider>

  )
}
