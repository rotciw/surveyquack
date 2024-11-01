import { ActionFunction, json } from "@remix-run/cloudflare";
import { getSupabaseClient } from "~/utils/supabase.server";
import { getSession } from "~/utils/session.server";

export const action: ActionFunction = async ({ request, params, context }) => {
  try {
    const { surveyId } = params;
    if (!surveyId) throw new Error("Survey ID is required");
    
    const formData = await request.formData();
    const answers = JSON.parse(formData.get("answers") as string);
    const session = await getSession(context, request.headers.get("Cookie"));
    const takerId = session.get("takerId");
    
    if (!takerId) {
      return json({ error: 'Session expired. Please refresh the page.' }, { status: 401 });
    }
    
    const supabase = getSupabaseClient(context);

    // Get the current active category
    const { data: survey } = await supabase
      .from('surveys')
      .select('active_category')
      .eq('id', surveyId)
      .single();

    if (!survey?.active_category) {
      return json({ error: 'No active category found.' }, { status: 400 });
    }

    // Update answers status to submitted
    for (const answer of answers) {
      const { error: answerError } = await supabase
        .from('survey_responses')
        .upsert({
          survey_id: surveyId,
          question_id: answer.questionId,
          taker_id: takerId,
          answer_value: answer.value,
          status: 'submitted',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'survey_id,question_id,taker_id'
        });

      if (answerError) throw answerError;
    }

    // Record the category submission
    const { error: submissionError } = await supabase
      .from('category_submissions')
      .insert({
        survey_id: surveyId,
        category_id: survey.active_category,
        taker_id: takerId,
        submitted_at: new Date().toISOString()
      });

    if (submissionError) {
      console.error('Category submission error:', submissionError);
      throw submissionError;
    }

    return json({ success: true });
  } catch (error) {
    console.error('Error in submit-answers:', error);
    return json({ error: 'Failed to submit answers' }, { status: 500 });
  }
}; 