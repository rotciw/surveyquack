/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import type { EntryContext } from "@remix-run/cloudflare";
import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  try {
    console.log('Starting render');
    
    const markup = renderToString(
      <RemixServer context={remixContext} url={request.url} />
    );
    
    console.log('Render completed');

    responseHeaders.set("Content-Type", "text/html");

    return new Response(`<!DOCTYPE html>${markup}`, {
      status: responseStatusCode,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Render error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>Server Error</h1>
          <pre>${error instanceof Error ? error.stack : 'Unknown error'}</pre>
        </body>
      </html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}
