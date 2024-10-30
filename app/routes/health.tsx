import { json, type LoaderFunction } from "@remix-run/cloudflare";

export const loader: LoaderFunction = async ({ request, context }) => {
  try {
    // Log everything we can about the request and context
    console.log('Health check details:', {
      request: {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries())
      },
      context: {
        hasContext: !!context,
        contextKeys: Object.keys(context || {}),
        hasEnv: !!context.env,
        envKeys: context.env ? Object.keys(context.env) : [],
        hasCloudflare: !!context.cloudflare
      }
    });

    // Try different response methods to see which one works
    try {
      // Method 1: Using json helper
      return json({ status: 'ok' });
    } catch (error1) {
      console.error('json helper failed:', error1);
      
      try {
        // Method 2: Direct Response
        return new Response('OK', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      } catch (error2) {
        console.error('direct Response failed:', error2);
        
        // Method 3: Bare minimum
        return new Response('OK');
      }
    }
  } catch (error) {
    console.error('Health check error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error
    });
    
    // Try a minimal error response
    return new Response('Error in health check', { status: 500 });
  }
};

// Minimal component
export default function Health() {
  return null;
}

// Add error boundary
export function ErrorBoundary() {
  console.error('Health check error boundary triggered');
  return <div>Error in health check</div>;
} 