import type { LoaderFunction } from "@remix-run/cloudflare";
import { getSupabaseClient } from "~/utils/supabase.server";

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const { surveyId } = params;
  const supabase = getSupabaseClient(context);

  if (!surveyId) throw new Error("Survey ID is required");
  return new Response(
    new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const sendCategory = (categoryId: string) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(categoryId)}\n\n`));
        };

        // Initial active category
        const { data: survey, error } = await supabase
          .from('surveys')
          .select('active_category')
          .eq('id', surveyId)
          .single();

        if (error) {
          controller.error(error);
          return;
        }

        if (survey?.active_category) {
          sendCategory(String(survey.active_category));
        }

        // Subscribe to changes
        const subscription = supabase
          .channel(`survey-${surveyId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'surveys',
              filter: `id=eq.${surveyId}`,
            },
            (payload) => {
              if (payload.new.active_category) {
                sendCategory(String(payload.new.active_category));
              }
            }
          )
          .subscribe();

        // Keep the connection open
        const keepalive = setInterval(() => {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        }, 15000);

        return () => {
          clearInterval(keepalive);
          subscription.unsubscribe();
        };
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    }
  );
};