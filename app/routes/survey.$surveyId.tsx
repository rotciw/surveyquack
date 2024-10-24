import React from "react";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { SurveyTaker } from "~/components/SurveyTaker";
import type { Survey } from "~/models/survey";
import { supabase } from "~/utils/supabase.server";

export const loader: LoaderFunction = async ({ params }) => {
    const { surveyId } = params;
  
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('id, title')
      .eq('id', surveyId)
      .single();
  
    if (surveyError) throw new Error(surveyError.message);
  
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, title, questions(id, title, subtitle, type, options, scale_start, scale_end, scale_left_label, scale_right_label)')
      .eq('survey_id', surveyId);
  
    if (categoriesError) throw new Error(categoriesError.message);
  
    const fullSurvey = {
      ...survey,
      categories: categories
    };
  
    return json({ survey: fullSurvey });
};

export default function SurveyPage() {
  const { survey } = useLoaderData<{ survey: Survey }>();
  console.log(survey.categories[0].questions);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{survey.title}</h1>
      <SurveyTaker survey={survey} />
    </div>
  );
}
