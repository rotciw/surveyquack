import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { getSupabaseClient } from "~/utils/supabase.server";

export const loader: LoaderFunction = async ({ params, context }) => {
  const { surveyId } = params;
  const supabase = getSupabaseClient(context);

  if (!surveyId) throw new Error("Survey ID is required");

  const { data: survey, error } = await supabase
    .from('surveys')
    .select('active_category')
    .eq('id', surveyId)
    .single();

  if (error) throw new Error(error.message);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendCategory = (categoryId: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(categoryId)}\n\n`));
      };

      if (survey?.active_category) {
        sendCategory(String(survey.active_category));
      }

      const subscription = supabase
        .channel(`survey-${surveyId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'surveys',
          filter: `id=eq.${surveyId}`,
        }, (payload) => {
          if (payload.new.active_category) {
            sendCategory(String(payload.new.active_category));
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            controller.enqueue(encoder.encode(": connected\n\n"));
          }
        });

      const keepalive = setInterval(() => {
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, 5000);

      return () => {
        clearInterval(keepalive);
        subscription.unsubscribe();
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
};

export const action: ActionFunction = async ({ request, params, context }) => {
  if (request.method === "DELETE") {
    const { surveyId } = params;
    const formData = await request.formData();
    const categoryId = formData.get("categoryId") as string;
    const supabase = getSupabaseClient(context);

    // First delete all questions in the category
    const { error: questionsError } = await supabase
      .from('questions')
      .delete()
      .eq('category_id', categoryId);

    if (questionsError) throw new Error(questionsError.message);

    // Then delete the category
    const { error: categoryError } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('survey_id', surveyId);

    if (categoryError) throw new Error(categoryError.message);
    
    return json({ success: true });
  }
  throw new Error("Method not allowed");
};