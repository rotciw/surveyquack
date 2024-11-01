import type { LoaderFunction } from "@remix-run/cloudflare";
import { getSupabaseClient } from "~/utils/supabase.server";

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const { surveyId } = params;
  const supabase = getSupabaseClient(context);

  if (!surveyId) throw new Error("Survey ID is required");

  const { data: survey, error } = await supabase
    .from('surveys')
    .select('status')
    .eq('id', surveyId)
    .single();

  if (error) throw new Error(error.message);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendStatus = (status: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(status)}\n\n`));
      };

      // Send initial status
      if (survey?.status) {
        sendStatus(survey.status as string);
      }

      // Subscribe to changes
      const subscription = supabase
        .channel(`survey-status-${surveyId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'surveys',
          filter: `id=eq.${surveyId}`,
        }, (payload) => {
          if (payload.new.status) {
            sendStatus(payload.new.status);
          }
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