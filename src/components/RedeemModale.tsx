import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import Web3Manager from '../lib/Web3Interface';

interface RedeemModalProps {
  usdcPrice: number;
  fTokenTotalSupply: number;
  tokenHoldings: number[];
  tokenNames: string[];
  tokenShorts: string[];
  isOpen: boolean;
  onSubmit?: (amount: number) => void;
  onClose: () => void;
}

export default function RedeemModal({ isOpen, onClose, onSubmit, fTokenTotalSupply, tokenHoldings, tokenNames, tokenShorts, usdcPrice }: RedeemModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [amount, setAmount] = useState('');
  const [usdcRedemptionAmount, setUsdcRedemptionAmount] = useState(0);

  const resetForm = () => {
    setAmount('');
    setUsdcRedemptionAmount(0);
  };

  // Reset when closed
  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Calculate USDC redemption amount when amount changes
  useEffect(() => {
    const calculateUsdcRedemption = async () => {
      if (!amount || !fTokenTotalSupply || fTokenTotalSupply === 0) {
        setUsdcRedemptionAmount(0);
        return;
      }
      
      const fTokenAmount = parseFloat(amount);
      const userShare = fTokenAmount / fTokenTotalSupply;
      
      try {
        const web3Manager = Web3Manager.getInstance();
        let totalUsdcValue = 0;
        
        // Get the fund assets to calculate their dollar values
        const fundAssets = await web3Manager.getFundAssets();
        
        for (let i = 0; i < fundAssets.length; i++) {
          const tokenAddress = fundAssets[i];
          const tokenDollarValue = await web3Manager.getERC20ValueInFund(tokenAddress);
          const userTokenDollarValue = userShare * parseFloat(tokenDollarValue);
          totalUsdcValue += userTokenDollarValue;
        }
        
        setUsdcRedemptionAmount(totalUsdcValue);
      } catch (error) {
        console.error('Error calculating USDC redemption:', error);
        setUsdcRedemptionAmount(0);
      }
    };

    calculateUsdcRedemption();
  }, [amount, fTokenTotalSupply]);

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
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <h2 className="text-xl font-bold text-center mb-4">Redeem</h2>

        <div className="flex-1 text-center mb-4">
          <label className="block font-medium mb-1">Amount to Redeem (fToken)</label>
          <div className="flex items-center justify-center gap-2">
            <img
              src="/fToken.png"
              alt="fToken"
              className="w-6 h-6"
            />
            <input
              type="text"
              inputMode="decimal"
              className="w-full border rounded p-2 text-center"
              placeholder="Enter fToken amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="w-6" />
          </div>
        </div>

<div className="flex-1 mb-6 text-center">
      <label className="block font-medium mb-1">You Will Receive</label>

    {/* USDC Redemption Display */}
    <div className="flex items-center justify-center gap-2 mb-4">
        {/* USDC Icon */}
        <img
          src="/United States Dollar Coin.png"
          alt="USDC"
          className="w-6 h-6"
        />
          <input
            type="text"
            placeholder="USDC"
            className="w-full border rounded p-2 bg-gray-100 text-center"
            readOnly
            value={amount ? `~${usdcRedemptionAmount.toFixed(6)} USDC` : ''}
          />
        <div className="w-6" />
    </div>
</div>

            <div className="flex items-center justify-between">
            <button
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
              onClick={onSubmit ? () => onSubmit(parseFloat(amount)) : undefined}
            >
              Redeem
            </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

