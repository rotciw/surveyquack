import { json, LoaderFunction } from "@remix-run/cloudflare";
import { supabase } from "~/utils/supabase.server";

export const loader: LoaderFunction = async ({ params }) => {
  const { surveyId } = params;

  const { data: survey, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', surveyId)
    .single();

  if (error || !survey) {
    return json({ error: "Survey not found" }, { status: 404 });
  }

  return json({ survey });
};
