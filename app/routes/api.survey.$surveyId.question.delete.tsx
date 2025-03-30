import { ActionFunction, json } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/utils/auth.server";
import { getSupabaseClient } from "~/utils/supabase.server";

export const action: ActionFunction = async ({ request, params, context }) => {
  try {
    const user = await getAuthenticator(context).isAuthenticated(request, {
      failureRedirect: "/login",
    }) as { id: string };

    const { surveyId } = params;
    if (!surveyId) {
      return json({ success: false, message: "Survey ID is required" }, { status: 400 });
    }

    const formData = await request.formData();
    const questionId = formData.get("questionId") as string;

    if (!questionId) {
      return json({ success: false, message: "Question ID is required" }, { status: 400 });
    }

    const supabase = getSupabaseClient(context);

    // First verify the user owns this survey
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('user_id')
      .eq('id', surveyId)
      .single();

    if (surveyError || !survey) {
      return json({ 
        success: false, 
        message: "Survey not found or you don't have permission to delete this question" 
      }, { status: 404 });
    }

    if (survey.user_id !== user.id) {
      return json({ 
        success: false, 
        message: "You don't have permission to delete this question" 
      }, { status: 403 });
    }

    // Delete options for this question first
    try {
      const { error: optionsError } = await supabase
        .from('options')
        .delete()
        .eq('question_id', questionId);
        
      if (optionsError) {
        console.log("Note: Error deleting options:", optionsError.message);
      }
    } catch (err) {
      console.log("Caught error deleting options:", err);
    }
    
    // Delete answers for this question
    try {
      const { error: answersError } = await supabase
        .from('answers')
        .delete()
        .eq('question_id', questionId);
        
      if (answersError) {
        console.log("Note: Error deleting answers:", answersError.message);
      }
    } catch (err) {
      console.log("Caught error deleting answers:", err);
    }
    
    // Delete survey responses for this question
    try {
      const { error: responsesError } = await supabase
        .from('survey_responses')
        .delete()
        .eq('question_id', questionId);
        
      if (responsesError) {
        console.log("Note: Error deleting survey responses:", responsesError.message);
      }
    } catch (err) {
      console.log("Caught error deleting survey responses:", err);
    }
    
    // Finally delete the question
    const { error: questionDeleteError } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);
      
    if (questionDeleteError) {
      console.error("Error deleting question:", questionDeleteError);
      return json({ 
        success: false, 
        message: `Failed to delete question: ${questionDeleteError.message}` 
      }, { status: 500 });
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error in delete question action:", error);
    return json({ 
      success: false, 
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 });
  }
}; 