import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { TokenPair } from "../types/TokenPair";

interface ProposalModalProps {
  isOpen: boolean;
  supportedTokensShort: string[]
  supportedTokensName: string[]

  onClose: () => void;
  onSubmit: (tokenPairs: TokenPair[]) => void;
}

export default function ProposalModal({ isOpen, onClose, onSubmit, supportedTokensShort, supportedTokensName }: ProposalModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const initialFromToken = 'wETH';
  const initialToToken = 'cbBTC';

  // the state variable for the token pairs to keep track of the tokens
  // the user selects for the proposal
  const [tokenPairs, setTokenPairs] = useState<TokenPair[]>([
    { from: initialFromToken, to: initialToToken, amountFrom: '', amountTo: '' }
  ]);

  const [justification, setJustification] = useState('');

  const resetForm = () => {
    setTokenPairs([{ from: initialFromToken, to: initialToToken, amountFrom: '', amountTo: '' }]);
    setJustification('');
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

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
            className="bg-white p-6 rounded-lg w-full max-w-xl shadow-lg"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <h2 className="text-xl font-bold text-center mb-4">Your Proposal</h2>

            {/* Token Pair Selectors */}
            {tokenPairs.map((pair, index) => (
              <div key={index} className="flex items-center justify-between gap-2 mb-4">
                {/* FROM TOKEN + AMOUNT */}
                <div className="flex items-center gap-2 flex-1">
                    <img src={"/" + supportedTokensName[supportedTokensShort.indexOf(pair.from)] + ".png"} alt={pair.from} className="w-6 h-6" />
                  {/* FROM TOKEN SELECTOR */}
                  <select
                    className="border rounded p-2 flex-1"
                    value={pair.from}
                    onChange={(e) => {
                      const updated = [...tokenPairs];
                      updated[index].from = e.target.value;
                      setTokenPairs(updated);
                    }}
                  >
                    {supportedTokensShort.map(token => (
                      <option key={token} value={token}>{token}</option>
                    ))}
                  </select>
                {/* FROM TOKEN AMOUNT INPUT */}
                <input
                  type="text"
                  inputMode="decimal"
                  className="w-24 border rounded p-2 text-sm"
                  placeholder="Amount"
                  value={pair.amountFrom}
                  onChange={(e) => {
                    const updated = [...tokenPairs];
                    updated[index].amountFrom = e.target.value;
                    setTokenPairs(updated);
                  }}
                />
                </div>

                {/* CONDITIONAL ARROW */}
                  <span className="text-xl">&rarr;</span>

                {/* TO TOKEN + AMOUNT */}
                <div className="flex items-center gap-2 flex-1">
                  <img src={"/" + supportedTokensName[supportedTokensShort.indexOf(pair.to)] + ".png"} alt={pair.to} className="w-6 h-6" />
                  {/* TO TOKEN SELECTOR */}
                  <select
                    className="border rounded p-2 flex-1"
                    value={pair.to}
                    onChange={(e) => {
                      const updated = [...tokenPairs];
                      updated[index].to = e.target.value;
                      setTokenPairs(updated);
                    }}
                  >
                    {supportedTokensShort.map(token => (
                      <option key={token} value={token}>{token}</option>
                    ))}
                  </select>
                {/* TO TOKEN AMOUNT INPUT */}
                <input
                  type="text"
                  inputMode="decimal"
                  className="w-24 border rounded p-2 text-sm"
                  placeholder="Amount"
                  value={pair.amountTo}
                  onChange={(e) => {
                    const updated = [...tokenPairs];
                    updated[index].amountTo = e.target.value;
                    setTokenPairs(updated);
                  }}
                />
                </div>

                {/* DELETE BUTTON */}
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

            {/* ADD (+) BUTTON */}
            <button
              type="button"
              onClick={() =>
                setTokenPairs([...tokenPairs, { from: initialFromToken, to: initialToToken, amountFrom: '', amountTo: '' }])
              }
              className="flex items-center justify-center mx-auto mb-4 w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-xl font-bold"
            >
              +
            </button>

            {/* JUSTIFICATION TEXTAREA */}
            <div className="text-center mb-4">
              <label className="block font-medium mb-1">Justification</label>
              <textarea
                className="w-full border rounded p-2 h-24 resize-none"
                placeholder="Enter justification..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
              onClick={() => onSubmit(tokenPairs)}
            >
              Submit
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

