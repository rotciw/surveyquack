import { useFetcher } from "@remix-run/react";
import { clamp, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { Category, Question, Survey } from "~/models/survey";
import { CategoryQuestions } from "./survey-creator/CategoryQuestions";
import { CategorySidebar } from "./survey-creator/CategorySidebar";
import { SurveyHeader } from "./survey-creator/SurveyHeader";
import { Toast } from "./Toast";

export function SurveyCreator({ user, surveyId, initialSurvey, initialUrl }: { 
  user?: { id: string };
  surveyId?: string;
  initialSurvey: Survey;
  initialUrl?: string
}) {
  const fetcher = useFetcher<{ survey?: Survey; url?: string }>();
  const [survey, setSurvey] = useState<Survey>(initialSurvey);
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [uniqueUrl, setUniqueUrl] = useState<string | null>(initialUrl || null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (fetcher.data && fetcher.data.survey && !surveyId) {
      setSurvey(fetcher.data.survey);
    }
  }, [fetcher.data, surveyId]);

  useEffect(() => {
    if (fetcher.data && fetcher.data.url) {
      setUniqueUrl(fetcher.data.url);
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (!surveyId) return;
    
    const eventSource = new EventSource(`/api/survey/${surveyId}/status`);
    
    eventSource.onmessage = (event) => {
      if (event.data !== ": keepalive") {
        const newStatus = JSON.parse(event.data);
        setSurvey(prev => ({ ...prev, status: newStatus }));
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
      setTimeout(() => {
        new EventSource(`/api/survey/${surveyId}/status`);
      }, 1000);
    };

    return () => eventSource.close();
  }, [surveyId]);

  const updateSurveyTitle = (title: string) => {
    setSurvey({ ...survey, title });
  };

  const updateCategoryTitle = (categoryIndex: number, title: string) => {
    const newCategories = [...survey.categories];
    newCategories[categoryIndex].title = title;
    setSurvey({ ...survey, categories: newCategories });
  };

  const updateCategoryDescription = (
    categoryIndex: number, 
    description: string, 
    dragOffset?: number
  ) => {
    const newCategories = structuredClone(survey.categories);
    
    if (dragOffset !== undefined) {
      const targetIndex = clamp(
        Math.round(categoryIndex + dragOffset), 
        0, 
        newCategories.length - 1
      );
      const item = newCategories[categoryIndex];
      newCategories.splice(categoryIndex, 1);
      newCategories.splice(targetIndex, 0, item);
    } else {
      newCategories[categoryIndex].description = description;
    }
    
    setSurvey({ ...survey, categories: newCategories });
  };

  const updateQuestionTitle = (categoryIndex: number, questionIndex: number, title: string) => {
    const newCategories = [...survey.categories];
    newCategories[categoryIndex].questions[questionIndex].title = title;
    setSurvey({ ...survey, categories: newCategories });
  };

  const updateQuestionType = (categoryIndex: number, questionIndex: number, type: 'multiple_choice' | 'free_text' | 'linear_scale') => {
    const newCategories = [...survey.categories];
    const question = newCategories[categoryIndex].questions[questionIndex];
    question.type = type;
    if (type === 'multiple_choice' && !question.options) {
      question.options = ["Option 1"];
    } else if (type === 'linear_scale') {
      question.scale_start = 1;
      question.scale_end = 5;
    }
    setSurvey({ ...survey, categories: newCategories });
  };

  const updatescale_start = (categoryIndex: number, questionIndex: number, value: number) => {
    const newCategories = [...survey.categories];
    const question = newCategories[categoryIndex].questions[questionIndex];
    if (question.type === 'linear_scale') {
      question.scale_start = value;
    }
    setSurvey({ ...survey, categories: newCategories });
  };
  
  const updatescale_end = (categoryIndex: number, questionIndex: number, value: number) => {
    const newCategories = [...survey.categories];
    const question = newCategories[categoryIndex].questions[questionIndex];
    if (question.type === 'linear_scale') {
      question.scale_end = value;
    }
    setSurvey({ ...survey, categories: newCategories });
  };

  const addOption = (categoryIndex: number, questionIndex: number) => {
    const newCategories = [...survey.categories];
    const question = newCategories[categoryIndex].questions[questionIndex];
    if (question.type === 'multiple_choice') {
      question.options = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
    }
    setSurvey({ ...survey, categories: newCategories });
  };

  const updateOption = (categoryIndex: number, questionIndex: number, optionIndex: number, value: string) => {
    const newCategories = [...survey.categories];
    const question = newCategories[categoryIndex].questions[questionIndex];
    if (question.type === 'multiple_choice' && question.options) {
      question.options[optionIndex] = value;
    }
    setSurvey({ ...survey, categories: newCategories });
  };

  const removeOption = (categoryIndex: number, questionIndex: number, optionIndex: number) => {
    const newCategories = [...survey.categories];
    const question = newCategories[categoryIndex].questions[questionIndex];
    if (question.type === 'multiple_choice' && question.options) {
      question.options.splice(optionIndex, 1);
    }
    setSurvey({ ...survey, categories: newCategories });
  };

  const addQuestion = (categoryIndex: number) => {
    const newCategories = [...survey.categories];
    const currentQuestions = newCategories[categoryIndex].questions;
    newCategories[categoryIndex].questions.push({
      id: crypto.randomUUID(),
      title: "Untitled Question",
      type: "multiple_choice",
      options: ["Option 1"],
      order: currentQuestions.length
    });
    setSurvey({ ...survey, categories: newCategories });
    setActiveQuestion(newCategories[categoryIndex].questions.length - 1);
  };

  const removeQuestion = (categoryIndex: number, questionIndex: number) => {
    if (survey.categories[categoryIndex].questions.length > 1) {
      const newCategories = [...survey.categories];
      newCategories[categoryIndex].questions.splice(questionIndex, 1);
      newCategories[categoryIndex].questions = newCategories[categoryIndex].questions.map((q, i) => ({
        ...q,
        order: i
      }));
      setSurvey({ ...survey, categories: newCategories });
      setActiveQuestion(Math.min(questionIndex, newCategories[categoryIndex].questions.length - 1));
    }
  };

  const duplicateQuestion = (categoryIndex: number, questionIndex: number) => {
    const newCategories = [...survey.categories];
    const questionToDuplicate = newCategories[categoryIndex].questions[questionIndex];
    const newQuestion: Question = {
      ...questionToDuplicate,
      id: crypto.randomUUID(),
      order: questionIndex + 1
    };
    
    newCategories[categoryIndex].questions.splice(questionIndex + 1, 0, newQuestion);
    newCategories[categoryIndex].questions = newCategories[categoryIndex].questions.map((q, i) => ({
      ...q,
      order: i
    }));
    
    setSurvey({ ...survey, categories: newCategories });
    setActiveQuestion(questionIndex + 1);
  };

  const addCategory = () => {
    setSurvey({
      ...survey,
      categories: [
        ...survey.categories,
        {
          id: crypto.randomUUID(),
          title: "Untitled Category",
          questions: [
            {
              id: crypto.randomUUID(),
              title: "Untitled Question",
              type: "multiple_choice",
              options: ["Option 1"],
              order: 0
            },
          ],
        },
      ],
    });
    setActiveCategory(survey.categories.length);
    setActiveQuestion(0);
  };

  const removeCategory = async (categoryIndex: number) => {
    if (survey.categories.length > 1) {
      const newCategories = [...survey.categories];
      const categoryToRemove = newCategories[categoryIndex];
      newCategories.splice(categoryIndex, 1);
      setSurvey({ ...survey, categories: newCategories });
      setActiveCategory(Math.min(categoryIndex, newCategories.length - 1));
      setActiveQuestion(0);

      // Save to database
      fetcher.submit(
        { categoryId: categoryToRemove.id },
        { 
          method: "delete", 
          action: `/api/survey/${surveyId}/category`
        }
      );
    }
  };

  const duplicateCategory = (categoryIndex: number) => {
    const categoryToDuplicate = survey.categories[categoryIndex];
    const newCategory: Category = {
      ...categoryToDuplicate,
      id: crypto.randomUUID(),
      questions: categoryToDuplicate.questions.map(q => ({ ...q, id: crypto.randomUUID() })),
    };
    const newCategories = [...survey.categories];
    newCategories.splice(categoryIndex + 1, 0, newCategory);
    setSurvey({ ...survey, categories: newCategories });
    setActiveCategory(categoryIndex + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (surveyId) {
      handleSave();
    } else {
      setToast({ message: 'Creating survey...', type: 'info' });
      fetcher.submit(
        { survey: JSON.stringify({ ...survey, user_id: user?.id }) },
        { method: "post", action: "/api/surveys" }
      );
    }
  };
  
  const handleSave = () => {
    setToast({ message: 'Saving survey...', type: 'info' });
    fetcher.submit(
      { survey: JSON.stringify(survey) },
      { 
        method: "post", 
        action: `/api/survey/${surveyId}/save`
      }
    );
  };
  const updateScaleLabel = (categoryIndex: number, questionIndex: number, side: 'left' | 'right', value: string) => {
    const newCategories = [...survey.categories];
    const question = newCategories[categoryIndex].questions[questionIndex];
    if (question.type === 'linear_scale') {
      if (side === 'left') {
        question.scale_left_label = value;
      } else {
        question.scale_right_label = value;
      }
    }
    setSurvey({ ...survey, categories: newCategories });
  };

  const toggleSurveyStatus = () => {
    const newStatus = survey.status === 'open' ? 'closed' : 'open';
    setSurvey(prev => ({ ...prev, status: newStatus }));
    
    fetcher.submit(
      { status: newStatus },
      { method: "post", action: `/api/survey/${surveyId}/toggle-status` }
    );
  };
  
  useEffect(() => {
    if (fetcher.state === 'submitting') {
      setToast({ message: 'Saving...', type: 'info' });
    } else if (fetcher.state === 'idle' && fetcher.data) {
      setToast({ message: 'Survey saved successfully!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    }
  }, [fetcher.state]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this survey? This action cannot be undone.')) {
      setToast({ message: 'Deleting survey...', type: 'info' });
      fetcher.submit(
        {},
        { method: "delete", action: `/api/survey/${surveyId}` }
      );
    }
  };

  const handleQuestionsReorder = (categoryIndex: number, newOrder: Question[]) => {
    setSurvey(prev => ({
      ...prev,
      categories: prev.categories.map((cat, idx) =>
        idx === categoryIndex ? { ...cat, questions: newOrder } : cat
      )
    }));
  };

  const handleCategoriesReorder = (newOrder: Category[]) => {
    setSurvey(prev => ({
      ...prev,
      categories: newOrder
    }));
  };

  return (
    <div className="h-screen flex flex-col">
      <SurveyHeader 
        survey={survey}
        uniqueUrl={uniqueUrl}
        updateSurveyTitle={updateSurveyTitle}
        toggleSurveyStatus={toggleSurveyStatus}
        onSave={handleSave}
        isSaving={fetcher.state === 'submitting'}
      />

      <div className="flex-1 overflow-hidden">
        <div className="max-w-[1600px] mx-auto h-full flex flex-col">
          <div className="flex-1 flex overflow-hidden">
            <CategorySidebar 
              categories={survey.categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              setActiveQuestion={setActiveQuestion}
              updateCategoryTitle={updateCategoryTitle}
              updateCategoryDescription={updateCategoryDescription}
              duplicateCategory={duplicateCategory}
              removeCategory={removeCategory}
              addCategory={addCategory}
              onReorder={handleCategoriesReorder}
            />

            <div className="flex-1 overflow-y-auto p-4">
              {activeCategory !== null && (
                <CategoryQuestions
                  questions={survey.categories[activeCategory].questions}
                  activeCategory={activeCategory}
                  onReorder={(newOrder) => handleQuestionsReorder(activeCategory, newOrder)}
                  updateQuestionTitle={updateQuestionTitle}
                  updateQuestionType={updateQuestionType}
                  updateOption={updateOption}
                  addOption={addOption}
                  removeOption={removeOption}
                  removeQuestion={removeQuestion}
                  duplicateQuestion={duplicateQuestion}
                  updateScaleStart={updatescale_start}
                  updateScaleEnd={updatescale_end}
                  updateScaleLabel={updateScaleLabel}
                />
              )}

              <motion.button
                onClick={() => addQuestion(activeCategory)}
                className="w-full mt-4 py-3 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Add Question
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
