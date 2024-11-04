import { Link, Form, useLoaderData, useRouteError } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/cloudflare";
import { getSession } from "~/utils/session.server";
import { useState } from "react";
import { Logo } from "~/components/Logo";

interface LoaderData {
  user: any;
  duckGifs: any[];
}

export const loader: LoaderFunction = async ({ request, context }) => {
  const session = await getSession(context, request.headers.get("Cookie"));
  const user = session.get("user");
  const duckGifs = [
    { id: 1, url: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExYW5zcXF6aTg3aWpwZWR1YWU4aHh5amJtdXBycjkzczhzNjRocHN0OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/b9QBHfcNpvqDK/giphy.gif' },
    { id: 2, url: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2prNG9zNGh6NHZ3ZHU4M3Bkamlod254NXdsb2g5cDBzMnRmdXR0eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3fBRRVKceVngI/giphy-downsized.gif' },
    { id: 3, url: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGxmNWlla291ZTdobnRpOXoyM295dHltdHF0ZzB0YjZ6Nmd6dnA4bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/qos53YRJK2hh0aOaSh/giphy.gif' },
  ];
  return json({ user, duckGifs });
};

export default function Index() {
  const { user, duckGifs } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl lg:text-7xl">
            Surveys that make you go{" "}
            <span className="text-orange-500">QUACK!</span>
          </h1>
          <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
            Waddle into the future of feedback! Our duck-powered surveys make collecting responses 
            as smooth as a duck gliding on water. 🦆
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-10 flex justify-center gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
              >
                Hatch Your Survey
              </Link>
            ) : (
              <Form action="/auth/google" method="post">
                <button
                  type="submit"
                  className="px-8 py-4 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
                >
                  Join the Flock
                </button>
              </Form>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-16">Why Our Ducks Are Different</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Duck-Simple Creation</h3>
            <p className="text-gray-600">Build surveys faster than a duck can swim! Our intuitive interface makes survey creation a breeze.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Bird's Eye Analytics</h3>
            <p className="text-gray-600">Watch your responses flock in with real-time analytics that'll make your feathers flutter!</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Watertight Security</h3>
            <p className="text-gray-600">Your data is as safe as a duck in its nest, protected by enterprise-grade security</p>
          </div>
        </div>
      </div>

      {/* Duck Animation Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Meet Your New Survey Squad!</h2>
          <p className="text-xl text-gray-600 mb-12">These happy ducks are ready to make your surveys spectacular</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch justify-center max-w-4xl mx-auto">
            {duckGifs.map((gif) => (
              <div 
                key={gif.id} 
                className="rounded-lg overflow-hidden shadow-lg aspect-square bg-white"
              >
                <img 
                  src={gif.url} 
                  alt="Duck GIF"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <p className="mt-8 text-xl text-gray-600">
            Don't just take surveys - make them QUACK! 🦆
          </p>
          <p className="mt-4 text-lg text-gray-500">
            Join thousands of happy ducks who've already made the switch!
          </p>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-orange-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Make a Splash?</h2>
          <p className="text-xl mb-8">Get your first survey floating in minutes!</p>
          {!user && (
            <Form action="/auth/google" method="post">
              <button
                type="submit"
                className="px-8 py-4 bg-white text-orange-500 rounded-full font-medium hover:bg-gray-100 transition-colors"
              >
                Start Your Duck Journey
              </button>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error('Index route error:', error);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">Oops! Something went wrong</h1>
        <p className="mt-2 text-gray-600">Please try again later</p>
      </div>
    </div>
  );
}