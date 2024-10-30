import type { ServerBuild } from "@remix-run/cloudflare";
import { createRequestHandler } from "@remix-run/cloudflare";
import * as build from "../build/server";

export const onRequest = createRequestHandler(
  build as unknown as ServerBuild
);
