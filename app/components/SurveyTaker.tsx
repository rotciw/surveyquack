import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFetcher } from "@remix-run/react";
import type { Survey, Answer } from "~/models/survey";
import { Toast } from "./Toast";

export function SurveyTaker({ 
  survey: initialSurvey, 
  answers: initialAnswers = [], 
  isSubmitted: initialIsSubmitted = false 
}: { 
  survey: Survey; 
  answers?: Answer[]; 
  isSubmitted?: boolean;
}) {
  const [survey, setSurvey] = useState(initialSurvey);
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(survey.active_category);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'submitted' | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(initialIsSubmitted);
  const fetcher = useFetcher();

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

  useEffect(() => {
    const eventSource = new EventSource(`/api/survey/${survey.id}/category`);
    
    eventSource.onmessage = (event) => {
      if (event.data !== ": keepalive") {
        const newCategory = JSON.parse(event.data);
        setActiveCategory(newCategory);
        setIsSubmitted(false);
        setSaveStatus(null);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
      setTimeout(() => {
        eventSource.close();
        new EventSource(`/api/survey/${survey.id}/category`);
      }, 1000);
    };

    return () => {
      eventSource.close();
    };
  }, [survey.id]);

  // Add effect to monitor fetcher state
  useEffect(() => {
    if (fetcher.state === 'submitting') {
      setSaveStatus('saving');
    } else if (fetcher.state === 'idle' && saveStatus === 'saving') {
      setSaveStatus('saved');
      // Clear the saved status after a delay
      const timer = setTimeout(() => {
        setSaveStatus(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [fetcher.state, saveStatus]);

  const handleAnswerChange = (questionId: string, value: string) => {
    if (isSubmitted) return; // Prevent changes if submitted
    
    const answer = { questionId, value };
    setAnswers((prevAnswers) => {
      const existingAnswerIndex = prevAnswers.findIndex((a) => a.questionId === questionId);
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
  };

  const handleSubmit = () => {
    if (window.confirm('Are you sure you want to submit your answers? You won\'t be able to change them after submission.')) {
      fetcher.submit(
        { answers: JSON.stringify(answers) },
        { method: "post", action: `/api/survey/${survey.id}/submit-answers` }
      );
      setIsSubmitted(true);
      setSaveStatus('submitted');
    }
  };

  const categoriesToShow = survey.categories.filter(category => {
    if (!activeCategory) return false;
    return category.id === activeCategory;
  });

  useEffect(() => {
    if (activeCategory === undefined && survey.categories.length > 0) {
      setActiveCategory(survey.active_category || survey.categories[0].id);
    }
  }, [activeCategory, survey.categories, survey.active_category]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto p-8 bg-white relative"
    >
      {saveStatus && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4"
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

      {isSubmitted && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">
            Your answers have been submitted. Please wait for the survey administrator to advance to the next category.
          </p>
        </div>
      )}

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
            className="text-2xl font-semibold mb-8 text-gray-800"
          >
            {category.title}
          </motion.h2>

          {category.questions.map((question, questionIndex) => (
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
                        className="form-radio text-blue-500 focus:ring-blue-500 h-5 w-5"
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
                            className="sr-only" // hidden but accessible
                          />
                          <div 
                            className={`
                              cursor-pointer text-center p-3 rounded-lg border-2 
                              ${isSelected 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                              } 
                              transition-colors
                            `}
                          >
                            <span className="text-lg font-medium">{value}</span>
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
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-colors resize-none min-h-[120px]"
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
    {!isSubmitted && categoriesToShow.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <button
            onClick={handleSubmit}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Save & Submit Answers
          </button>
        </motion.div>
      )}

    </motion.div>
  );
}
