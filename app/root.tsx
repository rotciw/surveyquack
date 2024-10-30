import type { LinksFunction, LoaderFunction } from "@remix-run/cloudflare";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  useLocation,
  useLoaderData
} from "@remix-run/react";
import { Header } from "~/components/Header";
import { json } from "@remix-run/cloudflare";
import { getSession } from "~/utils/session.server";

import "./tailwind.css";

type LoaderData = {
  user: { id: string } | null;
};

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" },
];

export const loader: LoaderFunction = async ({ request, context }) => {
  const session = await getSession(context, request.headers.get("Cookie"));
  const user = session.get("user");
  return json<LoaderData>({ user });
};

export function Layout({ children }: { children: React.ReactNode }) {
  try {
    const { user } = useLoaderData<LoaderData>();
    const location = useLocation();
    
    const isSurveyTaker = location.pathname.includes('/survey/') && 
                          !location.pathname.includes('/stats') && 
                          !location.pathname.includes('/manage');

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body>
          {!isSurveyTaker && <Header user={user || undefined} />}
          {children}
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    );
  } catch {
    // Fallback layout for error cases
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    );
  }
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Oops! Something went wrong</h1>
            <p className="mt-2 text-gray-600">Please try again later</p>
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
