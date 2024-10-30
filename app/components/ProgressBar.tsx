import { motion } from "framer-motion";

interface ProgressBarProps {
  totalQuestions: number;
  answeredQuestions: number;
}

export function ProgressBar({ totalQuestions, answeredQuestions }: ProgressBarProps) {
  const progress = (answeredQuestions / totalQuestions) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="w-full h-2 bg-gray-100">
        <motion.div
          className="h-2 bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="max-w-3xl mx-auto px-8">
        <div className="text-sm text-gray-500 py-2 text-right">
          {answeredQuestions} of {totalQuestions} questions completed
        </div>
      </div>
    </div>
  );
} 