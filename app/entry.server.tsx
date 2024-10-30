/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import type { AppLoadContext, EntryContext } from "@remix-run/cloudflare";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";

const ABORT_DELAY = 5000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext
) {
  try {
    if (!loadContext.env) {
      console.error('LoadContext env is missing:', loadContext);
      throw new Error('Missing environment configuration');
    }

    if (!loadContext.cloudflare?.env) {
      console.error('Cloudflare env is missing:', loadContext.cloudflare);
      throw new Error('Missing Cloudflare environment configuration');
    }

    // Log environment variables (be careful with sensitive data in production)
    console.log('Environment check:', {
      hasSupabaseUrl: !!loadContext.cloudflare.env.SUPABASE_URL,
      hasSupabaseKey: !!loadContext.cloudflare.env.SUPABASE_ANON_KEY,
      hasSessionSecret: !!loadContext.cloudflare.env.SESSION_SECRET,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ABORT_DELAY);

    const body = await renderToReadableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        signal: controller.signal,
        onError(error: unknown) {
          if (!controller.signal.aborted) {
            // Log streaming rendering errors from inside the shell
            console.error(error);
          }
          responseStatusCode = 500;
        },
      }
    );

    body.allReady.then(() => clearTimeout(timeoutId));

    if (isbot(request.headers.get("user-agent") || "")) {
      await body.allReady;
    }

    responseHeaders.set("Content-Type", "text/html");

    if (!loadContext.env) {
      loadContext.env = loadContext.cloudflare.env;
    }

    return new Response(body, {
      headers: responseHeaders,
      status: responseStatusCode,
    });
  } catch (error) {
    console.error('Critical error in handleRequest:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
