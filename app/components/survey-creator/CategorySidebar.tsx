import { Category } from "~/models/survey";
import { Reorder } from "framer-motion";
import { DraggableCategory } from "./DraggableCategory";

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
  onReorder: (newOrder: Category[]) => void;
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
  addCategory,
  onReorder
}: CategorySidebarProps) {
  return (
    <div className="w-96 border-r bg-gray-50 flex flex-col">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Categories</h2>
        <Reorder.Group 
          axis="y" 
          values={categories} 
          onReorder={onReorder}
          className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2"
        >
          {categories?.map((category, index) => (
            <DraggableCategory
              key={category.id}
              category={category}
              index={index}
              activeCategory={activeCategory}
              onCategoryClick={() => setActiveCategory(index)}
            >
              <div className="flex items-start gap-2">
                <div className="cursor-move p-2 hover:bg-gray-100 rounded touch-none">
                  ⋮⋮
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={category.title}
                    onChange={(e) => updateCategoryTitle(index, e.target.value)}
                    className="w-full bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 rounded p-1 font-medium text-base"
                    placeholder="Category Title"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <textarea
                    className="mt-3 w-full text-sm p-2 border rounded bg-white resize-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                    placeholder="Category description..."
                    value={category.description || ''}
                    rows={3}
                    onChange={(e) => updateCategoryDescription?.(index, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="mt-3 flex justify-end gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateCategory(index);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                    >
                      Duplicate
                    </button>
                    {categories.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCategory(index);
                        }}
                        className="text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </DraggableCategory>
          ))}
        </Reorder.Group>
        <button
          onClick={addCategory}
          className="w-full mt-4 py-3 px-4 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          Add Category
        </button>
      </div>
    </div>
  );
} 