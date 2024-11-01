import { motion } from "framer-motion";

import { Question } from "~/models/survey";

interface QuestionTypeSelectorProps {
  value: Question['type'];
  onChange: (type: Question['type']) => void;
}

export function QuestionTypeSelector({ value, onChange }: QuestionTypeSelectorProps) {
  const types = [
    { value: 'multiple_choice', label: 'Multiple Choice', icon: '☑️' },
    { value: 'free_text', label: 'Free Text', icon: '✏️' },
    { value: 'linear_scale', label: 'Linear Scale', icon: '📊' }
  ];

  return (
    <div className="flex gap-2 mb-4">
      {types.map((type) => (
        <button
          key={type.value}
          onClick={() => onChange(type.value as any)}
          className={`flex items-center gap-2 p-2 rounded-lg border ${
            value === type.value 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <span>{type.icon}</span>
          <span className="text-sm">{type.label}</span>
        </button>
      ))}
    </div>
  );
} 