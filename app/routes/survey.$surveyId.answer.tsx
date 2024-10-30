import React from "react";
import { useLoaderData, useParams } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { SurveyTaker } from "~/components/SurveyTaker";
import type { Survey, Answer, SurveyResponse } from "~/models/survey";
import { getSupabaseClient } from "~/utils/supabase.server";
import { getSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ params, context, request }) => {
    const supabase = getSupabaseClient(context);
    const { surveyId } = params;
    const session = await getSession(context, request.headers.get("Cookie"));
    const takerId = session.get("takerId");

    if (!surveyId) throw new Error("Survey ID is required");

    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('id, title, active_category, status')
      .eq('id', surveyId)
      .single();

    if (surveyError || !survey) {
      console.error("Error fetching survey:", surveyError);
      return json({ error: "Failed to load survey" }, { status: 500 });
    }

    if (survey.status !== 'open') {
      return json({ error: "This survey is currently closed" }, { status: 403 });
    }

    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, title, questions(id, title, subtitle, type, options, scale_start, scale_end, scale_left_label, scale_right_label)')
      .eq('survey_id', surveyId);

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
      return json({ error: "Failed to load survey categories" }, { status: 500 });
    }

    let existingAnswers: Answer[] = [];
    let isSubmitted = false;

    if (takerId) {
      const { data: surveyResponses, error: responsesError } = await supabase
        .from('survey_responses')
        .select(`
          question_id,
          answer_value,
          status,
          survey_id,
          taker_id,
          updated_at
        `)
        .eq('survey_id', surveyId)
        .eq('taker_id', takerId);

      if (responsesError) {
        console.error("Error fetching responses:", responsesError);
      } else if (surveyResponses && surveyResponses.length > 0) {
        existingAnswers = surveyResponses.map(response => ({
          questionId: response.question_id,
          value: response.answer_value
        }));
        isSubmitted = surveyResponses.some(response => response.status === 'submitted');
      }
    }

    const fullSurvey = {
      ...survey,
      categories: categories || []
    };

    return json({ 
      survey: fullSurvey,
      answers: existingAnswers,
      isSubmitted
    });
};

export default function SurveyAnswerPage() {
  const { survey, answers, isSubmitted } = useLoaderData<typeof loader>();
  return <SurveyTaker survey={survey} answers={answers} isSubmitted={isSubmitted} />;
}