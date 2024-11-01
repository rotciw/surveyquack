import { useMemo } from "react";
import { Question, SurveyResponse } from "~/models/survey";
import { 
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, 
  Tooltip, CartesianGrid 
} from 'recharts';
import { motion } from "framer-motion";

interface QuestionStatsProps {
  question: Question;
  responses: SurveyResponse[];
}

export function QuestionStats({ question, responses }: QuestionStatsProps) {
  const data = useMemo(() => {
    if (question.type === 'multiple_choice' || question.type === 'linear_scale') {
      const counts: Record<string, number> = {};
      responses.forEach(r => {
        counts[r.answer_value] = (counts[r.answer_value] || 0) + 1;
      });
      
      if (question.type === 'linear_scale' && question.scale_start !== undefined && question.scale_end !== undefined) {
        for (let i = question.scale_start; i <= question.scale_end; i++) {
          counts[i.toString()] = counts[i.toString()] || 0;
        }
      }

      return Object.entries(counts)
        .sort((a, b) => question.type === 'linear_scale' ? Number(a[0]) - Number(b[0]) : 0)
        .map(([name, value]) => ({ name, value }));
    }

    return [];
  }, [question, responses]);

  const stats = useMemo(() => {
    if (responses.length === 0) return null;

    if (question.type === 'linear_scale') {
      const numericResponses = responses
        .map(r => Number(r.answer_value))
        .filter(n => !isNaN(n));

      if (numericResponses.length === 0) return null;

      const average = numericResponses.reduce((a, b) => a + b, 0) / numericResponses.length;
      const mode = numericResponses.sort((a,b) =>
        numericResponses.filter(v => v === a).length - numericResponses.filter(v => v === b).length
      ).pop();

      return {
        average: average.toFixed(1),
        mode: mode,
        total: responses.length
      };
    }

    return {
      total: responses.length
    };
  }, [responses, question.type]);

  // Calculate unique respondents
  const uniqueRespondents = new Set(responses.map(r => r.taker_id)).size;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-6 shadow-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-medium text-gray-900">{question.title}</h3>
        <span className="text-sm text-gray-500">
          {uniqueRespondents} {uniqueRespondents === 1 ? 'response' : 'responses'}
        </span>
      </div>

      {(question.type === 'multiple_choice' || question.type === 'linear_scale') && (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="value" 
                  fill={question.type === 'multiple_choice' ? '#8884d8' : '#82ca9d'}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {stats  && (
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Average</p>
                <p className="text-lg font-semibold">{stats.average}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Most Common</p>
                <p className="text-lg font-semibold">{stats.mode}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Total Responses</p>
                <p className="text-lg font-semibold">{stats.total}</p>
              </div>
            </div>
          )}
        </>
      )}

      {question.type === 'free_text' && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {responses.length === 0 ? (
            <p className="text-gray-500 italic">No responses yet</p>
          ) : (
            responses.map((response) => (
              <div 
                key={response.id} 
                className="p-4 bg-gray-50 rounded-lg"
              >
                <p className="text-gray-700 whitespace-pre-wrap">{response.answer_value}</p>
              </div>
            ))
          )}
        </div>
      )}

      {question.type === 'linear_scale' && (
        <div className="mt-4 text-sm text-gray-500 flex justify-between">
          <span>{question.scale_left_label}</span>
          <span>{question.scale_right_label}</span>
        </div>
      )}
    </motion.div>
  );
} 