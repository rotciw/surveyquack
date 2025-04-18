import { ActionFunction, json } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/utils/auth.server";
import { getSupabaseClient } from "~/utils/supabase.server";

export const action: ActionFunction = async ({ request, params, context }) => {
  const user = await getAuthenticator(context).isAuthenticated(request, {
    failureRedirect: "/login",
  }) as { id: string };

  const { surveyId } = params;
  const formData = await request.formData();
  const status = formData.get("status") as string;

  const supabase = getSupabaseClient(context);

  if (!surveyId) throw new Error("Survey ID is required");

  const { data: survey, error: surveyError } = await supabase
    .from('surveys')
    .select('user_id')
    .eq('id', surveyId)
    .single();

  if (surveyError) throw new Error(surveyError.message);
  if (survey.user_id !== user.id) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const { error } = await supabase
    .from('surveys')
    .update({ status })
    .eq('id', surveyId);

  if (error) throw new Error(error.message);
  
  return json({ 
    success: true,
    status: status 
  });
}; 