import { useMemo } from "react";
import { Question, SurveyResponse,  } from "~/models/survey";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { motion } from "framer-motion";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface QuestionStatsProps {
  question: Question;
  responses: SurveyResponse[];
}

export function QuestionStats({ question, responses }: QuestionStatsProps) {
  const chartData = useMemo(() => {
    if (question.type === 'multiple_choice') {
      const optionCounts: Record<string, number> = {};
      question.options?.forEach(option => {
        optionCounts[option] = responses.filter(r => r.answer_value === option).length;
      });

      return {
        labels: Object.keys(optionCounts),
        datasets: [{
          data: Object.values(optionCounts),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
          ],
          borderWidth: 1,
        }],
      };
    } else if (question.type === 'linear_scale') {
      const values = responses.map(r => parseInt(r.answer_value));
      const counts: Record<number, number> = {};
      for (let i = question.scale_start || 1; i <= (question.scale_end || 5); i++) {
        counts[i] = values.filter(v => v === i).length;
      }

      return {
        labels: Object.keys(counts),
        datasets: [{
          label: 'Responses',
          data: Object.values(counts),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }],
      };
    }
    return null;
  }, [question, responses]);

  const stats = useMemo(() => {
    if (question.type === 'linear_scale') {
      const values = responses.map(r => parseInt(r.answer_value));
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const mode = values.sort((a, b) => 
        values.filter(v => v === a).length - values.filter(v => v === b).length
      ).pop();

      return {
        average: avg.toFixed(1),
        mode,
        total: responses.length
      };
    }
    return {
      total: responses.length
    };
  }, [question.type, responses]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 p-6 rounded-lg"
    >
      <h3 className="text-lg font-medium mb-4">{question.title}</h3>
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Total Responses: {stats.total}
          {question.type === 'linear_scale' && (
            <>
              <span className="mx-2">•</span>
              Average: {stats.average}
              <span className="mx-2">•</span>
              Most Common: {stats.mode}
            </>
          )}
        </p>
      </div>
      
      <div className="h-64">
        {chartData && (
          question.type === 'multiple_choice' ? (
            <Pie 
              data={chartData}
              options={{
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  }
                },
                maintainAspectRatio: false,
              }}
            />
          ) : (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          )
        )}
      </div>

      {question.type === 'linear_scale' && (
        <div className="mt-4 text-sm text-gray-500 flex justify-between">
          <span>{question.scale_left_label}</span>
          <span>{question.scale_right_label}</span>
        </div>
      )}
    </motion.div>
  );
} 