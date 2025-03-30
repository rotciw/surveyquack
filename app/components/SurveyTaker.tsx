import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFetcher } from "@remix-run/react";
import type { Survey, Answer, Category } from "~/models/survey";
import { Toast } from "./Toast";
import { ProgressBar } from "./ProgressBar";
import { WheelModal } from "./WheelModal";

// Add this helper function at the top of SurveyTaker component
const isLastCategory = (currentCategory: string | undefined, categories: Category[]) => {
  if (!currentCategory) return false;
  const currentIndex = categories.findIndex(c => c.id === currentCategory);
  return currentIndex === categories.length - 1;
};

export function SurveyTaker({ 
  survey: initialSurvey, 
  answers: initialAnswers = [], 
  isSubmitted: initialIsSubmitted = false,
  categorySubmissions: initialCategorySubmissions = []
}: { 
  survey: Survey; 
  answers?: Answer[]; 
  isSubmitted?: boolean;
  categorySubmissions?: string[];
}) {
  // Early return if survey is not available
  if (!initialSurvey) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-white relative mt-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Survey Not Found</h1>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">
              This survey could not be loaded. Maybe it is not active yet. 
              <br/>Please check the URL and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const [survey, setSurvey] = useState(initialSurvey);
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);
  const [activeCategory, setActiveCategory] = useState<string | null>(
    initialSurvey.active_category || null
  );
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'submitted' | null>(
    initialIsSubmitted ? 'submitted' : null
  );
  const [isSubmitted, setIsSubmitted] = useState(initialIsSubmitted);
  const [showWheel, setShowWheel] = useState(false);
  const fetcher = useFetcher();
  const [categorySubmissions, setCategorySubmissions] = useState(initialCategorySubmissions);
  
  const [debouncedSave] = useState(() => {
    let timeoutId: NodeJS.Timeout;
    return (questionId: string, value: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetcher.submit(
          { answer: JSON.stringify({ questionId, value }) },
          { method: "post", action: `/api/survey/${survey.id}/save-answer` }
        );
      }, 1000); // Increased from 500ms to 1500ms
    };
  });

  useEffect(() => {
    const eventSource = new EventSource(`/api/survey/${survey.id}/status`);
    
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
        eventSource.close();
        new EventSource(`/api/survey/${survey.id}/status`);
      }, 1000);
    };

    return () => {
      eventSource.close();
    };
  }, [survey.id]);

  // Update categorySubmissions when prop changes
  useEffect(() => {
    setCategorySubmissions(initialCategorySubmissions);
  }, [initialCategorySubmissions]);
  
  const handleCategoryUpdate = useCallback((newCategory: string) => {
    if (!newCategory) return; // Guard against empty category updates
    
    setActiveCategory(newCategory);
    const isNewCategorySubmitted = categorySubmissions.includes(newCategory);
    setIsSubmitted(isNewCategorySubmitted);
    setSaveStatus(isNewCategorySubmitted ? 'submitted' : null);
    setSurvey(prev => ({ ...prev, active_category: newCategory }));
  }, [categorySubmissions]); // categorySubmissions is now properly tracked

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const response = await fetch(`/api/survey/${survey.id}/category`);
      const data = await response.json() as { activeCategory: string };
      if (data.activeCategory !== survey.active_category) {
        handleCategoryUpdate(data.activeCategory);
      }
    }, 1000); // Poll every second

    return () => clearInterval(pollInterval);
  }, [survey.id, survey.active_category, handleCategoryUpdate]);

  // Add debugging
  useEffect(() => {
    console.log('Active Category Changed:', activeCategory);
  }, [activeCategory]);

  // Add effect to monitor fetcher state
  useEffect(() => {
    if (fetcher.state === 'submitting') {
      setSaveStatus('saving');
    } else if (fetcher.state === 'idle' && saveStatus === 'saving') {
      setSaveStatus('submitted');
    }
  }, [fetcher.state, saveStatus]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeCategory]);

  const handleAnswerChange = (questionId: string, value: string) => {
    // Check if current category is submitted
    if (activeCategory && categorySubmissions.includes(activeCategory)) {
      return;
    }
    
    const existingAnswer = answers.find(a => a.questionId === questionId);
    const question = survey.categories
      .flatMap(c => c.questions)
      .find(q => q.id === questionId);

    if (question?.type === 'free_text') {
      // For text inputs, update state immediately but debounce the API call
      setAnswers(prevAnswers => {
        const existingAnswerIndex = prevAnswers.findIndex(a => a.questionId === questionId);
        const answer = { questionId, value };
        if (existingAnswerIndex > -1) {
          return prevAnswers.map((a, index) =>
            index === existingAnswerIndex ? answer : a
          );
        }
        return [...prevAnswers, answer];
      });
      debouncedSave(questionId, value);
    } else {
      // For radio buttons, keep existing immediate save logic
      if (existingAnswer && existingAnswer.value === value) {
        setAnswers(prevAnswers => prevAnswers.filter(a => a.questionId !== questionId));
        fetcher.submit(
          { answer: JSON.stringify({ questionId, value: null }) },
          { method: "post", action: `/api/survey/${survey.id}/save-answer` }
        );
      } else {
        const answer = { questionId, value };
        setAnswers(prevAnswers => {
          const existingAnswerIndex = prevAnswers.findIndex(a => a.questionId === questionId);
          if (existingAnswerIndex > -1) {
            return prevAnswers.map((a, index) =>
              index === existingAnswerIndex ? answer : a
            );
          }
          return [...prevAnswers, answer];
        });

        fetcher.submit(
          { answer: JSON.stringify(answer) },
          { method: "post", action: `/api/survey/${survey.id}/save-answer` }
        );
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!activeCategory) return;
    if (fetcher.state === 'submitting') return;

    try {
      const categoryAnswers = answers.filter(answer => {
        const question = survey.categories
          .find(c => c.id === activeCategory)
          ?.questions.find(q => q.id === answer.questionId);
        return question !== undefined;
      });

      await fetcher.submit(
        {
          answers: JSON.stringify(categoryAnswers)
        },
        { 
          method: "post",
          action: `/api/survey/${survey.id}/submit-answers`
        }
      );

      setCategorySubmissions(prev => [...prev, activeCategory]);
      setIsSubmitted(true);

      // Only show wheel when submitting the last category
      if (isLastCategory(activeCategory, survey.categories)) {
        setTimeout(() => {
          setShowWheel(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const categoriesToShow = survey.categories.filter(category => {
    if (!activeCategory) return false;
    return category.id === activeCategory;
  });

  useEffect(() => {
    if (!activeCategory && survey.categories.length > 0) {
      const firstCategory = survey.categories[0].id;
      setActiveCategory(firstCategory);
      setSurvey(prev => ({ ...prev, active_category: firstCategory }));
    }
  }, [activeCategory, survey.categories]);

  const calculateProgress = () => {
    const totalQuestions = survey.categories.reduce((acc, category) => 
      acc + category.questions.length, 0
    );
    
    const answeredQuestions = answers.length;

    return {
      totalQuestions,
      answeredQuestions
    };
  };

  if (survey.status === 'closed') {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-white relative mt-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{survey.title}</h1>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">
              This survey is currently closed. Please check back later or contact the survey administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!survey.active_category) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-white relative mt-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{survey.title}</h1>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700">
              Waiting for the survey administrator to activate a category. Please refresh the page in a few moments.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto p-8 bg-white relative mt-12 pb-24"
    >
      {saveStatus && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50"
          >
            <Toast 
              message={saveStatus === 'saving' ? 'Saving...' : 'All changes saved'} 
              type={saveStatus === 'saving' ? 'info' : 'success'}
            />
          </motion.div>
        </AnimatePresence>
      )}

      <motion.h1 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-4xl font-bold mb-8 text-center text-gray-900"
      >
        {survey.title}
      </motion.h1>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <ProgressBar 
          totalCategories={survey.categories.length}
          currentCategoryIndex={survey.categories.findIndex(cat => cat.id === activeCategory)}
        />
      </motion.div>

      {isSubmitted && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">
            {isLastCategory(activeCategory || undefined, survey.categories) 
              ? "Thank you for completing the survey!"
              : "Your answers for this category have been submitted. Please wait for the survey administrator to activate the next category before continuing."
            }
          </p>
        </div>
      )}

      {/* {isLastCategory(activeCategory || undefined, survey.categories) && 
       categorySubmissions.includes(activeCategory || '') && (
        <WheelModal
          isOpen={showWheel}
          onClose={() => {
            setShowWheel(false);
          }}
          onResult={(prize) => {
            console.log('Won prize:', prize);
          }}
        />
      )} */}

      {categoriesToShow.map((category) => (
        <motion.div 
          key={category.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-16"
        >
          <motion.h2 
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="text-2xl font-semibold mb-2 text-gray-800"
          >
            {category.title}
          </motion.h2>
          {category.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-600 mb-8"
            >
              {category.description}
            </motion.p>
          )}

          {category.questions.sort((a, b) => a.order - b.order).map((question, questionIndex) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: questionIndex * 0.1 }}
              className="mb-12 last:mb-0"
            >
              <h3 className="text-xl font-medium mb-4 text-gray-800">
                {question.title}
              </h3>
              {question.subtitle && (
                <p className="text-base text-gray-600 mb-4">{question.subtitle}</p>
              )}
              {question.type === 'multiple_choice' && (
                <div className="space-y-3">
                  {question.options?.map((option) => (
                    <motion.label
                      key={option}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers.some(a => a.questionId === question.id && a.value === option)}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        onClick={(e) => {
                          if (answers.some(a => a.questionId === question.id && a.value === option)) {
                            e.preventDefault();
                            handleAnswerChange(question.id, option);
                          }
                        }}
                        disabled={Boolean(activeCategory && categorySubmissions.includes(activeCategory))}
                        className="form-radio text-blue-500 focus:ring-blue-500 h-5 w-5 disabled:opacity-50"
                      />
                      <span className="text-gray-700 text-lg">{option}</span>
                    </motion.label>
                  ))}
                </div>
              )}

              {question.type === 'linear_scale' && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600 px-2">
                    <span>{question.scale_left_label}</span>
                    <span>{question.scale_right_label}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    {Array.from(
                      { length: ((question.scale_end || 5) - (question.scale_start || 1)) + 1 }
                    ).map((_, i) => {
                      const value = String((question.scale_start || 1) + i);
                      const isSelected = answers.some(
                        a => a.questionId === question.id && a.value === value
                      );
                      
                      return (
                        <motion.label
                          key={value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1"
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={value}
                            checked={isSelected}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            onClick={(e) => {
                              if (isSelected) {
                                e.preventDefault();
                                handleAnswerChange(question.id, value);
                              }
                            }}
                            disabled={Boolean(activeCategory && categorySubmissions.includes(activeCategory))}
                            className="sr-only"
                          />
                          <div 
                            className={`
                              cursor-pointer text-center p-3 rounded-lg border-2 
                              ${isSelected 
                                ? activeCategory && categorySubmissions.includes(activeCategory)
                                  ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                                  : 'border-blue-500 bg-blue-50'
                                : activeCategory && categorySubmissions.includes(activeCategory)
                                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                  : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                              } 
                              transition-colors
                            `}
                          >
                            <span className={`text-lg font-medium ${
                              activeCategory && categorySubmissions.includes(activeCategory)
                                ? 'text-gray-500'
                                : ''
                            }`}>
                              {value}
                            </span>
                          </div>
                        </motion.label>
                      );
                    })}
                  </div>
                </div>
              )}

              {question.type === 'free_text' && (
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="mt-2"
                >
                  <textarea
                    name={`question-${question.id}`}
                    value={answers.find(a => a.questionId === question.id)?.value || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    disabled={Boolean(activeCategory && categorySubmissions.includes(activeCategory))}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-colors resize-none min-h-[120px] disabled:opacity-50 disabled:bg-gray-100"
                    placeholder="Type your answer here..."
                  />
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
        
      ))}

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-gray-600  text-center"
      >
        Your answers are automatically saved as you complete the survey
      </motion.p>

      {activeCategory && 
       !categorySubmissions.includes(activeCategory) && 
       answers.some(a => survey.categories.some(c => c.questions.some(q => q.id === a.questionId))) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <button
            onClick={handleSubmit}
            className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Submit Category
          </button>
        </motion.div>
      )}

    </motion.div>
  );
}
