import { useMemo, useState, useEffect } from "react";
import type { Survey, Question } from "~/models/survey";
import ClientOnly from "./ClientOnly";

interface Response {
  question_id: string;
  answer_value: string;
  taker_id: string;
}

// Separate chart component to handle client-side only chart rendering
function ChartComponent({ type, data, options }: { type: 'pie' | 'bar', data: any, options?: any }) {
  const [Chart, setChart] = useState<JSX.Element | null>(null);
  
  useEffect(() => {
    const loadChart = async () => {
      const chartJs = await import('chart.js');
      const reactChartJs = await import('react-chartjs-2');
      
      const { Chart: ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } = chartJs;
      const { Pie, Bar } = reactChartJs;

      ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

      setChart(type === 'pie' ? (
        <Pie data={data} options={{ maintainAspectRatio: false, ...options }} />
      ) : (
        <Bar data={data} options={{ maintainAspectRatio: false, ...options }} />
      ));
    };
    
    loadChart();
  }, [type, data, options]);

  return (
    <ClientOnly>
      {() => Chart}
    </ClientOnly>
  );
}

// Add this helper function to generate colors
function generateColors(count: number) {
  const colors = [
    '#FF6384', // pink
    '#36A2EB', // blue
    '#FFCE56', // yellow
    '#4BC0C0', // teal
    '#9966FF', // purple
    '#FF9F40', // orange
    '#7CBA3B', // green
    '#EC932F', // dark orange
    '#71B37C', // sage green
    '#B2912F'  // brown
  ];
  
  return Array(count).fill(0).map((_, i) => colors[i % colors.length]);
}

// Helper function to transform the data
function transformLinearScaleData(data: Record<string, number>) {
  const labels = Object.keys(data);
  const colors = [
    '#FF6384', // pink
    '#36A2EB', // blue
    '#FFCE56', // yellow
    '#4BC0C0', // teal
    '#9966FF', // purple
  ];

  return {
    labels: ['Responses'],
    datasets: labels.map((label, index) => ({
      label: label,
      data: [data[label]],
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length],
      borderWidth: 1
    }))
  };
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
        type: 'pie' as const,
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

      const chartData = transformLinearScaleData(counts);

      return {
        type: 'bar' as const,
        data: chartData,
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
                    <ChartComponent type={stats.type} data={stats.data} options={stats.options} />
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