import { ActionFunction, json } from "@remix-run/cloudflare";
import { getSupabaseClient } from "~/utils/supabase.server";
import { getSession } from "~/utils/session.server";

export const action: ActionFunction = async ({ request, params, context }) => {
  try {
    const { surveyId } = params;
    if (!surveyId) throw new Error("Survey ID is required");
    const session = await getSession(context, request.headers.get("Cookie"));
    const takerId = session.get("takerId");
    
    if (!takerId) throw new Error("No taker ID found");
    
    const supabase = getSupabaseClient(context);
    
    // Update all answers to submitted status
    const { error } = await supabase
      .from('survey_responses')
      .update({ status: 'submitted', updated_at: new Date().toISOString() })
      .eq('survey_id', surveyId)
      .eq('taker_id', takerId);

    if (error) throw new Error(error.message);
    return json({ success: true });
  } catch (error) {
    console.error('Error in submit-answers:', error);
    return json({ error: 'Failed to submit answers' }, { status: 500 });
  }
}; 