import { json, LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { SurveyCreator } from "~/components/SurveyCreator";
import { Survey } from "~/models/survey";
import { authenticator } from "~/utils/auth.server";
import { supabase } from "~/utils/supabase.server";

interface User {
  id: string;
  // add other user properties as needed
}

interface LoaderData {
  survey: Survey
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  }) as User;

  const { surveyId } = params;

  // Fetch survey data
  const { data: survey, error: surveyError } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', surveyId)
    .single();

  if (surveyError) throw new Error(surveyError.message);

  if (!survey) {
    throw new Response("Survey not found", { status: 404 });
  }

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

  const fullSurvey = {
    ...survey,
    categories: categories || []
  };
  console.log(fullSurvey);

  return json({ survey: fullSurvey });
};

export default function ManageSurvey() {
  const { survey } = useLoaderData<typeof loader>() as LoaderData;
  
  return <SurveyCreator user={{ id: survey.user_id }} surveyId={survey.id} initialSurvey={survey} />;
}
