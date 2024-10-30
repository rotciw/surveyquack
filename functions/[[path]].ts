import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "../build/server";

const MIME_TYPES: Record<string, string> = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
};

export const onRequest = async (context: any) => {
  const url = new URL(context.request.url);
  
  if (url.pathname.startsWith('/assets/')) {
    const response = await context.env.ASSETS.fetch(context.request);
    const ext = url.pathname.match(/\.[^.]*$/)?.[0] || '';
    const headers = new Headers(response.headers);
    headers.set('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    
    return new Response(response.body, {
      status: response.status,
      headers
    });
  }

  const handler = createPagesFunctionHandler({
    build,
    mode: process.env.NODE_ENV,
    getLoadContext: (context) => ({
      env: context.env,
      cloudflare: context
    })
  });

  return handler(context);
};
