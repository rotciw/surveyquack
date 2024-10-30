import { motion } from "framer-motion";

interface ProgressBarProps {
  totalCategories: number;
  currentCategoryIndex: number;
}

export function ProgressBar({ totalCategories, currentCategoryIndex }: ProgressBarProps) {
  const progress = ((currentCategoryIndex + 1) / totalCategories) * 100;
  const duckPosition = Math.max(0, Math.min(progress - 5, 93));

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="w-full h-8 bg-blue-50 relative overflow-hidden">
        <motion.div
          className="h-8 bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        
        <motion.div
          className="absolute top-[110%] -translate-y-1/2"
          initial={{ left: 0 }}
          animate={{ left: `${duckPosition}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.svg
            width="48"
            height="48"
            viewBox="0 0 100 100"
            className="transform -translate-x-1/2"
          >
            {/* Duck */}
            <motion.g
              animate={{
                y: [0, -2, 0],
                rotate: [0, -3, 0, 3, 0],
              }}
              transition={{
                y: {
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                },
                rotate: {
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut"
                }
              }}
            >
              {/* Body */}
              <circle cx="50" cy="50" r="25" fill="#FFE135"/>
              {/* White chest */}
              <path
                d="M35 55 A20 20 0 0 0 65 55"
                fill="#FFFFFF"
                strokeWidth="0"
              />
              {/* Head */}
              <circle cx="50" cy="35" r="20" fill="#FFE135"/>
              {/* Eyes */}
              <circle cx="43" cy="30" r="3" fill="#000000"/>
              <circle cx="57" cy="30" r="3" fill="#000000"/>
              {/* Beak */}
              <path d="M45 35 L70 37 L45 39 Z" fill="#FF8C00"/>
              {/* Shine */}
              <circle cx="40" cy="25" r="5" fill="#FFFFFF" fillOpacity="0.6"/>
            </motion.g>
          </motion.svg>
        </motion.div>
      </div>
      
      <div className="max-w-3xl mx-auto px-8">
        <div className="text-sm text-gray-500 py-2 text-right">
          Progress: {currentCategoryIndex + 1} / {totalCategories}
        </div>
      </div>
    </div>
  );
} 