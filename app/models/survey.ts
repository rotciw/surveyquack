export interface Survey {
  id: string;
  title: string;
  categories: Category[];
  user_id: string;
  activeCategory?: string;
}

export interface Category {
  id: string;
  title: string;
  questions: Question[];
}

export interface Question {
  id: string;
  title: string;
  subtitle?: string;
  type: 'multiple_choice' | 'free_text';
  options?: string[]; // For multiple choice questions
}

export interface Answer {
  questionId: string;
  value: string;
}
