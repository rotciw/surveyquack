import { Survey } from "~/models/survey";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface CategoryManagementProps {
  survey: Survey;
  onCategoryChange: (categoryId: string) => void;
  onCategoryStatsSelect: (categoryId: string | null) => void;
  selectedCategoryStats: string | null;
}

export function CategoryManagement({ 
  survey, 
  onCategoryChange, 
  onCategoryStatsSelect,
  selectedCategoryStats 
}: CategoryManagementProps) {
  const [syncWithActive, setSyncWithActive] = useState(true);

  // Watch for changes in active_category and update the stats view if sync is enabled
  useEffect(() => {
    if (syncWithActive && survey.active_category) {
      onCategoryStatsSelect(survey.active_category);
    }
  }, [survey.active_category, onCategoryStatsSelect, syncWithActive]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Category Control</h2>
        <div className="space-y-3">
          {survey.categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-4 rounded-lg text-left transition-colors ${
                category.id === survey.active_category
                  ? 'bg-green-100 border-2 border-green-500'
                  : 'bg-gray-50 border-2 border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{category.title}</span>
                {category.id === survey.active_category && (
                  <span className="text-green-600 text-sm">Active</span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-700">View Statistics</h3>
          <button
            onClick={() => setSyncWithActive(!syncWithActive)}
            className={`
              relative inline-flex items-center gap-2 px-4 py-2 rounded-lg
              transition-colors duration-200
              ${syncWithActive 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            <span className={`
              text-sm font-medium
              ${syncWithActive ? 'text-blue-700' : 'text-gray-600'}
            `}>
              Sync with active
            </span>
            <span className={`
              flex h-4 w-4 items-center justify-center rounded-full
              ${syncWithActive ? 'bg-blue-500' : 'bg-gray-400'}
            `}>
              <svg 
                className={`h-3 w-3 ${syncWithActive ? 'text-white' : 'text-gray-200'}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={syncWithActive 
                    ? "M5 13l4 4L19 7" 
                    : "M6 18L18 6M6 6l12 12"
                  }
                />
              </svg>
            </span>
          </button>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => !syncWithActive && onCategoryStatsSelect(null)}
            disabled={syncWithActive}
            className={`w-full p-4 rounded-lg text-left transition-colors ${
              selectedCategoryStats === null
                ? 'bg-blue-100 border-2 border-blue-500'
                : syncWithActive
                ? 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed'
                : 'bg-gray-50 border-2 border-gray-200 hover:border-blue-300'
            }`}
          >
            <span className="font-medium">All Categories</span>
          </button>
          {survey.categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => !syncWithActive && onCategoryStatsSelect(category.id)}
              disabled={syncWithActive}
              whileHover={!syncWithActive ? { scale: 1.01 } : {}}
              whileTap={!syncWithActive ? { scale: 0.98 } : {}}
              className={`w-full p-4 rounded-lg text-left transition-colors ${
                category.id === selectedCategoryStats
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : syncWithActive
                  ? 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed'
                  : 'bg-gray-50 border-2 border-gray-200 hover:border-blue-300'
              }`}
            >
              <span className="font-medium">{category.title}</span>
              <span className="block text-sm text-gray-500">
                {category.questions.length} questions
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
} 