import { useState } from "react";
import type { Survey, SurveyResponse } from "~/models/survey";
import { AdminLayout } from "./AdminLayout";
import { CategoryManagement } from "./stats/CategoryManagement";
import { SurveyStatistics } from "./stats/SurveyStatistics";
import { useFetcher } from "@remix-run/react";

export function SurveyStats({ survey: initialSurvey, responses }: { survey: Survey; responses: SurveyResponse[] }) {
  const [survey, setSurvey] = useState(initialSurvey);
  const [selectedCategoryStats, setSelectedCategoryStats] = useState<string | null>(null);
  const fetcher = useFetcher();

  const handleCategoryChange = (categoryId: string) => {
    setSurvey(prev => ({ ...prev, active_category: categoryId }));
    
    fetcher.submit(
      { categoryId },
      { 
        method: "post", 
        action: `/api/survey/${survey.id}/activate-category`
      }
    );
  };

  return (
    <AdminLayout
      survey={{
        id: survey.id,
        title: survey.title
      }}
      sidebar={
        <CategoryManagement 
          survey={survey}
          onCategoryChange={handleCategoryChange}
          onCategoryStatsSelect={setSelectedCategoryStats}
          selectedCategoryStats={selectedCategoryStats}
        />
      }
      content={
        <SurveyStatistics 
          survey={survey}
          responses={responses}
          selectedCategoryId={selectedCategoryStats}
        />
      }
    />
  );
} 