import { motion, AnimatePresence } from "framer-motion";
import { LuckyWheel } from "./LuckyWheel";
import { useState } from "react";

interface WheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (isWin: boolean) => void;
}

export function WheelModal({ isOpen, onClose, onResult }: WheelModalProps) {
  const [prize, setPrize] = useState<{ name: string; color: string } | null>(null);

  const handleWheelResult = (isWin: boolean) => {
    setPrize({
      name: isWin ? "10% OFF your next purchase!" : "Better luck next time!",
      color: isWin ? "#36A2EB" : "#FF6384"
    });
  };

  const handleClose = () => {
    onResult(prize?.color === "#36A2EB");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {prize ? "Your Prize!" : "Spin & Win!"}
                </h2>
                <p className="text-gray-600">
                  {prize ? "Here's what you won:" : "Try your luck at winning an exclusive prize"}
                </p>
              </div>

              {!prize ? (
                <LuckyWheel onResult={handleWheelResult} />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <h3 className="text-4xl font-bold mb-4" style={{ color: prize.color }}>
                    {prize.name}
                  </h3>
                  <button
                    onClick={handleClose}
                    className="mt-6 px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 