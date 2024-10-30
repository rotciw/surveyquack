import { motion, useAnimation } from "framer-motion";
import { useState } from "react";

interface WheelSegment {
  name: string;
  isWin: boolean;
  color: string;
  probability: number;
}

interface LuckyWheelProps {
  onResult: (isWin: boolean) => void;
}

export function LuckyWheel({ onResult }: LuckyWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const controls = useAnimation();

  const segments: WheelSegment[] = [
    { name: "WIN!", isWin: true, color: "#36A2EB", probability: 30 },
    { name: "Try Again", isWin: false, color: "#FF6384", probability: 70 },
    { name: "WIN!", isWin: true, color: "#36A2EB", probability: 30 },
    { name: "Try Again", isWin: false, color: "#FF6384", probability: 70 },
    { name: "WIN!", isWin: true, color: "#36A2EB", probability: 30 },
    { name: "Try Again", isWin: false, color: "#FF6384", probability: 70 },
  ];
  
  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    
    const isWin = Math.random() < 0.3;
    const possibleSegments = segments.map((segment, index) => ({ segment, index }))
      .filter(({ segment }) => segment.isWin === isWin);
    const { index: winningIndex } = possibleSegments[
      Math.floor(Math.random() * possibleSegments.length)
    ];
    
    const baseSpins = 1800 + Math.random() * 1800;
    const segmentAngle = (360 / segments.length) * winningIndex;
    const finalRotation = baseSpins + segmentAngle;
    
    controls.start({
      rotate: -finalRotation,
      transition: { 
        duration: 5,
        ease: "easeOut"
      }
    }).then(() => {
      setIsSpinning(false);
      onResult(isWin);
    });
  };

  return (
    <div className="relative w-96 h-96 mx-auto">
      {/* Decorative outer ring */}
      <div className="absolute inset-0 rounded-full border-8 border-gray-800" />
      
      {/* Fixed pointer triangle at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
        <div className="w-8 h-12 bg-gray-800 clip-arrow" />
      </div>

      <motion.div 
        className="relative w-full h-full"
        animate={controls}
        style={{ transformOrigin: "center center" }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
          {/* Existing gradient definitions */}
          <defs>
            <linearGradient id="winGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#36A2EB" />
              <stop offset="100%" stopColor="#4BC0C0" />
            </linearGradient>
            <linearGradient id="loseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6384" />
              <stop offset="100%" stopColor="#FF9F40" />
            </linearGradient>
          </defs>

          {segments.map((segment, i) => {
            const angle = (360 / segments.length) * i;
            const rad = (angle * Math.PI) / 180;
            const textRad = rad + (Math.PI / segments.length);
            const x = 50 + 35 * Math.cos(textRad);
            const y = 50 + 35 * Math.sin(textRad);
            
            return (
              <g key={i}>
                <path
                  d={`M 50 50 L ${50 + 45 * Math.cos(rad)} ${50 + 45 * Math.sin(rad)} A 45 45 0 0 1 ${50 + 45 * Math.cos(rad + 2 * Math.PI / segments.length)} ${50 + 45 * Math.sin(rad + 2 * Math.PI / segments.length)} Z`}
                  fill={`url(#${segment.isWin ? 'winGradient' : 'loseGradient'})`}
                  stroke="#fff"
                  strokeWidth="0.5"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${angle + 120}, ${x}, ${y})`}
                  className="fill-white font-bold"
                  fontSize="6px"
                >
                  {segment.name}
                </text>
              </g>
            );
          })}
        </svg>
      </motion.div>
      
      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        <span className="text-white font-bold text-xl">SPIN!</span>
      </button>
    </div>
  );
} 