import { motion, Reorder } from "framer-motion";
import { Question } from "~/models/survey";

interface DraggableQuestionProps {
  question: Question;
  index: number;
  activeCategory: number;
  onReorder: (from: number, to: number) => void;
  children: React.ReactNode;
}

export function DraggableQuestion({ question, index, children }: DraggableQuestionProps) {
  return (
    <Reorder.Item value={question} id={question.id}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 bg-gray-50 rounded-lg mb-2 cursor-move"
      >
        {children}
      </motion.div>
    </Reorder.Item>
  );
} 