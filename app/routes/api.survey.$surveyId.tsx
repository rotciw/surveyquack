import { ActionFunction, json, redirect } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/utils/auth.server";
import { getSupabaseClient } from "~/utils/supabase.server";

interface User {
  id: string;
  // add other user properties if needed
}

export const action: ActionFunction = async ({ request, params, context }) => {
  if (request.method !== "DELETE") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const user = await getAuthenticator(context).isAuthenticated(request, {
    failureRedirect: "/",
  }) as User;

  const { surveyId } = params;
  const supabase = getSupabaseClient(context);

  if (!surveyId) {
    return json({ error: "Survey ID is required" }, { status: 400 });
  }

  // Verify ownership
  const { data: survey } = await supabase
    .from('surveys')
    .select('user_id')
    .eq('id', surveyId)
    .single();

  if (!survey || survey.user_id !== user.id) {
    return json({ error: "Unauthorized" }, { status: 403 });
  }

  // Call the stored procedure with the correct name
  const { error } = await supabase.rpc('delete_survey_cascade', {
    p_survey_id: surveyId
  });

  if (error) throw new Error(error.message);

  return redirect('/dashboard');
}; 