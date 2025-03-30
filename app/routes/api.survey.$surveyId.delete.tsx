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
        message: "Survey not found or you don't have permission to delete it" 
      }, { status: 404 });
    }

    if (survey.user_id !== user.id) {
      return json({ 
        success: false, 
        message: "You don't have permission to delete this survey" 
      }, { status: 403 });
    }

    console.log(`Starting deletion process for survey: ${surveyId}`);
    
    // Step 1: Break circular dependencies
    // Clear the active_category reference in the survey
    console.log("Clearing active_category reference in survey...");
    const { error: updateError } = await supabase
      .from('surveys')
      .update({ active_category: null })
      .eq('id', surveyId);
      
    if (updateError) {
      console.error("Error clearing active_category:", updateError);
      return json({ 
        success: false, 
        message: `Error clearing active_category: ${updateError.message}` 
      }, { status: 500 });
    }
    
    // Step 2: Delete survey_responses that reference this survey
    console.log("Deleting survey_responses...");
    const { error: responsesError } = await supabase
      .from('survey_responses')
      .delete()
      .eq('survey_id', surveyId);
    
    if (responsesError) {
      console.log("Note: Error deleting survey_responses:", responsesError.message);
      // Continue anyway, as the error might be that the table doesn't exist
    }
    
    // Step 3: Get all categories for this survey
    console.log("Fetching categories...");
    const { data: categories, error: catFetchError } = await supabase
      .from('categories')
      .select('id')
      .eq('survey_id', surveyId);
    
    if (catFetchError) {
      console.error("Error fetching categories:", catFetchError);
      return json({ 
        success: false, 
        message: `Error fetching categories: ${catFetchError.message}` 
      }, { status: 500 });
    }
    
    const categoryIds = categories?.map(c => c.id) || [];
    console.log(`Found ${categoryIds.length} categories`);
    
    // Step 4: Delete category_submissions for these categories
    if (categoryIds.length > 0) {
      console.log("Deleting category_submissions...");
      const { error: catSubmissionsError } = await supabase
        .from('category_submissions')
        .delete()
        .in('category_id', categoryIds);
      
      if (catSubmissionsError) {
        console.log("Note: Error deleting category_submissions:", catSubmissionsError.message);
        // Continue anyway
      }
    }
    
    // Step 5: Process each category
    for (const categoryId of categoryIds) {
      console.log(`Processing category ${categoryId}`);
      
      // Get questions for this category
      const { data: questions, error: questFetchError } = await supabase
        .from('questions')
        .select('id')
        .eq('category_id', categoryId);
      
      if (questFetchError) {
        console.error(`Error fetching questions for category ${categoryId}:`, questFetchError);
        continue; // Try the next category
      }
      
      const questionIds = questions?.map(q => q.id) || [];
      console.log(`Found ${questionIds.length} questions for category ${categoryId}`);
      
      if (questionIds.length > 0) {
        // Delete options for each question
        console.log("Deleting options...");
        try {
          const { error: optionsError } = await supabase
            .from('options')
            .delete()
            .in('question_id', questionIds);
          
          if (optionsError) {
            console.log("Note: Error deleting options:", optionsError.message);
          }
        } catch (err) {
          console.log("Caught error deleting options:", err);
        }
        
        // Delete answers for each question
        console.log("Deleting answers...");
        try {
          const { error: answersError } = await supabase
            .from('answers')
            .delete()
            .in('question_id', questionIds);
          
          if (answersError) {
            console.log("Note: Error deleting answers:", answersError.message);
          }
        } catch (err) {
          console.log("Caught error deleting answers:", err);
        }
        
        // Delete any remaining survey_responses that reference these questions
        try {
          const { error: questResponsesError } = await supabase
            .from('survey_responses')
            .delete()
            .in('question_id', questionIds);
            
          if (questResponsesError) {
            console.log("Note: Error deleting question survey_responses:", questResponsesError.message);
          }
        } catch (err) {
          console.log("Caught error deleting question survey_responses:", err);
        }
      }
      
      // Delete questions for this category
      console.log(`Deleting questions for category ${categoryId}`);
      const { error: questionsDelError } = await supabase
        .from('questions')
        .delete()
        .eq('category_id', categoryId);
      
      if (questionsDelError) {
        console.error(`Error deleting questions for category ${categoryId}:`, questionsDelError);
        console.log("Continuing anyway to try to clean up as much as possible...");
      }
    }
    
    // Delete all categories at once now
    if (categoryIds.length > 0) {
      console.log("Deleting all categories...");
      const { error: catDelError } = await supabase
        .from('categories')
        .delete()
        .in('id', categoryIds);
      
      if (catDelError) {
        console.error("Error deleting categories:", catDelError);
        return json({ 
          success: false, 
          message: `Failed to delete categories: ${catDelError.message}` 
        }, { status: 500 });
      }
    }
    
    // Finally delete the survey
    console.log("Deleting survey...");
    const { error: surveyDeleteError } = await supabase
      .from('surveys')
      .delete()
      .eq('id', surveyId);
      
    if (surveyDeleteError) {
      console.error("Error deleting survey:", surveyDeleteError);
      return json({ 
        success: false, 
        message: `Failed to delete survey: ${surveyDeleteError.message}` 
      }, { status: 500 });
    }

    console.log("Survey deleted successfully");
    return json({ success: true });
  } catch (error) {
    console.error("Error in delete survey action:", error);
    return json({ 
      success: false, 
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 });
  }
}; 