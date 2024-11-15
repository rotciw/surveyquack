import { json, LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { SurveyCreator } from "~/components/SurveyCreator";
import { Survey } from "~/models/survey";
import { getAuthenticator } from "~/utils/auth.server";
import { getSupabaseClient } from "~/utils/supabase.server";

interface User {
  id: string;
  // add other user properties as needed
}

interface LoaderData {
  survey: Survey;
  surveyUrl: string;
}

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const { surveyId } = params;
  const supabase = getSupabaseClient(context);
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);

  // First get the survey
  const { data: survey, error: surveyError } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', surveyId)
    .single();

  if (surveyError) throw new Error(surveyError.message);
  if (!survey) throw new Error("Survey not found");

  // Then get categories with their questions
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select(`
      id, 
      title,
      description,
      questions (id, title, type, options, scale_start, scale_end, scale_left_label, scale_right_label, order)
    `)
    .eq('survey_id', surveyId)
    .order('order')
  if (categoriesError) throw new Error(categoriesError.message);

  // Only set categories if they exist from the database
  const fullSurvey = {
    ...survey,
    categories: categories || [] // Don't create new categories if none exist
  };

  return json({ 
    survey: fullSurvey,
    surveyUrl: `${new URL(request.url).origin}/survey/${survey.id}/answer`
  });
};

export default function ManageSurvey() {
  const { survey, surveyUrl } = useLoaderData<typeof loader>() as LoaderData;
  
  return <SurveyCreator user={{ id: survey.user_id }} surveyId={survey.id} initialSurvey={survey} initialUrl={surveyUrl} />;
}
