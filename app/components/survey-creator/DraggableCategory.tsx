import { motion, Reorder } from "framer-motion";
import { Category } from "~/models/survey";

interface DraggableCategoryProps {
  category: Category;
  index: number;
  activeCategory: number;
  onCategoryClick: () => void;
  children: React.ReactNode;
}

export function DraggableCategory({ category, index, activeCategory, onCategoryClick, children }: DraggableCategoryProps) {
  return (
    <Reorder.Item value={category} id={category.id}>
      <div 
        onClick={onCategoryClick}
        className={`p-4 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow ${
          index === activeCategory 
            ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
            : index % 2 === 0
              ? 'bg-white border-2 border-transparent hover:border-blue-300'
              : 'bg-white border-2 border-gray-100 shadow-sm hover:border-blue-300'
        }`}
      >
        {children}
      </div>
    </Reorder.Item>
  );
} 