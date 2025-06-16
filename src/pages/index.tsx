import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  const tokens = [
    { name: 'Ethereum', short: 'ETH', percentage: 'XX.XX%' },
    { name: 'Bitcoin', short: 'BTC', percentage: 'XX.XX%' },
    { name: 'Compound', short: 'COMP', percentage: 'XX.XX%' },
    { name: 'Uniswap', short: 'UNI', percentage: 'XX.XX%' },
  ];

  return (
    <div className="min-h-screen bg-white p-4 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center border-b py-4 px-6">
        <div className="text-lg font-bold">Logo</div>
        <ConnectButton />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center mt-10 px-4">
        <button className="bg-green-500 text-white px-6 py-3 rounded-full mb-10 hover:bg-green-600 transition">
          Get Your Piece
        </button>

        <div className="w-full max-w-2xl space-y-6">
          {tokens.map((token, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs">
                {token.short}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>{token.name}</span>
                  <span>{token.percentage}</span>
                </div>
                <div className="w-full bg-gray-200 h-3 rounded">
                  <div className="bg-blue-500 h-3 rounded" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="flex space-x-2 mt-10">
          {[...Array(5)].map((_, idx) => (
            <div
              key={idx}
              className="w-3 h-3 rounded-full bg-gray-400"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

