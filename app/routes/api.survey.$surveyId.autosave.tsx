import { ActionFunction, json } from "@remix-run/cloudflare";
import { getSupabaseClient } from "~/utils/supabase.server";

export const action: ActionFunction = async ({ request, params, context }) => {
  const { surveyId } = params;
  const formData = await request.formData();
  const answers = JSON.parse(formData.get("answers") as string);
  const supabase = getSupabaseClient(context);
    
  const { error } = await supabase
    .from('survey_responses')
    .upsert({
      survey_id: surveyId,
      answers,
      last_updated: new Date().toISOString(),
      status: 'in_progress'
    });

  if (error) throw new Error(error.message);
  return json({ success: true });
}; 