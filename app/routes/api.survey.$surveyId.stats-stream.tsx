import { LoaderFunction } from "@remix-run/cloudflare";
import { getSupabaseClient } from "~/utils/supabase.server";

export const loader: LoaderFunction = async ({ params, context }) => {
  const { surveyId } = params;
  const supabase = getSupabaseClient(context);

  if (!surveyId) throw new Error("Survey ID is required");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendStats = async () => {
        const { data: responses } = await supabase
          .from('survey_responses')
          .select('question_id, answer_value, taker_id')
          .eq('survey_id', surveyId);

        controller.enqueue(encoder.encode(`data: ${JSON.stringify(responses)}\n\n`));
      };

      // Send initial stats
      await sendStats();

      // Subscribe to changes
      const subscription = supabase
        .channel(`survey-responses-${surveyId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'survey_responses',
          filter: `survey_id=eq.${surveyId}`,
        }, async () => {
          await sendStats();
        })
        .subscribe();

      // Keep connection alive
      const keepalive = setInterval(() => {
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, 15000);

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