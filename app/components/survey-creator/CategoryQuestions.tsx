import { Reorder } from "framer-motion";
import { Question } from "~/models/survey";
import { QuestionEditor } from "../QuestionEditor";

interface CategoryQuestionsProps {
    questions: Question[];
    activeCategory: number;
    onReorder: (newOrder: Question[]) => void;
    updateQuestionTitle: (categoryIndex: number, questionIndex: number, title: string) => void;
    updateQuestionType: (categoryIndex: number, questionIndex: number, type: 'multiple_choice' | 'free_text' | 'linear_scale') => void;
    updateOption: (categoryIndex: number, questionIndex: number, optionIndex: number, value: string) => void;
    addOption: (categoryIndex: number, questionIndex: number) => void;
    removeOption: (categoryIndex: number, questionIndex: number, optionIndex: number) => void;
    removeQuestion: (categoryIndex: number, questionIndex: number) => void;
    duplicateQuestion: (categoryIndex: number, questionIndex: number) => void;
    updateScaleStart: (categoryIndex: number, questionIndex: number, value: number) => void;
    updateScaleEnd: (categoryIndex: number, questionIndex: number, value: number) => void;
    updateScaleLabel: (categoryIndex: number, questionIndex: number, side: "left" | "right", value: string) => void;
  }

export function CategoryQuestions({ 
  questions, 
  activeCategory,
  onReorder,
  ...questionEditorProps 
}: CategoryQuestionsProps) {
  const handleReorder = (newOrder: Question[]) => {
    const updatedOrder = newOrder.map((question, index) => ({
      ...question,
      order: index
    }));
    onReorder(updatedOrder);
  };

  return (
    <Reorder.Group 
      axis="y" 
      values={questions} 
      onReorder={handleReorder}
      className="space-y-4"
    >
      {questions.map((question, index) => (
        <QuestionEditor
          key={question.id}
          question={question}
          index={index}
          activeCategory={activeCategory}
          {...questionEditorProps}
        />
      ))}
    </Reorder.Group>
  );
} 