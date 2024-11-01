import { Category } from "~/models/survey";

interface CategorySidebarProps {
  categories: Category[];
  activeCategory: number;
  setActiveCategory: (index: number) => void;
  setActiveQuestion: (index: number) => void;
  updateCategoryTitle: (index: number, title: string) => void;
  updateCategoryDescription?: (index: number, description: string) => void;
  duplicateCategory: (index: number) => void;
  removeCategory: (index: number) => void;
  addCategory: () => void;
}

export function CategorySidebar({
  categories,
  activeCategory,
  setActiveCategory,
  setActiveQuestion,
  updateCategoryTitle,
  updateCategoryDescription,
  duplicateCategory,
  removeCategory,
  addCategory
}: CategorySidebarProps) {
  return (
    <div className="w-72 border-r bg-gray-50 flex flex-col">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Categories</h2>
        <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          {categories?.map((category, index) => (
            <div
              key={category.id}
              className={`p-3 rounded cursor-pointer transition-colors ${
                index === activeCategory 
                  ? 'bg-blue-50 border-2 border-blue-500' 
                  : 'bg-white border-2 border-transparent hover:border-blue-300'
              }`}
              onClick={() => {
                setActiveCategory(index);
                setActiveQuestion(0);
              }}
            >
              <input
                type="text"
                value={category.title}
                onChange={(e) => updateCategoryTitle(index, e.target.value)}
                className="w-full bg-transparent focus:outline-none font-medium text-sm"
                placeholder="Category Title"
                onClick={(e) => e.stopPropagation()}
              />
              <textarea
                className="mt-2 w-full text-sm p-2 border rounded bg-white resize-none"
                placeholder="Category description..."
                value={category.description || ''}
                rows={2}
                onChange={(e) => {
                  const newValue = e.target.value;
                  updateCategoryDescription?.(index, newValue);
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateCategory(index);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Duplicate
                </button>
                {categories.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCategory(index);
                    }}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addCategory}
          className="w-full mt-3 py-2 px-3 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
        >
          Add Category
        </button>
      </div>
    </div>
  );
} 