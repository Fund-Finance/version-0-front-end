// components/ProposalModal.tsx
import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useRef } from 'react';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProposalModal({ isOpen, onClose }: ProposalModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

            <div className="flex justify-between mb-4 px-2">
              <span>XX ETH</span>
              <span>&rarr;</span>
              <span>YY BTC</span>
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

