import { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import type { Survey, SurveyResponse } from "~/models/survey";
import { StatCard } from "./StatCard";
import { QuestionStats } from "./QuestionStats";

interface SurveyStatisticsProps {
  survey: Survey;
  responses: SurveyResponse[];
  selectedCategoryId: string | null;
}

export function SurveyStatistics({ survey, responses, selectedCategoryId }: SurveyStatisticsProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  console.log(survey.categories);
  const stats = useMemo(() => {
    // Filter responses by selected category if one is selected
    const relevantResponses = selectedCategoryId 
      ? responses.filter(r => 
          survey.categories
            .find(c => c.id === selectedCategoryId)
            ?.questions.some(q => q.id === r.question_id)
        )
      : responses;

    const uniqueRespondents = new Set(relevantResponses.map(r => r.taker_id)).size;
    
    // Calculate response rate per question for relevant category/categories
    const categoriesToConsider = selectedCategoryId 
      ? survey.categories.filter(c => c.id === selectedCategoryId)
      : survey.categories;

    const questionResponseRates = categoriesToConsider.flatMap(cat => 
      cat.questions.map(q => {
        const questionResponses = new Set(
          relevantResponses.filter(r => r.question_id === q.id).map(r => r.taker_id)
        ).size;
        return (questionResponses / uniqueRespondents) * 100;
      })
    );
    
    const responseRate = questionResponseRates.length 
      ? questionResponseRates.reduce((a, b) => a + b, 0) / questionResponseRates.length
      : 0;
    
    return {
      uniqueRespondents,
      totalResponses: relevantResponses.length,
      responseRate: responseRate.toFixed(1)
    };
  }, [responses, survey, selectedCategoryId]);

  const categoriesToShow = selectedCategoryId 
    ? survey.categories.filter(cat => cat.id === selectedCategoryId)
    : survey.categories;

  const handleScreenshot = async () => {
    if (contentRef.current) {
      try {
        const canvas = await html2canvas(contentRef.current, {
          scale: 2,
          logging: false,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        
        const link = document.createElement('a');
        link.download = `${survey.title}-stats.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Screenshot failed:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleScreenshot}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          📸 Export as Image
        </button>
      </div>

      <div ref={contentRef} className="space-y-8 bg-gray-50 pb-8 rounded-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
          <p className="text-gray-500">Report generated on {new Date().toLocaleDateString()}</p>
        </div>

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
                {category.questions
                  .sort((a, b) => a.order - b.order)
                  .map(question => (
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
    </div>
  );
} 