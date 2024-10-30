import { ActionFunction, json } from "@remix-run/cloudflare";
import { supabase } from "~/utils/supabase.server";
import { getSession, commitSession } from "~/utils/session.server";
import { v4 as uuidv4 } from 'uuid';

export const action: ActionFunction = async ({ request, params }) => {
  try {
    const { surveyId } = params;
    const formData = await request.formData();
    const answer = JSON.parse(formData.get("answer") as string);
    
    const session = await getSession(request.headers.get("Cookie"));
    let takerId = session.get("takerId");
    if (!takerId) {
      takerId = uuidv4();
      session.set("takerId", takerId);
    }

    // Use upsert with the correct column combination
    const { error } = await supabase
      .from('survey_responses')
      .upsert(
        {
          survey_id: surveyId,
          question_id: answer.questionId,
          taker_id: takerId,
          answer_value: answer.value,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'survey_id,question_id,taker_id'
        }
      );

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to save answer');
    }

    return json(
      { success: true },
      { 
        headers: {
          "Set-Cookie": await commitSession(session)
        }
      }
    );
  } catch (error) {
    console.error('Error in save-answer:', error);
    return json(
      { error: 'Failed to save answer' }, 
      { status: 500 }
    );
  }
};