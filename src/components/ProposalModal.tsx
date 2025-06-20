// components/ProposalModal.tsx
import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState, useRef } from 'react';
import Image from "next/image";

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const tokenOptions = ['ETH', 'BTC', 'USDT', 'DAI', 'MATIC']; // you can customize this list

const tokenLogos: Record<string, string> = {
  ETH: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  BTC: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  USDT: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  DAI: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
  MATIC: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
};


export default function ProposalModal({ isOpen, onClose }: ProposalModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
const [fromToken, setFromToken] = useState('ETH');
const [toToken, setToToken] = useState('BTC');

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={modalRef}
            className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <h2 className="text-xl font-bold text-center mb-4">Your Proposal</h2>


        <div className="flex items-center justify-between gap-4 mb-4">
          {/* From token */}
          <div className="flex items-center gap-2 flex-1">
            <Image
              className="w-6 h-6"
              src={"/Wrapped Ethereum.png"}
              alt={"ETH"}
              width="64"
              height="64"
            />
            <select
              className="border rounded p-2 flex-1"
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
            >
              {tokenOptions.map((token) => (
                <option key={token} value={token}>{token}</option>
              ))}
            </select>
          </div>

          <span className="text-xl">&rarr;</span>

          {/* To token */}
          <div className="flex items-center gap-2 flex-1">
            <img src={tokenLogos[toToken]} alt={toToken} className="w-6 h-6" />
            <select
              className="border rounded p-2 flex-1"
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
            >
              {tokenOptions.map((token) => (
                <option key={token} value={token}>{token}</option>
              ))}
            </select>
          </div>
        </div>
                    
            

            <div className="text-center mb-2">
              <div className="w-6 h-6 bg-gray-300 mx-auto mb-2" /> {/* Placeholder icon */}
              <label className="block font-medium mb-1">Justification</label>
              <textarea
                className="w-full border rounded p-2 h-24 resize-none"
                placeholder="Enter justification..."
              />
            </div>

            <button
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
              onClick={onClose}
            >
              Submit
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

