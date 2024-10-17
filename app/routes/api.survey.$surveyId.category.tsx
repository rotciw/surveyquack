import type { LoaderFunction } from "@remix-run/cloudflare";
import { supabase } from "~/utils/supabase.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const { surveyId } = params;

  return new Response(
    new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const sendCategory = (categoryId: string) => {
          controller.enqueue(encoder.encode(`data: ${categoryId}\n\n`));
        };

        const { data: categories, error } = await supabase
          .from('categories')
          .select('id')
          .eq('survey_id', surveyId);

        if (error) {
          controller.error(error);
          return;
        }

        if (categories && categories.length > 0) {
          sendCategory(categories[0].id);
        }

        // Keep the connection open
        setInterval(() => {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        }, 15000);
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