import React, { useState, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import type { Survey, Answer } from "~/models/survey";


export function SurveyTaker({ survey }: { survey: Survey }) {
  const fetcher = useFetcher();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(survey.activeCategory);

  useEffect(() => {
    const eventSource = new EventSource(`/api/survey/${survey.id}/category`);
    eventSource.onmessage = (event) => {
      if (event.data !== ": keepalive") {
        setActiveCategory(event.data);
      }
    };
    return () => eventSource.close();
  }, [survey.id]);

  const handleSubmit = () => {
    fetcher.submit(
      { answers: JSON.stringify(answers) },
      { method: "post", action: `/api/survey/${survey.id}/submit` }
    );
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prevAnswers) => {
      const existingAnswerIndex = prevAnswers.findIndex((a) => a.questionId === questionId);
      if (existingAnswerIndex > -1) {
        return prevAnswers.map((a, index) =>
          index === existingAnswerIndex ? { ...a, value } : a
        );
      } else {
        return [...prevAnswers, { questionId, value }];
      }
    });
  };

  const activeCategories = activeCategory
    ? survey.categories.filter((category) => category.id === activeCategory)
    : survey.categories;


  return (
    <div className="max-w-3xl mx-auto p-8 bg-white">
      <h1 className="text-4xl font-bold mb-12 text-center text-gray-900">{survey.title}</h1>
      {activeCategories.map((category, categoryIndex) => (
        <div key={category.id} className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-gray-800">{category.title}</h2>
          {category.questions.map((question, questionIndex) => (
            <div key={question.id} className="mb-12 last:mb-0">
              <h3 className="text-xl font-medium mb-4 text-gray-800">
                {`${categoryIndex + 1}.${questionIndex + 1} ${question.title}`}
              </h3>
              {question.subtitle && (
                <p className="text-base text-gray-600 mb-4">{question.subtitle}</p>
              )}
              {question.type === 'multiple_choice' && (
                <div className="space-y-3">
                  {question.options?.map((option, optionIndex) => (
                    <label key={option} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="form-radio text-blue-500 focus:ring-blue-500 h-5 w-5"
                      />
                      <span className="text-gray-700 text-lg">{option}</span>
                    </label>
                  ))}
                </div>
              )}
              {question.type === 'free_text' && (
                <textarea
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Your answer"
                  rows={4}
                />
              )}
              {question.type === 'linear_scale' && (
                <div className="my-6">
                  <div className="flex justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">{question.scale_left_label || ''}</span>
                    <span className="text-sm font-medium text-gray-600">{question.scale_right_label || ''}</span>
                  </div>
                  <div className="flex justify-between" style={{ gap: '0.25rem' }}>
                    {Array.from({ length: (question.scale_end || 5) - (question.scale_start || 1) + 1 }, (_, index) => {
                      const value = (question.scale_start || 1) + index;
                      return (
                        <label key={index} className="relative flex flex-col items-center group cursor-pointer flex-1">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={value}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="sr-only peer"
                          />
                          <span className="w-6 h-6 bg-white border-2 border-gray-300 rounded-full group-hover:border-blue-500 peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-colors"></span>
                          <span className="mt-2 text-sm font-medium text-gray-700">{value}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      <button
        onClick={handleSubmit}
        className="mt-12 w-full bg-blue-500 text-white px-6 py-4 rounded-lg text-xl font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
      >
        Submit Survey
      </button>
    </div>
  );
}
