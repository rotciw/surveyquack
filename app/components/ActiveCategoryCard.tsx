import { Survey, Category } from "~/models/survey";
import { useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";

interface ActiveCategoryCardProps {
  survey: Survey;
  onCategoryChange: (categoryId: string) => void;
}

export function ActiveCategoryCard({ survey, onCategoryChange }: ActiveCategoryCardProps) {
  const fetcher = useFetcher();
  const [activeCategory, setActiveCategory] = useState(survey.active_category);

  useEffect(() => {
    setActiveCategory(survey.active_category);
  }, [survey.active_category]);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange(categoryId);
    
    fetcher.submit(
      { categoryId },
      { 
        method: "post", 
        action: `/api/survey/${survey.id}/activate-category`
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold mb-3">Select Active Category</h2>
      <div className="space-y-2">
        {survey.categories?.map((category: Category) => (
          <label
            key={category.id}
            className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
          >
            <input
              type="radio"
              name="activeCategory"
              value={category.id}
              checked={category.id === activeCategory}
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