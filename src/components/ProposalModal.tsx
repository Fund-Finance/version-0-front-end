import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TokenPair = {
  from: string;
  to: string;
};

const tokenOptions = ['ETH', 'BTC', 'USDT', 'DAI', 'MATIC'];

const tokenLogos: Record<string, string> = {
  ETH: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  BTC: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  USDT: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  DAI: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
  MATIC: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
};

export default function ProposalModal({ isOpen, onClose }: ProposalModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [tokenPairs, setTokenPairs] = useState<TokenPair[]>([
    { from: 'ETH', to: 'BTC' }
  ]);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

            {/* Token Pair Selectors */}
            {tokenPairs.map((pair, index) => (
              <div key={index} className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 flex-1">
                  <img src={tokenLogos[pair.from]} alt={pair.from} className="w-6 h-6" />
                  <select
                    className="border rounded p-2 flex-1"
                    value={pair.from}
                    onChange={(e) => {
                      const updated = [...tokenPairs];
                      updated[index].from = e.target.value;
                      setTokenPairs(updated);
                    }}
                  >
                    {tokenOptions.map(token => (
                      <option key={token} value={token}>{token}</option>
                    ))}
                  </select>
                </div>

                <span className="text-xl">&rarr;</span>

                <div className="flex items-center gap-2 flex-1">
                  <img src={tokenLogos[pair.to]} alt={pair.to} className="w-6 h-6" />
                  <select
                    className="border rounded p-2 flex-1"
                    value={pair.to}
                    onChange={(e) => {
                      const updated = [...tokenPairs];
                      updated[index].to = e.target.value;
                      setTokenPairs(updated);
                    }}
                  >
                    {tokenOptions.map(token => (
                      <option key={token} value={token}>{token}</option>
                    ))}
                  </select>
                </div>

                {/* Trash Button */}
                {tokenPairs.length > 1 && (
                  <button
                    onClick={() =>
                      setTokenPairs(tokenPairs.filter((_, i) => i !== index))
                    }
                    className="text-red-500 hover:text-red-700"
                    aria-label="Remove token pair"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}

            {/* Add New Token Pair */}
            <button
              type="button"
              onClick={() => setTokenPairs([...tokenPairs, { from: 'ETH', to: 'BTC' }])}
              className="flex items-center justify-center mx-auto mb-4 w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-xl font-bold"
            >
              +
            </button>

            {/* Justification */}
            <div className="text-center mb-4">
              <label className="block font-medium mb-1">Justification</label>
              <textarea
                className="w-full border rounded p-2 h-24 resize-none"
                placeholder="Enter justification..."
              />
            </div>

            {/* Submit Button */}
            <button
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
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

