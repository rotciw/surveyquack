import { Survey, Category } from "~/models/survey";
import { useFetcher } from "@remix-run/react";

interface ActiveCategoryCardProps {
  survey: Survey;
  onCategoryChange: (categoryId: string) => void;
}

export function ActiveCategoryCard({ survey, onCategoryChange }: ActiveCategoryCardProps) {
  const fetcher = useFetcher();
  console.log(survey);
  const handleCategoryChange = (categoryId: string) => {
    console.log(categoryId)
    onCategoryChange(categoryId);
    
    // Update active category through API
    fetcher.submit(
      { categoryId },
      { 
        method: "post", 
        action: `/api/survey/${survey.id}/activate-category`
      }
    );
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">Active Category</h3>
      <div className="space-y-2">
        {survey.categories.map((category: Category) => (
          <label
            key={category.id}
            className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
          >
            <input
              type="radio"
              name="activeCategory"
              value={category.id}
              checked={category.id === survey.activeCategory}
              onChange={() => handleCategoryChange(category.id)}
              className="text-indigo-600"
            />
            <span>{category.title}</span>
          </label>
        ))}
      </div>
    </div>
  );
} 