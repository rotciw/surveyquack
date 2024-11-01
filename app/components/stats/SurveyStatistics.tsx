import { useMemo } from "react";
import type { Survey, SurveyResponse } from "~/models/survey";
import { motion } from "framer-motion";
import { StatCard } from "./StatCard";
import { QuestionStats } from "./QuestionStats";

interface SurveyStatisticsProps {
  survey: Survey;
  responses: SurveyResponse[];
  selectedCategoryId: string | null;
}

export function SurveyStatistics({ survey, responses, selectedCategoryId }: SurveyStatisticsProps) {
  const stats = useMemo(() => {
    const uniqueRespondents = new Set(responses.map(r => r.taker_id)).size;
    
    // Calculate response rate per question
    const questionResponseRates = survey.categories.flatMap(cat => 
      cat.questions.map(q => {
        const questionResponses = new Set(
          responses.filter(r => r.question_id === q.id).map(r => r.taker_id)
        ).size;
        return (questionResponses / uniqueRespondents) * 100;
      })
    );
    
    // Average response rate across all questions
    const responseRate = questionResponseRates.length 
      ? questionResponseRates.reduce((a, b) => a + b, 0) / questionResponseRates.length
      : 0;
    
    return {
      uniqueRespondents,
      totalResponses: responses.length,
      responseRate: responseRate.toFixed(1)
    };
  }, [responses, survey]);

  const categoriesToShow = selectedCategoryId 
    ? survey.categories.filter(cat => cat.id === selectedCategoryId)
    : survey.categories;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Respondents"
          value={stats.uniqueRespondents}
          icon="👥"
        />
        <StatCard
          title="Total Responses"
          value={stats.totalResponses}
          icon="📊"
        />
        <StatCard
          title="Response Rate"
          value={`${stats.responseRate}%`}
          icon="📈"
        />
      </div>

      <div className="space-y-6">
        {categoriesToShow.map(category => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold mb-4">{category.title}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {category.questions.map(question => (
                <QuestionStats
                  key={question.id}
                  question={question}
                  responses={responses.filter(r => r.question_id === question.id)}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 