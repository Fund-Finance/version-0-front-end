'use client';


import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants/FundTokenContract';
import { useAccount } from 'wagmi';

import GreeterMessage from '../components/GreeterMessage';
import UserButton from '../components/UserButton';

import TokenAllocationCard from '../components/TokenAllocationCard';

export default function Home() {
  const tokens = [
    { name: 'Ethereum', short: 'ETH', percentage: '25.0%' },
    { name: 'Bitcoin', short: 'BTC', percentage: '25.0%' },
    { name: 'Compound', short: 'COMP', percentage: '10.5%' },
    { name: 'Uniswap', short: 'UNI', percentage: '39.5%' },
  ];

  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

 const getValue = async () => {
     console.log("In function");
    try {
      if (!window.ethereum) throw new Error('MetaMask not found');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const result = await contract.name();
      setValue(result.toString());
    } catch (err) {
      setError(err.message);
    }
  };

  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center border-b py-4 px-6">
        <div className="text-lg font-bold">Logo</div>
        <ConnectButton />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center mt-10 px-4">
      {!isConnected && <GreeterMessage />}
      {isConnected &&
          <div className="flex items-center justify-center gap-[10vw] p-[2vw]">
          <UserButton width="40"> Contribute </UserButton>
            <div className="relative group w-50 h-50 rounded-full bg-gray-300 flex items-center justify-center transition-all duration-500 overflow-hidden cursor-pointer">
              {/* Default text in the circle */}
              <span className="text-black group-hover:opacity-0 transition-opacity duration-300 z-10 text-center">
                Total Invested $1,000,000,000
              </span>

              {/* Pie chart background (only visible on hover) */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Outer pie chart using conic gradient */}
                <div className="w-full h-full rounded-full bg-[conic-gradient(#3b82f6_0%_25%,#22c55e_25%_50%,#f59e0b_50%_75%,#ef4444_75%_100%)] relative">
                  {/* Inner white circle to create the hollow center */}
                  <div className="absolute top-1/2 left-1/2 w-45 h-45 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
              </div>
            </div>

          <UserButton width="40"> Redeem </UserButton>
          </div>}

          <UserButton> Submit a Proposal </UserButton>

        <div className="py-5"></div>
            <TokenAllocationCard tokens={tokens} />

        {/* Pagination dots */}
        <div className="flex flex-col space-x-2 mt-10">
          {[...Array(5)].map((_, idx) => (
            <div>
            <div
              key={idx}
              className="w-3 h-3 rounded-full bg-gray-400"
            />
            <div className="py-1" />
            </div>
          ))}
        </div>
        <button onClick={getValue} className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition"> test</button>
 {value && <p className="mt-4 text-lg">Value: {value}</p>}
      {error && <p className="mt-4 text-red-500">Error: {error}</p>}
      </div>
    </div>
  );
}

