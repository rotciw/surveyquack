import { useMemo, useState, useEffect, useRef } from "react";
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
  const [showAllResponses, setShowAllResponses] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const handleBeforeScreenshot = () => {
      setIsExporting(true);
      setShowAllResponses(true);
    };
    const handleAfterScreenshot = () => {
      setIsExporting(false);
      setShowAllResponses(false);
    };

    window.addEventListener('beforeScreenshot', handleBeforeScreenshot);
    window.addEventListener('afterScreenshot', handleAfterScreenshot);

    return () => {
      window.removeEventListener('beforeScreenshot', handleBeforeScreenshot);
      window.removeEventListener('afterScreenshot', handleAfterScreenshot);
    };
  }, []);

  const data = useMemo(() => {
    const validResponses = responses.filter(r => r.answer_value && r.answer_value.trim().length > 0);

    if (question.type === 'multiple_choice') {
      const counts: Record<string, number> = {};
      question.options?.forEach(option => {
        counts[option] = 0;
      });
      
      validResponses.forEach(r => {
        counts[r.answer_value] = (counts[r.answer_value] || 0) + 1;
      });

      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }));
    }

    if (question.type === 'linear_scale') {
      const counts: Record<string, number> = {};
      validResponses.forEach(r => {
        counts[r.answer_value] = (counts[r.answer_value] || 0) + 1;
      });
      
      if (question.scale_start !== undefined && question.scale_end !== undefined) {
        for (let i = question.scale_start; i <= question.scale_end; i++) {
          counts[i.toString()] = counts[i.toString()] || 0;
        }
      }

      return Object.entries(counts)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([name, value]) => ({ name, value }));
    }

    return [];
  }, [question, responses]);

  const stats = useMemo(() => {
    if (responses.length === 0) return null;

    if (question.type === 'linear_scale') {
      const validResponses = responses
        .map(r => r.answer_value)
        .filter(value => value && value.trim().length > 0);

      const numericResponses = validResponses
        .map(r => Number(r))
        .filter(n => !isNaN(n));

      if (numericResponses.length === 0) return null;

      const average = numericResponses.reduce((a, b) => a + b, 0) / numericResponses.length;
      
      const counts = numericResponses.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      const maxCount = Math.max(...Object.values(counts));
      const modes = Object.entries(counts)
        .filter(([, count]) => count === maxCount)
        .map(([value]) => value)
        .join(', ');

      return {
        average: average.toFixed(1),
        mode: modes,
        total: numericResponses.length
      };
    }

    if (question.type === 'multiple_choice') {
      const answerCounts = responses.reduce((acc, r) => {
        acc[r.answer_value] = (acc[r.answer_value] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const maxCount = Math.max(...Object.values(answerCounts));
      const modes = Object.entries(answerCounts)
        .filter(([, count]) => count === maxCount)
        .map(([value]) => value)
        .join(', ');

      return {
        mode: modes || 'None',
        total: responses.length
      };
    }

    return {
      total: responses.length
    };
  }, [responses, question.type]);

  // Calculate unique respondents
  const uniqueRespondents = new Set(responses.map(r => r.taker_id)).size;

  if (question.type === 'free_text') {
    // Filter out null, undefined, and empty string responses
    const textResponses = responses
      .map(r => r.answer_value)
      .filter(value => value && value.trim().length > 0);
    
    const shouldShowAll = showAllResponses || isExporting;
    const displayResponses = shouldShowAll ? textResponses : textResponses.slice(0, 3);
    
    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-500 mb-2">
          {textResponses.length} responses
        </div>
        <div className="space-y-2">
          {displayResponses.map((response, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
            </div>
          ))}
        </div>
        {!shouldShowAll && textResponses.length > 3 && (
          <button
            onClick={() => setShowAllResponses(true)}
            className="text-blue-500 text-sm hover:underline"
          >
            Show {textResponses.length - 3} more responses
          </button>
        )}
      </div>
    );
  }

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
              <BarChart data={data} margin={{ bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={30}
                  interval={0}
                  label={
                    question.type === 'linear_scale' ? {
                      value: `${question.scale_left_label} ← → ${question.scale_right_label}`,
                      position: 'bottom',
                      offset: 10
                    } : undefined
                  }
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

          {stats && (
            <div className={`mt-4 grid ${question.type === 'linear_scale' ? 'grid-cols-3' : 'grid-cols-2'} gap-4 text-center`}>
              {question.type === 'linear_scale' && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Average</p>
                  <p className="text-lg font-semibold">{stats.average}</p>
                </div>
              )}
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
    </motion.div>
  );
} 