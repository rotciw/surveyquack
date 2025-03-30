import { motion } from "framer-motion";
import { Question } from "~/models/survey";
import { QuestionTypeSelector } from "~/components/survey-creator/QuestionTypeSelector";
import { Reorder } from "framer-motion";

interface QuestionEditorProps {
  question: Question;
  index: number;
  activeCategory: number;
  updateQuestionTitle: (categoryIndex: number, questionIndex: number, title: string) => void;
  updateQuestionType: (categoryIndex: number, questionIndex: number, type: 'multiple_choice' | 'free_text' | 'linear_scale') => void;
  updateOption: (categoryIndex: number, questionIndex: number, optionIndex: number, value: string) => void;
  addOption: (categoryIndex: number, questionIndex: number) => void;
  removeOption: (categoryIndex: number, questionIndex: number, optionIndex: number) => void;
  removeQuestion: (categoryIndex: number, questionIndex: number) => void;
  duplicateQuestion: (categoryIndex: number, questionIndex: number) => void;
  updateScaleStart: (categoryIndex: number, questionIndex: number, value: number) => void;
  updateScaleEnd: (categoryIndex: number, questionIndex: number, value: number) => void;
  updateScaleLabel: (categoryIndex: number, questionIndex: number, side: 'left' | 'right', value: string) => void;
}

export function QuestionEditor({
  question,
  index,
  activeCategory,
  updateQuestionTitle,
  updateQuestionType,
  updateOption,
  addOption,
  removeOption,
  removeQuestion,
  duplicateQuestion,
  updateScaleStart,
  updateScaleEnd,
  updateScaleLabel,
}: QuestionEditorProps) {
  return (
    <Reorder.Item value={question} id={question.id}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`p-4 rounded-lg mb-2 ${
          index % 2 === 0 
            ? 'bg-white' 
            : 'bg-white border border-gray-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]'
        }`}
      >
        <div className="flex items-start gap-2">
          <div className="cursor-move p-2 hover:bg-gray-100 rounded touch-none">
            ⋮⋮
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <input
                type="text"
                value={question.title}
                onChange={(e) => updateQuestionTitle(activeCategory, index, e.target.value)}
                className="flex-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 rounded p-1 font-medium text-base"
                placeholder="Question Title"
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => duplicateQuestion(activeCategory, index)}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                  title="Duplicate question"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => removeQuestion(activeCategory, index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Delete question"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <QuestionTypeSelector
              value={question.type}
              onChange={(type) => updateQuestionType(activeCategory, index, type)}
            />
            {question.type === 'multiple_choice' && (
              <div className="space-y-2">
                {question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(activeCategory, index, optionIndex, e.target.value)}
                      className="flex-1 p-2 border rounded-lg"
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                    <button
                      onClick={() => removeOption(activeCategory, index, optionIndex)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addOption(activeCategory, index)}
                  className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Add Option
                </button>
              </div>
            )}

            {question.type === 'linear_scale' && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Value</label>
                    <input
                      type="number"
                      value={question.scale_start}
                      onChange={(e) => updateScaleStart(activeCategory, index, parseInt(e.target.value))}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Value</label>
                    <input
                      type="number"
                      value={question.scale_end}
                      onChange={(e) => updateScaleEnd(activeCategory, index, parseInt(e.target.value))}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Left Label</label>
                    <input
                      type="text"
                      value={question.scale_left_label || ''}
                      onChange={(e) => updateScaleLabel(activeCategory, index, 'left', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Left end label"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Right Label</label>
                    <input
                      type="text"
                      value={question.scale_right_label || ''}
                      onChange={(e) => updateScaleLabel(activeCategory, index, 'right', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Right end label"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Reorder.Item>
  );
} 