'use client';


import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { ethers } from 'ethers';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Card from '../components/card';
import { useEffect, useState } from 'react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants/FundTokenContract';

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


  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center border-b py-4 px-6">
        <div className="text-lg font-bold">Logo</div>
        <ConnectButton />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center mt-10 px-4">
        <button className="bg-green-500 text-white px-6 py-3 rounded-full mb-10 hover:bg-green-600 transition">
          Get Your Piece... Connect Your Wallet To Start
        </button>

        <div className="py-10"></div>

        <div className="flex flex-col py-3 w-1/2 rounded-2xl overflow-hidden shadow-xl bg-white">
          {tokens.map((token, index) => (
            <div key={index} className="px-4 py-3 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs">
                <Image className="w-full h-full" src={"/" + token.name + '.png'} alt='Temp' width="64" height="64"/>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>{token.name}</span>
                  <span>{token.percentage}</span>
                </div>
                <div className="w-full bg-gray-200 h-3 rounded">
                  <div className="bg-blue-500 h-3 rounded" style={{ width: token.percentage }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

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

