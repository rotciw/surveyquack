import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "../build/server";

export const onRequest = async (context: any) => {
  try {
    const handler = createPagesFunctionHandler({
      build,
      mode: "production",
      getLoadContext: (context) => {
        try {
          return {
            env: context.env,
            cloudflare: context
          };
        } catch (error) {
          console.error("Load context error:", error);
          throw error;
        }
      }
    });

    try {
      const response = await handler(context);
      
      if (!response.ok) {
        const clone = response.clone();
        const text = await clone.text();
        console.error("Response error:", {
          status: response.status,
          text,
          headers: Object.fromEntries(response.headers.entries())
        });
      }

      return response;
    } catch (error) {
      console.error("Handler error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Top level error:", error);
    
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>Server Error</h1>
          <pre>${error instanceof Error ? error.stack : String(error)}</pre>
        </body>
      </html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      }
    );
  }
};
