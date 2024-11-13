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
  const [hasSpun, setHasSpun] = useState(false);

  const handleResult = (isWin: boolean) => {
    setPrize({
      name: isWin ? "You Won!" : "Next time!",
      color: isWin ? "#36A2EB" : "#FF6384"
    });
    setHasSpun(true);
    onResult(isWin);
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-4 md:p-8 my-auto">
              <div className="text-center mb-4 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Spin & Win!
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Try your luck at winning an exclusive prize
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 md:gap-8">
                <motion.div 
                  className="w-full md:flex-1"
                  animate={prize ? { x: -20 } : { x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <LuckyWheel onResult={handleResult} hasSpun={hasSpun} />
                </motion.div>

                <AnimatePresence mode="wait">
                  {prize && (
                    <motion.div
                      key="prize-result"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="w-full md:flex-1 text-center py-4 md:py-8"
                    >
                      <h3 className="text-3xl md:text-4xl font-bold mb-2 md:mb-4" style={{ color: prize.color }}>
                        {prize.name}
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-8">
                        {prize.name === "You Won!" 
                          ? "Congratulations! You've won a special prize!" 
                          : "Don't worry, your feedback is still valuable to us!"}
                      </p>
                      <button
                        onClick={onClose}
                        className="px-6 md:px-8 py-2 md:py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm md:text-base"
                      >
                        Close
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 