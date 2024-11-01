import { Survey } from "~/models/survey";
import { motion } from "framer-motion";

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
  // Set first category as default if no active category
  if (!survey.active_category && survey.categories.length > 0) {
    onCategoryChange(survey.categories[0].id);
  }

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
        <h3 className="text-lg font-medium text-gray-700 mb-3">View Statistics</h3>
        <div className="space-y-3">
          <button
            onClick={() => onCategoryStatsSelect(null)}
            className={`w-full p-4 rounded-lg text-left transition-colors ${
              selectedCategoryStats === null
                ? 'bg-blue-100 border-2 border-blue-500'
                : 'bg-gray-50 border-2 border-gray-200 hover:border-blue-300'
            }`}
          >
            <span className="font-medium">All Categories</span>
          </button>
          {survey.categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => onCategoryStatsSelect(category.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-4 rounded-lg text-left transition-colors ${
                category.id === selectedCategoryStats
                  ? 'bg-blue-100 border-2 border-blue-500'
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