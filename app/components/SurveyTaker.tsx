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
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {activeCategories.map((category) => (
        <div key={category.id} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{category.title}</h2>
          {category.questions.map((question) => (
            <div key={question.id} className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-gray-700">{question.title}</h3>
              {question.subtitle && (
                <p className="text-sm text-gray-600 mb-2">{question.subtitle}</p>
              )}
              {question.type === 'multiple_choice' ? (
                <select
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an option</option>
                  {question.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your answer"
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <button
        onClick={handleSubmit}
        className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        Submit Survey
      </button>
    </div>
  );
}
