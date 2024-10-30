import { useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/cloudflare";
import { authenticator } from "~/utils/auth.server";
import { supabase } from "~/utils/supabase.server";
import { SurveyStats } from "~/components/SurveyStats";

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { surveyId } = params;

  // Fetch survey data
  const { data: survey, error: surveyError } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', surveyId)
    .single();

  if (surveyError) throw new Error(surveyError.message);
  if (!survey) throw new Response("Survey not found", { status: 404 });
  if (survey.user_id !== user.id) {
    throw new Response("Unauthorized", { status: 403 });
  }

  // Fetch categories with their questions
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select(`
      id, 
      title,
      questions (id, title, type, options, scale_start, scale_end, scale_left_label, scale_right_label)
    `)
    .eq('survey_id', surveyId);

  if (categoriesError) throw new Error(categoriesError.message);

  // Get all responses with taker_id
  const { data: responses } = await supabase
    .from('survey_responses')
    .select('question_id, answer_value, taker_id')
    .eq('survey_id', surveyId);

  const fullSurvey = {
    ...survey,
    categories: categories || []
  };

  return json({ survey: fullSurvey, responses: responses || [] });
};

export default function SurveyStatsPage() {
  const { survey, responses } = useLoaderData<typeof loader>();
  return <SurveyStats survey={survey} responses={responses} />;
} 