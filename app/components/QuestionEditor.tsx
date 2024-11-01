import { motion } from "framer-motion";
import { Question } from "~/models/survey";
import { DraggableQuestion } from "~/components/survey-creator/DraggableQuestion";
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
        className="p-4 bg-gray-50 rounded-lg cursor-move"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={question.title}
              onChange={(e) => updateQuestionTitle(activeCategory, index, e.target.value)}
              className="text-xl font-medium flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Enter your question"
            />
            <motion.div className="flex gap-2">
              <motion.button
                onClick={() => duplicateQuestion(activeCategory, index)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg tooltip"
                data-tip="Duplicate question"
              >
                📋
              </motion.button>
              <motion.button
                onClick={() => removeQuestion(activeCategory, index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg tooltip"
                data-tip="Remove question"
              >
                🗑️
              </motion.button>
            </motion.div>
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
      </motion.div>
    </Reorder.Item>
  );
} 