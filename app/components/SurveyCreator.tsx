import { Link, useFetcher } from "@remix-run/react";
import React, { useEffect, useState } from "react";
import { Category, Question, Survey } from "~/models/survey";
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
    newCategories[categoryIndex].questions.push({
      id: crypto.randomUUID(),
      title: "Untitled Question",
      type: "multiple_choice",
      options: ["Option 1"],
    });
    setSurvey({ ...survey, categories: newCategories });
    setActiveQuestion(newCategories[categoryIndex].questions.length - 1);
  };

  const removeQuestion = (categoryIndex: number, questionIndex: number) => {
    if (survey.categories[categoryIndex].questions.length > 1) {
      const newCategories = [...survey.categories];
      newCategories[categoryIndex].questions.splice(questionIndex, 1);
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
    };
    newCategories[categoryIndex].questions.splice(questionIndex + 1, 0, newQuestion);
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
            },
          ],
        },
      ],
    });
    setActiveCategory(survey.categories.length);
    setActiveQuestion(0);
  };

  const removeCategory = (categoryIndex: number) => {
    if (survey.categories.length > 1) {
      const newCategories = [...survey.categories];
      newCategories.splice(categoryIndex, 1);
      setSurvey({ ...survey, categories: newCategories });
      setActiveCategory(Math.min(categoryIndex, newCategories.length - 1));
      setActiveQuestion(0);
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

  return (
    <div className="my-4">
        
      {uniqueUrl && (
        <div className="max-w-4xl mx-auto mb-4 p-4 bg-white shadow-lg rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Survey URL</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={uniqueUrl}
                  readOnly
                  className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm text-gray-700 w-full"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(uniqueUrl)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="ml-4">
              <Link
                to={uniqueUrl}
                target="_blank"
                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
              >
                Preview
              </Link>
            </div>
          </div>
        </div>
      )}
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-4">
      
      <div className="flex justify-between items-center mb-6">
   
        <input
          type="text"
          value={survey.title}
          onChange={(e) => updateSurveyTitle(e.target.value)}
          className="text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 border-b-2 border-gray-200 hover:border-orange-300 transition-colors px-2 py-1 rounded-t-md "
          placeholder="Untitled Survey"
        />
        <div className="flex items-center gap-4">
        
          <span className={`text-sm ${survey.status === 'open' ? 'text-green-600' : 'text-red-600'}`}>
            {survey.status === 'open' ? 'Survey is open' : 'Survey is closed'}
          </span>
          <button
            onClick={toggleSurveyStatus}
            className={`px-4 py-2 rounded-md text-white ${
              survey.status === 'open' 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {survey.status === 'open' ? 'Close Survey' : 'Open Survey'}
          </button>
          <Link
            to={`/survey/${survey.id}/stats`}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            View Stats
          </Link>
        </div>
      </div>

      <div className="flex">
        <div className="w-1/4 pr-4 border-r">
          {survey.categories?.map((category, index) => (
            <div key={category.id}>
              <div
                className={`p-2 mb-2 cursor-pointer rounded ${
                  index === activeCategory ? 'bg-indigo-100' : 'hover:bg-gray-100'
                }`}
                onClick={() => {
                  setActiveCategory(index);
                  setActiveQuestion(0);
                }}
              >
                <span>{category.title}</span>
                <textarea
                  className="mt-2 w-full p-2 text-sm border rounded"
                  placeholder="Add category description (optional)"
                  value={category.description || ''}
                  onChange={(e) => {
                    const newCategories = [...survey.categories];
                    newCategories[index] = {
                      ...newCategories[index],
                      description: e.target.value
                    };
                    setSurvey({ ...survey, categories: newCategories });
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          ))}
          <button
            onClick={addCategory}
            className="w-full mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Category
          </button>
        </div>
        <div className="w-3/4 pl-4">
          <input
            type="text"
            value={survey?.categories ? survey.categories[activeCategory]?.title : ''}
            onChange={(e) => updateCategoryTitle(activeCategory, e.target.value)}
            className="text-xl font-semibold mb-4 w-full border-b border-gray-200 focus:border-indigo-500 focus:outline-none"
            placeholder="Untitled Category"
          />
          {survey.categories && survey.categories[activeCategory]?.questions.map((question, index) => (
            <div
              key={question.id}
              className={`p-4 mb-4 border rounded ${
                index === activeQuestion ? 'border-indigo-500' : 'border-gray-200'
              }`}
              onClick={() => setActiveQuestion(index)}
            >
              <div className="flex justify-between items-center mb-2">
                <input
                  type="text"
                  value={question.title}
                  onChange={(e) => updateQuestionTitle(activeCategory, index, e.target.value)}
                  className="text-lg font-medium w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors"
                  placeholder="Question Title"
                />
                <div className="ml-2">
                  <button
                    onClick={() => duplicateQuestion(activeCategory, index)}
                    className="mr-2 text-blue-500 hover:text-blue-700"
                  >
                    Copy
                  </button>
                  {survey.categories[activeCategory].questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(activeCategory, index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <select
                value={question.type}
                onChange={(e) => updateQuestionType(activeCategory, index, e.target.value as 'multiple_choice' | 'free_text' | 'linear_scale')}
                className="mb-2 p-2 border rounded"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="free_text">Free Text</option>
                <option value="linear_scale">Linear Scale</option>
              </select>
              {question.type === 'linear_scale' && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700">Scale Range</label>
                  <div className="flex items-center mt-1">
                    <input
                      type="number"
                      value={question.scale_start}
                      onChange={(e) => updatescale_start(activeCategory, index, parseInt(e.target.value))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors mr-2"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      value={question.scale_end}
                      onChange={(e) => updatescale_end(activeCategory, index, parseInt(e.target.value))}
                      className="w-20 p-2 border rounded ml-2"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">Scale Labels</label>
                    <div className="flex items-center mt-1">
                      <input
                        type="text"
                        value={question.scale_left_label || ''}
                        onChange={(e) => updateScaleLabel(activeCategory, index, 'left', e.target.value)}
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors mr-2"
                        placeholder="Left label"
                      />
                      <input
                        type="text"
                        value={question.scale_right_label || ''}
                        onChange={(e) => updateScaleLabel(activeCategory, index, 'right', e.target.value)}
                        className="w-1/2 p-2 border rounded ml-2"
                        placeholder="Right label"
                      />
                    </div>
                  </div>
                </div>
              )}
              {question.type === 'multiple_choice' && (
                <div>
                  {question.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(activeCategory, index, optionIndex, e.target.value)}
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors"
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      <button
                        onClick={() => removeOption(activeCategory, index, optionIndex)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addOption(activeCategory, index)}
                    className="mt-2 py-1 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Option
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => addQuestion(activeCategory)}
            className="w-full mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Add Question
          </button>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          className="mt-8 flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {surveyId ? 'Save Survey' : 'Create Survey'}
        </button>
        {surveyId && (
          <button
            onClick={handleDelete}
            className="mt-8 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Survey
          </button>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
