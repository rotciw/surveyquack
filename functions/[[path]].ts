import { createRequestHandler } from "@remix-run/cloudflare";
import * as build from "../build/server";

export const onRequest = createRequestHandler({
  build,
  mode: process.env.NODE_ENV ?? "development",
  getLoadContext: (context) => ({
    env: context.env,
    cloudflare: context
  })
});
