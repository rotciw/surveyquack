import { useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/utils/auth.server";
import { getSupabaseClient } from "~/utils/supabase.server";
import { SurveyStats } from "~/components/SurveyStats";
import { Survey, SurveyResponse } from "~/models/survey";

interface AuthUser {
  id: string;
  // add other user properties if needed
}

type LoaderData = {
  survey: Survey;
  responses: SurveyResponse[]
};

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const user = await getAuthenticator(context).isAuthenticated(request, {
    failureRedirect: "/login",
  }) as AuthUser;

  const supabase = getSupabaseClient(context);
  const { surveyId } = params;

  if (!surveyId) throw new Error("Survey ID is required");
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
    .eq('survey_id', surveyId)
    .returns<Array<{
      id: string;
      title: string;
      questions: Array<{
        id: string;
        title: string;
      }>;
    }>>();

  if (categoriesError) throw new Error(categoriesError.message);

  // Get all responses with taker_id
  const { data: responses } = await supabase
    .from('survey_responses')
    .select('question_id, answer_value, taker_id')
    .eq('survey_id', surveyId)
    .returns<SurveyResponse[]>();

  const fullSurvey: Survey = {
    ...survey,
    categories: categories || [],
  } as Survey;

  return json<LoaderData>({ survey: fullSurvey, responses: responses || [] });
};

export default function SurveyStatsPage() {
  const { survey, responses } = useLoaderData<LoaderData>();
  return <SurveyStats survey={survey} responses={responses} />;
} 