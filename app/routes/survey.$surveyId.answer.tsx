import React from "react";
import { useLoaderData, useParams } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { SurveyTaker } from "~/components/SurveyTaker";
import type { Survey } from "~/models/survey";
import { supabase } from "~/utils/supabase.server";

export const loader: LoaderFunction = async ({ params }) => {
    const { surveyId } = params;
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('id, title, active_category')
      .eq('id', surveyId)
      .single();

    if (surveyError) {
      console.error("Error fetching survey:", surveyError);
      return json({ error: "Failed to load survey" }, { status: 500 });
    }

    if (!survey) {
      return json({ error: "Survey not found" }, { status: 404 });
    }

    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, title, questions(id, title, subtitle, type, options, scale_start, scale_end, scale_left_label, scale_right_label)')
      .eq('survey_id', surveyId);

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
      return json({ error: "Failed to load survey categories" }, { status: 500 });
    }

    const fullSurvey = {
      ...survey,
      categories: categories || []
    };

    return json({ survey: fullSurvey });
};

export default function SurveyPage() {
  const { survey, error } = useLoaderData<{ survey?: Survey, error?: string }>();
  const { surveyId } = useParams();

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!survey) {
    return <div>No survey found with ID: {surveyId}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{survey.title}</h1>
      <SurveyTaker survey={survey} />
    </div>
  );
}