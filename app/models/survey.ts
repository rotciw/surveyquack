export interface Survey {
  id: string;
  title: string;
  categories: Category[];
  user_id: string;
  active_category?: string;
  status: 'draft' | 'open' | 'closed';
  created_at: string;
}

export interface SurveyResponse {
  question_id: string;
  answer_value: string;
  taker_id: string;
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
  type: 'multiple_choice' | 'free_text' | 'linear_scale';
  options?: string[]; // For multiple choice questions
  scale_start?: number; // For linear scale questions
  scale_end?: number; // For linear scale questions
  scale_left_label?: string; // New property for left label
  scale_right_label?: string; // New property for right label
}

export interface Answer {
  questionId: string;
  value: string;
}
