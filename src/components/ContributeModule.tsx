import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContributeModal({ isOpen, onClose }: ContributeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [amount, setAmount] = useState('');

  const resetForm = () => {
    setAmount('');
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

  // Calculate 2x return
  const calculatedReturn = amount ? (parseFloat(amount) * 2).toFixed(2) : '';

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
            <h2 className="text-xl font-bold text-center mb-4">Contribute</h2>

        <div className="flex-1 text-center mb-4">
          <label className="block font-medium mb-1">Amount to Contribute (USDC)</label>
          <div className="flex items-center justify-center gap-2">
            <img
              src="/United States Dollar Coin.png"
              alt="USDC"
              className="w-6 h-6"
            />
            <input
              type="text"
              inputMode="decimal"
              className="w-full border rounded p-2 text-center"
              placeholder="Enter USDC amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="w-6" />
          </div>
        </div>

<div className="flex-1 mb-6 text-center">
      <label className="block font-medium mb-1">You Will Receive</label>
  <div className="flex items-center justify-center gap-2">
    {/* Ethereum Icon */}
    <img
      src="/fToken.png"
      alt="fToken"
      className="w-6 h-6"
    />

    {/* Input + Label grouped */}
      <input
        type="text"
        placeholder="fTokens!"
        className="w-full border rounded p-2 bg-gray-100 text-center"
        readOnly
        value={calculatedReturn ? `${calculatedReturn} fTokens` : ''}
      />
    <div className="w-6" />
    </div>
</div>

            <div className="flex items-center justify-between">
            <button
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
              onClick={onClose}
            >
              Contribute
            </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

