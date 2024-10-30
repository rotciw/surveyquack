import { useMemo } from "react";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import type { Survey, Question } from "~/models/survey";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Response {
  question_id: string;
  answer_value: string;
  taker_id: string;
}

export function SurveyStats({ survey, responses }: { survey: Survey, responses: Response[] }) {
  const uniqueRespondents = useMemo(() => 
    new Set(responses.map(r => r.taker_id)).size, 
    [responses]
  );

  const getQuestionStats = (question: Question, questionResponses: Response[]) => {
    if (question.type === 'multiple_choice') {
      const optionCounts: Record<string, number> = {};
      question.options?.forEach(option => {
        optionCounts[option] = questionResponses.filter(r => r.answer_value === option).length;
      });

      return {
        type: 'pie',
        data: {
          labels: Object.keys(optionCounts),
          datasets: [{
            data: Object.values(optionCounts),
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
            ],
          }],
        },
      };
    } else if (question.type === 'linear_scale') {
      const values = questionResponses.map(r => parseInt(r.answer_value));
      const counts: Record<number, number> = {};
      for (let i = question.scale_start || 1; i <= (question.scale_end || 5); i++) {
        counts[i] = values.filter(v => v === i).length;
      }

      return {
        type: 'bar',
        data: {
          labels: Object.keys(counts),
          datasets: [{
            label: 'Responses',
            data: Object.values(counts),
            backgroundColor: '#36A2EB',
          }],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      };
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">{survey.title} - Statistics</h1>
      <div className="mb-8 bg-blue-50 p-4 rounded-lg">
        <p className="text-lg">Total unique respondents: {uniqueRespondents}</p>
      </div>
      {survey.categories.map(category => (
        <div key={category.id} className="mb-12 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6">{category.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {category.questions.map(question => {
              const questionResponses = responses.filter(r => r.question_id === question.id);
              const stats = getQuestionStats(question, questionResponses);
              
              if (!stats) return null;

              return (
                <div key={question.id} className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">{question.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Total responses: {questionResponses.length}
                  </p>
                  <div className="h-64">
                    {stats.type === 'pie' ? (
                      <Pie data={stats.data} options={{ maintainAspectRatio: false }} />
                    ) : (
                      <Bar data={stats.data} options={{ ...stats.options, maintainAspectRatio: false }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
} 