import React, { useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import type { Survey, Category, Question } from "~/models/survey";

export function SurveyCreator() {
    const fetcher = useFetcher();
    const [survey, setSurvey] = useState<Survey>({
      id: "",
      title: "",
      categories: [],
    });
    const [uniqueUrl, setUniqueUrl] = useState<string | null>(null);

  const addCategory = () => {
    setSurvey({
      ...survey,
      categories: [...survey.categories, { id: Date.now().toString(), title: "", questions: [] }],
    });
  };

  const addQuestion = (categoryId: string) => {
    setSurvey({
      ...survey,
      categories: survey.categories.map(category =>
        category.id === categoryId
          ? {
              ...category,
              questions: [
                ...category.questions,
                { id: Date.now().toString(), title: "", type: "free_text", options: [] },
              ],
            }
          : category
      ),
    });
  };

  const addOption = (categoryId: string, questionId: string) => {
    setSurvey({
      ...survey,
      categories: survey.categories.map(category =>
        category.id === categoryId
          ? {
              ...category,
              questions: category.questions.map(question =>
                question.id === questionId
                  ? {
                      ...question,
                      options: [...(question.options || []), ""],
                    }
                  : question
              ),
            }
          : category
      ),
    });
  };

  const deleteCategory = (categoryId: string) => {
    setSurvey({
      ...survey,
      categories: survey.categories.filter(category => category.id !== categoryId),
    });
  };

  const deleteQuestion = (categoryId: string, questionId: string) => {
    setSurvey({
      ...survey,
      categories: survey.categories.map(category =>
        category.id === categoryId
          ? {
              ...category,
              questions: category.questions.filter(question => question.id !== questionId),
            }
          : category
      ),
    });
  };

  const deleteOption = (categoryId: string, questionId: string, optionIndex: number) => {
    setSurvey({
      ...survey,
      categories: survey.categories.map(category =>
        category.id === categoryId
          ? {
              ...category,
              questions: category.questions.map(question =>
                question.id === questionId
                  ? {
                      ...question,
                      options: question.options?.filter((_, index) => index !== optionIndex),
                    }
                  : question
              ),
            }
          : category
      ),
    });
  };

  const handleSubmit = () => {
    fetcher.submit(
      { survey: JSON.stringify(survey) },
      { method: "post", action: "/api/surveys" }
    );
  };

    useEffect(() => {
    if (fetcher.data && fetcher.data.url) {
      setUniqueUrl(fetcher.data.url);
    }
  }, [fetcher.data]);
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Create Survey</h1>
      <input
        type="text"
        value={survey.title}
        onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
        placeholder="Survey Title"
        className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {survey.categories.map((category, categoryIndex) => (
        <div key={category.id} className="mb-6 p-4 border rounded">
          <div className="flex justify-between items-center mb-2">
            <input
              type="text"
              value={category.title}
              onChange={(e) =>
                setSurvey({
                  ...survey,
                  categories: survey.categories.map((c, i) =>
                    i === categoryIndex ? { ...c, title: e.target.value } : c
                  ),
                })
              }
              placeholder="Category Title"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => deleteCategory(category.id)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
          {category.questions.map((question, questionIndex) => (
            <div key={question.id} className="ml-4 mb-4 p-3 border rounded">
              <div className="flex justify-between items-center mb-2">
                <input
                  type="text"
                  value={question.title}
                  onChange={(e) =>
                    setSurvey({
                      ...survey,
                      categories: survey.categories.map((c, ci) =>
                        ci === categoryIndex
                          ? {
                              ...c,
                              questions: c.questions.map((q, qi) =>
                                qi === questionIndex
                                  ? { ...q, title: e.target.value }
                                  : q
                              ),
                            }
                          : c
                      ),
                    })
                  }
                  placeholder="Question Title"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => deleteQuestion(category.id, question.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
              <input
                type="text"
                value={question.subtitle || ""}
                onChange={(e) =>
                  setSurvey({
                    ...survey,
                    categories: survey.categories.map((c, ci) =>
                      ci === categoryIndex
                        ? {
                            ...c,
                            questions: c.questions.map((q, qi) =>
                              qi === questionIndex
                                ? { ...q, subtitle: e.target.value }
                                : q
                            ),
                          }
                        : c
                    ),
                  })
                }
                placeholder="Question Subtitle"
                className="w-full p-2 mb-1 border rounded"
              />
              <select
                value={question.type}
                onChange={(e) =>
                  setSurvey({
                    ...survey,
                    categories: survey.categories.map((c, ci) =>
                      ci === categoryIndex
                        ? {
                            ...c,
                            questions: c.questions.map((q, qi) =>
                              qi === questionIndex
                                ? { ...q, type: e.target.value as "multiple_choice" | "free_text" }
                                : q
                            ),
                          }
                        : c
                    ),
                  })
                }
                className="w-full p-2 mb-1 border rounded"
              >
                <option value="free_text">Free Text</option>
                <option value="multiple_choice">Multiple Choice</option>
              </select>
              {question.type === 'multiple_choice' && (
                <div className="ml-4">
                  {question.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          setSurvey({
                            ...survey,
                            categories: survey.categories.map((c, ci) =>
                              ci === categoryIndex
                                ? {
                                    ...c,
                                    questions: c.questions.map((q, qi) =>
                                      qi === questionIndex
                                        ? {
                                            ...q,
                                            options: q.options?.map((o, oi) =>
                                              oi === optionIndex ? e.target.value : o
                                            ),
                                          }
                                        : q
                                    ),
                                  }
                                : c
                            ),
                          })
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => deleteOption(category.id, question.id, optionIndex)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addOption(category.id, question.id)}
                    className="bg-green-500 text-white px-2 py-1 rounded mt-1 hover:bg-green-600"
                  >
                    Add Option
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => addQuestion(category.id)}
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Add Question
          </button>
        </div>
      ))}
      <button
        onClick={addCategory}
        className="bg-purple-500 text-white px-4 py-2 rounded mr-2 hover:bg-purple-600"
      >
        Add Category
      </button>
      <button
        onClick={handleSubmit}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Create Survey
      </button>
      {uniqueUrl && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="font-semibold">Unique Survey URL:</p>
          <a href={uniqueUrl} className="text-blue-500 hover:underline">
            {window.location.origin + uniqueUrl}
          </a>
        </div>
      )}
    </div>
  );
}
